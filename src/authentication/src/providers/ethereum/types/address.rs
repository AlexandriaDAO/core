/// Ethereum address type with comprehensive validation and EIP-55 checksumming
///
/// This module provides a type-safe Ethereum address implementation that:
/// - Validates address format (0x prefix, length, hex characters)
/// - Implements EIP-55 checksumming for security
/// - Provides normalization and conversion utilities
/// - Integrates with Candid for IC serialization
use candid::{CandidType, Deserialize};
use k256::ecdsa::VerifyingKey;
use serde::Serialize;
use sha3::{Digest, Keccak256};
use std::fmt;
use tiny_keccak::{Hasher, Keccak};

use crate::core::error::AuthError;
use crate::core::{crypto::hash_with_domain, error::AuthResult};

use super::constants::{ADDRESS_BYTES_LENGTH, ADDRESS_LENGTH, ADDRESS_PREFIX};

//===================================================================================================
// ETHEREUM ADDRESS TYPE
//===================================================================================================

/// Type-safe Ethereum address with validation and mandatory EIP-55 checksumming
///
/// Ensures all addresses are properly formatted and consistently checksummed.
/// Always stores addresses in EIP-55 checksummed format for security.
///
/// Usage examples:
/// ```rust
/// // Create from any valid hex address (auto-checksums)
/// let addr = ETHAddress::new("0x55e7ff3c9c89d27d43a6272ac68609f968550c17")?;
/// let addr = ETHAddress::new("0x55E7Ff3c9c89d27D43a6272AC68609f968550C17")?;
///
/// // Static validation and checksumming
/// ETHAddress::validate("0x55e7ff3c9c89d27d43a6272ac68609f968550c17")?;
/// let checksummed = ETHAddress::checksum("0x55e7ff3c9c89d27d43a6272ac68609f968550c17")?;
///
/// // Get different representations
/// println!("{}", addr.as_str());          // "0x55e7Ff3c9c89d27D43a6272AC68609f968550C17"
/// println!("{:?}", addr.as_bytes());       // Ok([85, 231, 255, ...])
/// println!("{}", addr.to_lowercase());     // "0x55e7ff3c9c89d27d43a6272ac68609f968550c17"
/// ```
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub struct ETHAddress(
    /// The address string, always EIP-55 checksummed and 0x-prefixed after validation
    String,
);

//===================================================================================================
// STABLE STORAGE COMPATIBILITY
//===================================================================================================

/// Implement Storable trait for stable storage compatibility
impl ic_stable_structures::Storable for ETHAddress {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        candid::encode_one(self)
            .expect("Failed to serialize ETHAddress: should never fail for valid addresses")
            .into()
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes)
            .expect("Failed to deserialize ETHAddress: stable storage may be corrupted")
    }

    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(&self)
            .expect("Failed to serialize ETHAddress: should never fail for valid addresses")
    }

    const BOUND: ic_stable_structures::storable::Bound =
        ic_stable_structures::storable::Bound::Unbounded;
}

//===================================================================================================
// ADDRESS CREATION AND VALIDATION
//===================================================================================================

impl ETHAddress {
    /// Create a new ETHAddress from any valid hex address (most flexible)
    ///
    /// Accepts both checksummed and non-checksummed addresses.
    /// Automatically validates format and applies EIP-55 checksumming.
    /// This is the primary method for creating addresses from user input.
    ///
    /// Usage: For all address creation (user input, APIs, etc.)
    /// ```rust
    /// let addr = ETHAddress::new("0x55e7ff3c9c89d27d43a6272ac68609f968550c17")?; // ✅ Works
    /// let addr = ETHAddress::new("0x55E7Ff3c9c89d27D43a6272AC68609f968550C17")?; // ✅ Works
    /// ```
    pub fn new(address: &str) -> AuthResult<Self> {
        // Comprehensive format validation (hex, length, prefix)
        Self::validate(address)?;

        // Always store as EIP-55 checksummed address
        let checksummed = Self::checksum(address)?;

        Ok(Self(checksummed))
    }

