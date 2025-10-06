/// Arweave address type with comprehensive validation and RSA public key storage
///
/// This module provides a type-safe Arweave address implementation that:
/// - Validates address format (Base64URL encoding, correct length)
/// - Stores and validates RSA public keys that generate addresses
/// - Provides normalization and conversion utilities
/// - Integrates with Candid for IC serialization
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use candid::{CandidType, Deserialize};
use serde::Serialize;
use std::fmt;

use crate::core::error::AuthError;
use crate::core::{
    crypto::{hash_bytes, hash_with_domain},
    error::AuthResult,
};

use super::constants::{ADDRESS_BYTES_LENGTH, ADDRESS_LENGTH};

//===================================================================================================
// ARWEAVE ADDRESS TYPE
//===================================================================================================

/// Type-safe Arweave address with RSA public key validation
///
/// Stores both the Arweave address and the RSA public key that generates it.
/// Validates that the public key actually produces the provided address.
///
/// Arweave addresses are SHA-256 hashes of RSA public keys, encoded in Base64URL.
/// This struct ensures the relationship between address and public key is valid.
///
/// Usage examples:
/// ```rust
/// // Create from address and public key (validates they match)
/// let addr = ARAddress::new("1seRanklLU_1VTGkEk7P0xAwMJfA7owA1JHW5KyZKlY",
///                          "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...")?;
///
/// // Access components
/// println!("{}", addr.address());        // Base64URL address string
/// println!("{:?}", addr.public_key());   // RSA public key bytes
/// ```
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub struct ARAddress(
    /// The address string, always in Base64URL format after validation
    String,
    /// The RSA public key string in Base64URL format (~683 characters)
    String,
);

//===================================================================================================
// STABLE STORAGE COMPATIBILITY
//===================================================================================================

/// Implement Storable trait for stable storage compatibility
impl ic_stable_structures::Storable for ARAddress {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        candid::encode_one(self)
            .expect("Failed to serialize ARAddress: should never fail for valid addresses")
            .into()
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes)
            .expect("Failed to deserialize ARAddress: stable storage may be corrupted")
    }

    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(&self)
            .expect("Failed to serialize ARAddress: should never fail for valid addresses")
    }

    const BOUND: ic_stable_structures::storable::Bound =
        ic_stable_structures::storable::Bound::Unbounded;
}

//===================================================================================================
// ADDRESS CREATION AND VALIDATION
//===================================================================================================

impl ARAddress {
    /// Create a new ARAddress from address and public key with validation
    ///
    /// Validates address format and that the public key generates the provided address.
    ///
    /// # Arguments
    /// * `address` - Base64URL encoded Arweave address (43 characters)
    /// * `public_key` - Base64URL encoded RSA public key (~683 characters)
    ///
    /// # Usage
    /// ```rust
    /// let addr = ARAddress::new(
    ///     "1seRanklLU_1VTGkEk7P0xAwMJfA7owA1JHW5KyZKlY",
    ///     "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
    /// )?;
    /// ```
    pub fn new(address: &str, public_key: &str) -> AuthResult<Self> {
        // Validate address format (length, Base64URL encoding)
        Self::validate(address)?;

        // Generate address from public key and verify it matches
        let recovered_address = Self::recover(public_key)?;
        if recovered_address != address {
            return Err(AuthError::ValidationError(format!(
                "Public key does not generate the provided address. Expected: {}, Generated: {}",
                address, recovered_address
            )));
        }

        Ok(Self(address.to_string(), public_key.to_string()))
    }

    /// Validate an Arweave address format without creating an instance
    ///
    /// Checks that the address is properly formatted Base64URL and correct length.
    /// Useful for validation before creating instances or in validation chains.
    ///
    /// Usage: When you only need validation without creating an address
    /// ```rust
    /// ARAddress::validate("1seRanklLU_1VTGkEk7P0xAwMJfA7owA1JHW5KyZKlY")?; // ✅ Valid
    /// ```
    pub fn validate(address: &str) -> AuthResult<()> {
        // Check if address is empty
        if address.is_empty() {
            return Err(AuthError::AddressFormatError(
                "Address cannot be empty".to_string(),
            ));
        }

        // Check exact length (Base64URL encoding is fixed length for 32 bytes)
        if address.len() != ADDRESS_LENGTH {
            return Err(AuthError::AddressFormatError(format!(
                "Address must be exactly {} characters, got {}",
                ADDRESS_LENGTH,
                address.len()
            )));
        }

        // Decode Base64URL to verify format and get bytes
        let bytes = URL_SAFE_NO_PAD.decode(address).map_err(|e| {
            AuthError::AddressFormatError(format!("Invalid Base64URL encoding: {}", e))
        })?;

        // Check that decoded bytes are exactly 32 bytes (Arweave address size)
        if bytes.len() != ADDRESS_BYTES_LENGTH {
            return Err(AuthError::AddressFormatError(format!(
                "Address must be exactly {} bytes when decoded, got {}",
                ADDRESS_BYTES_LENGTH,
                bytes.len()
            )));
        }

        Ok(())
    }

    /// Recover address from RSA public key
    ///
    /// Generates Arweave address by taking SHA-256 hash of public key and encoding as Base64URL
    ///
    /// # Arguments
    /// * `public_key` - Base64URL encoded RSA public key string (~683 characters)
    ///
    /// # Usage
    /// ```rust
    /// let address = ARAddress::recover("MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...")?;
    /// assert_eq!(address.len(), 43); // Base64URL encoded 32-byte hash
    /// ```
    pub fn recover(public_key: &str) -> AuthResult<String> {
        // Decode public key from Base64URL to bytes
        let public_key_bytes = URL_SAFE_NO_PAD.decode(public_key).map_err(|e| {
            AuthError::AddressFormatError(format!("Invalid public key Base64URL: {}", e))
        })?;

        // Generate address from public key: SHA-256(public_key) -> Base64URL
        let hash_bytes = hash_bytes(&public_key_bytes);

        // Encode hash as Base64URL (43 characters)
        let address = URL_SAFE_NO_PAD.encode(&hash_bytes);
        Ok(address)
    }

    /// Get the address as a string slice (Base64URL format)
    ///
    /// Returns the stored Base64URL address string.
    /// This is the most common way to access the address value.
    ///
    /// # Usage
    /// ```rust
    /// let address_str = addr.address();
    /// println!("Arweave address: {}", address_str);
    /// ```
    pub fn address(&self) -> &str {
        &self.0
    }

    /// Get the RSA public key as a string slice (Base64URL format)
    ///
    /// Returns the stored Base64URL public key string.
    /// This key generates the associated address.
    ///
    /// # Usage
    /// ```rust
    /// let public_key_str = addr.public_key();
    /// println!("RSA public key: {}", public_key_str);
    /// ```
    pub fn public_key(&self) -> &str {
        &self.1
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
        hash_with_domain(b"ARWEAVE_SIWA_SEED_v1", combined.as_bytes())
    }
}

//===================================================================================================
// DISPLAY AND CONVERSION TRAITS
//===================================================================================================

impl fmt::Display for ARAddress {
    /// Display the address in Base64URL format
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

// Note: FromStr and TryFrom traits are not implemented because ARAddress
// requires both address and public key parameters. Use ARAddress::new(address, public_key) instead.
