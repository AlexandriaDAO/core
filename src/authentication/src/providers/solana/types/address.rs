/// Solana address type with comprehensive validation and Base58 encoding
///
/// This module provides a type-safe Solana address implementation that:
/// - Validates address format (Base58 encoding, correct length)
/// - Handles Ed25519 public keys (32 bytes)
/// - Provides normalization and conversion utilities
/// - Integrates with Candid for IC serialization
use candid::{CandidType, Deserialize};
use serde::Serialize;
use std::fmt;

use crate::core::error::AuthError;
use crate::core::{crypto::hash_with_domain, error::AuthResult};

use super::constants::{ADDRESS_BYTES_LENGTH, ADDRESS_LENGTH};

//===================================================================================================
// SOLANA ADDRESS TYPE
//===================================================================================================

/// Type-safe Solana address with validation and Base58 encoding
///
/// Ensures all addresses are properly formatted Solana public keys.
/// Stores addresses in Base58 format as used by Solana ecosystem.
///
/// Usage examples:
/// ```rust
/// // Create from valid Base58 address
/// let addr = SOLAddress::new("11111111111111111111111111111112")?;
/// let addr = SOLAddress::new("So11111111111111111111111111111111111111112")?;
///
/// // Get different representations
/// println!("{}", addr.as_str());          // Base58 string
/// println!("{:?}", addr.as_bytes());       // Ok([0, 0, 0, ...])
/// ```
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub struct SOLAddress(
    /// The address string, always in Base58 format after validation
    String,
);

//===================================================================================================
// STABLE STORAGE COMPATIBILITY
//===================================================================================================

/// Implement Storable trait for stable storage compatibility
impl ic_stable_structures::Storable for SOLAddress {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        candid::encode_one(self)
            .expect("Failed to serialize SOLAddress: should never fail for valid addresses")
            .into()
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes)
            .expect("Failed to deserialize SOLAddress: stable storage may be corrupted")
    }

    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(&self)
            .expect("Failed to serialize SOLAddress: should never fail for valid addresses")
    }

    const BOUND: ic_stable_structures::storable::Bound =
        ic_stable_structures::storable::Bound::Unbounded;
}

//===================================================================================================
// ADDRESS CREATION AND VALIDATION
//===================================================================================================

impl SOLAddress {
    /// Create a new SOLAddress from any valid Base58 address
    ///
    /// Validates format and ensures it's a proper Solana public key.
    /// This is the primary method for creating addresses from user input.
    ///
    /// Usage: For all address creation (user input, APIs, etc.)
    /// ```rust
    /// let addr = SOLAddress::new("11111111111111111111111111111112")?; // ✅ Works
    /// let addr = SOLAddress::new("So11111111111111111111111111111111111111112")?; // ✅ Works
    /// ```
    pub fn new(address: &str) -> AuthResult<Self> {
        // Comprehensive format validation
        Self::validate(address)?;

        Ok(Self(address.to_string()))
    }

    /// Validate a Solana address format without creating an instance
    ///
    /// Checks that the address is properly formatted Base58 and correct length.
    /// Useful for validation before creating instances or in validation chains.
    ///
    /// Usage: When you only need validation without creating an address
    /// ```rust
    /// SOLAddress::validate("11111111111111111111111111111112")?; // ✅ Valid
    /// ```
    pub fn validate(address: &str) -> AuthResult<()> {
        // Check if address is empty
        if address.is_empty() {
            return Err(AuthError::AddressFormatError(
                "Address cannot be empty".to_string(),
            ));
        }

        // Check maximum length (Base58 encoding can vary)
        if address.len() > ADDRESS_LENGTH {
            return Err(AuthError::AddressFormatError(format!(
                "Address too long: {} characters (max {})",
                address.len(),
                ADDRESS_LENGTH
            )));
        }

        // Decode Base58 to verify format and get bytes
        let bytes = bs58::decode(address).into_vec().map_err(|e| {
            AuthError::AddressFormatError(format!("Invalid Base58 encoding: {}", e))
        })?;

        // Check that decoded bytes are exactly 32 bytes (Ed25519 public key size)
        if bytes.len() != ADDRESS_BYTES_LENGTH {
            return Err(AuthError::AddressFormatError(format!(
                "Address must be exactly {} bytes when decoded, got {}",
                ADDRESS_BYTES_LENGTH,
                bytes.len()
            )));
        }

        Ok(())
    }