    /// Validate Ethereum address format (hexadecimal validation)
    ///
    /// Validates that the address is proper hexadecimal format:
    /// - Must start with '0x' prefix
    /// - Must be exactly 42 characters (0x + 40 hex chars)
    /// - All characters after 0x must be valid hexadecimal (0-9, a-f, A-F)
    ///
    /// Usage: Pre-validation before expensive operations
    /// ```rust
    /// ETHAddress::validate("0x123")?; // Returns error (too short)
    /// ETHAddress::validate("0x55e7ff3c9c89d27d43a6272ac68609f968550c17")?; // OK
    /// ```
    pub fn validate(address: &str) -> AuthResult<()> {
        // Must start with 0x
        if !address.starts_with(ADDRESS_PREFIX) {
            return Err(AuthError::AddressFormatError(
                "Address must start with '0x'".to_string(),
            ));
        }

        // Must be exactly 42 characters (0x + 40 hex chars)
        if address.len() != ADDRESS_LENGTH {
            return Err(AuthError::AddressFormatError(format!(
                "Address must be exactly {} characters long",
                ADDRESS_LENGTH
            )));
        }

        // All characters after 0x must be valid hexadecimal
        let hex_part = &address[2..];
        if !hex_part.chars().all(|c| c.is_ascii_hexdigit()) {
            return Err(AuthError::AddressFormatError(
                "Address contains invalid hexadecimal characters".to_string(),
            ));
        }

        Ok(())
    }

    /// Create an ETHAddress from an ECDSA public key
    ///
    /// Derives an Ethereum address from a public key using standard cryptography:
    /// 1. Take uncompressed public key bytes (remove 0x04 prefix)
    /// 2. Hash with Keccak256
    /// 3. Take last 20 bytes as address
    /// 4. Apply EIP-55 checksumming
    ///
    /// Usage: When recovering addresses from signatures
    /// ```rust
    /// let verifying_key = // ... from signature recovery
    /// let address = ETHAddress::from_public_key(&verifying_key)?;
    /// ```
    pub fn from_public_key(key: &VerifyingKey) -> AuthResult<Self> {
        // Get uncompressed public key bytes (remove first byte which is 0x04)
        let encoded_point = key.to_encoded_point(false);
        let public_key_bytes = &encoded_point.as_bytes()[1..];

        // Hash with Keccak256 (Ethereum's address derivation method)
        let mut keccak256 = [0; 32];
        let mut hasher = Keccak::v256();
        hasher.update(public_key_bytes);
        hasher.finalize(&mut keccak256);

        // Take last 20 bytes and convert to hex address
        let address_bytes = &keccak256[12..];
        let address_hex = hex::encode(address_bytes);
        let address_with_prefix = format!("0x{}", address_hex);

        // Create ETHAddress (new() already normalizes to lowercase)
        Self::new(&address_with_prefix)
    }
}

//===================================================================================================
// ADDRESS ACCESS AND CONVERSION
//===================================================================================================

impl ETHAddress {
    /// Get the address as a string slice (always lowercase, 0x-prefixed)
    ///
    /// Usage: When you need the address as a string for API calls, logging, etc.
    /// ```rust
    /// let addr_str = addr.as_str(); // "0x55e7ff3c9c89d27d43a6272ac68609f968550c17"
    /// ```
    pub fn as_str(&self) -> &str {
        &self.0
    }

    /// Convert the address to a 20-byte array
    ///
    /// Usage: When you need raw bytes for cryptographic operations
    /// ```rust
    /// let bytes: [u8; 20] = addr.as_bytes()?;
    /// ```
    pub fn as_bytes(&self) -> AuthResult<[u8; 20]> {
        let hex_part = &self.0[2..]; // Remove 0x prefix
        let bytes = hex::decode(hex_part)?;

        if bytes.len() != ADDRESS_BYTES_LENGTH {
            return Err(AuthError::ValidationError(
                "Address decode resulted in wrong byte length".to_string(),
            ));
        }

        let mut array = [0u8; ADDRESS_BYTES_LENGTH];
        array.copy_from_slice(&bytes);
        Ok(array)
    }

    /// Get the address in lowercase format
    ///
    /// Usage: For consistent storage keys, comparisons
    /// ```rust
    /// let lower = addr.to_lowercase(); // "0x55e7ff3c9c89d27d43a6272ac68609f968550c17"
    /// ```
    pub fn to_lowercase(&self) -> String {
        self.0.to_lowercase() // Convert from checksummed to lowercase
    }

    /// Verify this address matches another ETHAddress (case-insensitive)
    ///
    /// Returns Ok(()) if addresses match, or SignatureInvalid error if they don't.
    /// This is useful for signature verification where mismatched addresses
    /// indicate invalid signatures.
    ///
    /// Usage: Signature verification in authentication flow
    /// ```rust
    /// recovered_address.matches(&expected_address)?; // Propagates error if mismatch
    /// ```
    pub fn matches(&self, other: &ETHAddress) -> AuthResult<()> {
        if self.0 == other.0 {
            Ok(())
        } else {
            Err(AuthError::SignatureInvalidError(
                "Address mismatch: signature verification failed".to_string(),
            ))
        }
    }