    /// Get the address as a string slice (Base58 format)
    ///
    /// Returns the stored Base58 address string.
    /// This is the most common way to access the address value.
    ///
    /// Usage: When you need the address as a string
    /// ```rust
    /// let address_str = addr.as_str();
    /// println!("Solana address: {}", address_str);
    /// ```
    pub fn as_str(&self) -> &str {
        &self.0
    }

    /// Convert address to raw bytes (32 bytes for Ed25519 public key)
    ///
    /// Decodes the Base58 address into its raw 32-byte representation.
    /// Useful for cryptographic operations and binary serialization.
    ///
    /// Usage: When you need the raw bytes for crypto operations
    /// ```rust
    /// let bytes = addr.as_bytes()?;
    /// assert_eq!(bytes.len(), 32);
    /// ```
    pub fn as_bytes(&self) -> AuthResult<[u8; 32]> {
        let bytes = bs58::decode(&self.0)
            .into_vec()
            .map_err(|e| AuthError::ValidationError(format!("Base58 decode failed: {}", e)))?;

        bytes.try_into().map_err(|_| {
            AuthError::ValidationError("Address bytes must be exactly 32 bytes".to_string())
        })
    }

    /// Generate a unique seed for this address using cryptographic salt
    ///
    /// Creates a deterministic 32-byte seed by combining the address with a salt.
    /// Uses domain separation to prevent collision attacks across different contexts.
    ///
    /// Usage: For generating user-specific seeds for IC principals
    /// ```rust
    /// let seed = addr.as_seed("my-salt-value");
    /// ```
    pub fn as_seed(&self, salt: &str) -> [u8; 32] {
        let combined = format!("{}{}", self.0, salt);
        hash_with_domain(b"SOLANA_SIWS_SEED_v1", combined.as_bytes())
    }

}

//===================================================================================================
// DISPLAY AND CONVERSION TRAITS
//===================================================================================================

impl fmt::Display for SOLAddress {
    /// Display the address in Base58 format
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
/// let addr: SOLAddress = "11111111111111111111111111111112".parse()?;
/// let addr = address_str.parse::<SOLAddress>()?;
/// ```
impl std::str::FromStr for SOLAddress {
    type Err = AuthError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::new(s)
    }
}

/// Convert from string slice using `.try_into()` method
///
/// This trait enables conversion from &str using the `.try_into()` syntax.
/// Useful when you want to convert a string slice in a functional programming style.
///
/// Usage: When converting string slices with `.try_into()`
/// ```rust
/// let addr: SOLAddress = "11111111111111111111111111111112".try_into()?;
/// let addr: Result<SOLAddress, _> = some_str_slice.try_into();
/// ```
impl TryFrom<&str> for SOLAddress {
    type Error = AuthError;

    fn try_from(address: &str) -> Result<Self, Self::Error> {
        Self::new(address)
    }
}

/// Convert from owned String using `.try_into()` method
///
/// This trait enables conversion from owned String using the `.try_into()` syntax.
/// Useful when you have an owned String and want to convert it without explicit borrowing.
///
/// Usage: When converting owned strings with `.try_into()`
/// ```rust
/// let address_string = get_address_from_somewhere();
/// let addr: SOLAddress = address_string.try_into()?;
/// let addr = user_input_string.try_into::<SOLAddress>()?;
/// ```
impl TryFrom<String> for SOLAddress {
    type Error = AuthError;

    fn try_from(address: String) -> Result<Self, Self::Error> {
        Self::new(&address)
    }
}