    /// Verify this address matches a string address (case-insensitive)
    ///
    /// Returns Ok(()) if addresses match, or error if they don't.
    /// Convenience method for verifying against string addresses.
    ///
    /// Usage: Signature verification with string addresses
    /// ```rust
    /// recovered_address.matches_str("0x55E7Ff3c9c89d27D43a6272AC68609f968550C17")?;
    /// ```
    pub fn matches_str(&self, other: &str) -> AuthResult<()> {
        let other_addr = Self::new(other)?;
        self.matches(&other_addr)
    }

    /// Get the cryptographic seed for this address
    ///
    /// Creates a unique 32-byte seed by combining this address with the provided salt
    /// and applying domain-separated hashing. This seed is used as a key for signature
    /// map storage and delegation operations.
    ///
    /// Usage: As signature map key for storing delegations
    /// ```rust
    /// let settings = EthereumSettings::get();
    /// let seed = address.as_seed(&settings.salt);
    /// signature_map.put(seed, delegation_hash);
    /// ```
    pub fn as_seed(&self, salt: &str) -> [u8; 32] {
        let address_with_salt = format!("{}:{}", self.0, salt);
        hash_with_domain(b"ETHEREUM_SIWE_SEED_v1", address_with_salt.as_bytes())
    }
}

//===================================================================================================
// EIP-55 CHECKSUMMING IMPLEMENTATION
//===================================================================================================

impl ETHAddress {
    /// Apply EIP-55 checksumming to any address string
    ///
    /// Applies EIP-55 mixed-case checksumming for security.
    /// Works on both checksummed and non-checksummed addresses.
    /// The checksum helps prevent address typos by encoding verification in the case.
    ///
    /// Usage: Static method for checksumming any address
    /// ```rust
    /// let checksummed = ETHAddress::checksum("0x55e7ff3c9c89d27d43a6272ac68609f968550c17")?;
    /// // Returns: "0x55e7Ff3c9c89d27D43a6272AC68609f968550C17"
    /// ```
    pub fn checksum(address: &str) -> AuthResult<String> {
        // Work with lowercase version (remove 0x prefix)
        let address_lower = address[2..].to_lowercase();

        // Hash the lowercase address
        let mut hasher = Keccak256::new();
        hasher.update(address_lower.as_bytes());
        let hash = hasher.finalize();

        // Apply checksum: uppercase if corresponding hash nibble >= 8
        let checksummed: String = address_lower
            .char_indices()
            .map(|(i, c)| {
                if c.is_ascii_digit() {
                    // Keep digits as-is
                    c
                } else {
                    // For hex letters, check hash nibble
                    let hash_nibble = if i % 2 == 0 {
                        (hash[i / 2] >> 4) & 0x0f
                    } else {
                        hash[i / 2] & 0x0f
                    };

                    if hash_nibble >= 8 {
                        c.to_ascii_uppercase()
                    } else {
                        c.to_ascii_lowercase()
                    }
                }
            })
            .collect();

        Ok(format!("0x{}", checksummed))
    }
}

//===================================================================================================
// DISPLAY AND SERIALIZATION
//===================================================================================================

impl fmt::Display for ETHAddress {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Parse address from string using the `.parse()` method
///
/// This trait enables the convenient `.parse()` syntax for string-to-address conversion.
/// Internally uses the same validation as `new()` but fits Rust's standard parsing patterns.
///
/// Usage: When you want to parse a string literal or &str using `.parse()`
/// ```rust
/// let addr: ETHAddress = "11111111111111111111111111111112".parse()?;
/// let addr = address_str.parse::<ETHAddress>()?;
/// ```
impl std::str::FromStr for ETHAddress {
    type Err = AuthError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::new(s)
    }
}

/// Convert from string - uses normalized creation
///
/// Usage: Convenient conversion from strings
/// ```rust
/// let addr: ETHAddress = "0x55e7ff3c9c89d27d43a6272ac68609f968550c17".try_into()?;
/// ```
impl TryFrom<&str> for ETHAddress {
    type Error = AuthError;

    fn try_from(address: &str) -> Result<Self, Self::Error> {
        Self::new(address)
    }
}

/// Convert from String - uses normalized creation
///
/// Usage: Convenient conversion from owned strings
/// ```rust
/// let addr: ETHAddress = address_string.try_into()?;
/// ```
impl TryFrom<String> for ETHAddress {
    type Error = AuthError;

    fn try_from(address: String) -> Result<Self, Self::Error> {
        Self::new(&address)
    }
}
