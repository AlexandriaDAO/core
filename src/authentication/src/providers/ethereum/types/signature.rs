/// Ethereum signature type with professional ECDSA validation and recovery
///
/// This module provides a production-ready Ethereum signature implementation that:
/// - Uses industry-standard k256 crate for ECDSA operations
/// - Validates signature format and performs cryptographic verification
/// - Provides address recovery using other types' methods (clean separation)
/// - Integrates with Candid for IC serialization
use candid::{CandidType, Deserialize};
use k256::ecdsa::{RecoveryId, Signature, VerifyingKey};
use serde::Serialize;
use std::fmt;

use crate::core::error::{AuthError, AuthResult};

use super::address::ETHAddress;
use super::constants::{ADDRESS_PREFIX, SIGNATURE_BYTES_LENGTH, SIGNATURE_LENGTH};
use super::message::ETHMessage;

//===================================================================================================
// ETHEREUM SIGNATURE TYPE
//===================================================================================================

/// Type-safe Ethereum signature with professional ECDSA validation and recovery
///
/// Uses industry-standard cryptographic libraries for maximum security and compatibility.
/// Focuses purely on signature operations - delegates message hashing to ETHMessage
/// and address derivation to ETHAddress for clean separation of concerns.
///
/// Usage examples:
/// ```rust
/// // Create from signature string (validates automatically)
/// let sig = ETHSignature::new("0x1b2c3d...")?;
///
/// // Recover address from signature and message
/// let message = ETHMessage::new(address)?;
/// let recovered_addr = sig.recover_address(&message)?;
///
/// // Verify signature against known address
/// let is_valid = sig.verify(&message, &expected_address)?;
/// ```
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub struct ETHSignature(
    /// The signature string, always lowercase and 0x-prefixed after validation
    String,
);

//===================================================================================================
// SIGNATURE CREATION AND VALIDATION
//===================================================================================================

impl ETHSignature {
    /// Create a new ETHSignature with strict validation
    ///
    /// Validates signature format but does NOT perform cryptographic verification.
    /// The signature is normalized to lowercase for consistent storage.
    ///
    /// Usage: For signatures from user input or external sources
    /// ```rust
    /// let sig = ETHSignature::new("0x1b2c3d4e5f...")?;
    /// let sig = ETHSignature::new("0x1B2C3D4E5F...")?; // Also works, normalized to lowercase
    /// ```
    pub fn new(signature: &str) -> AuthResult<Self> {
        // Basic format validation
        Self::validate_format(signature)?;

        // Normalize to lowercase for consistent storage
        let normalized = signature.to_lowercase();

        Ok(Self(normalized))
    }

    /// Validate signature format without creating an instance
    ///
    /// Useful for validation without allocation.
    ///
    /// Usage: Pre-validation before expensive operations
    /// ```rust
    /// ETHSignature::validate_format("0x123")?; // Returns error
    /// ETHSignature::validate_format("0x1b2c3d...")?; // OK
    /// ```
    pub fn validate_format(signature: &str) -> AuthResult<()> {
        // Must start with 0x
        if !signature.starts_with(ADDRESS_PREFIX) {
            return Err(AuthError::SignatureInvalidError(
                "Signature must start with '0x'".to_string(),
            ));
        }

        // Must be exactly 132 characters (0x + 130 hex chars)
        if signature.len() != SIGNATURE_LENGTH {
            return Err(AuthError::SignatureInvalidError(format!(
                "Signature must be exactly {} characters long",
                SIGNATURE_LENGTH
            )));
        }

        // All characters after 0x must be valid hex
        let hex_part = &signature[2..];
        if !hex_part.chars().all(|c| c.is_ascii_hexdigit()) {
            return Err(AuthError::SignatureInvalidError(
                "Signature contains invalid hex characters".to_string(),
            ));
        }

        Ok(())
    }
}

//===================================================================================================
// SIGNATURE ACCESS AND CONVERSION
//===================================================================================================

impl ETHSignature {
    /// Convert the signature to a 65-byte array (r + s + v)
    ///
    /// Usage: When you need raw bytes for cryptographic operations
    /// ```rust
    /// let bytes: [u8; 65] = sig.as_bytes()?;
    /// let r = &bytes[0..32];   // r component
    /// let s = &bytes[32..64];  // s component
    /// let v = bytes[64];       // recovery id
    /// ```
    pub fn as_bytes(&self) -> AuthResult<[u8; 65]> {
        let hex_part = &self.0[2..]; // Remove 0x prefix
        let bytes = hex::decode(hex_part)?;

        if bytes.len() != SIGNATURE_BYTES_LENGTH {
            return Err(AuthError::SignatureInvalidError(
                "Signature decode resulted in wrong byte length".to_string(),
            ));
        }

        let mut array = [0u8; SIGNATURE_BYTES_LENGTH];
        array.copy_from_slice(&bytes);
        Ok(array)
    }

}

//===================================================================================================
// ECDSA RECOVERY AND VERIFICATION (Clean Implementation)
//===================================================================================================

impl ETHSignature {
    /// Recover the Ethereum address that created this signature
    ///
    /// Uses k256 crate's professional ECDSA recovery implementation.
    /// Delegates message hashing to ETHMessage and address derivation to ETHAddress
    /// for clean separation of concerns.
    ///
    /// Usage: Primary method for signature verification
    /// ```rust
    /// let message = ETHMessage::new(address)?;
    /// let recovered_address = signature.recover_address(&message)?;
    /// ```
    pub fn recover_address(&self, message: &ETHMessage) -> AuthResult<ETHAddress> {
        // Use ETHMessage's hashing method (EIP-191 standard)
        let message_hash = message.as_hash()?;

        // Get signature components
        let signature_bytes = self.as_bytes()?;

        // Extract recovery ID and convert to k256 format
        let recovery_id = RecoveryId::try_from(signature_bytes[64] % 27)
            .map_err(|_| AuthError::RecoveryFailedError("Invalid recovery ID".to_string()))?;

        // Create k256 signature from r and s components
        let signature = Signature::from_slice(&signature_bytes[..64])
            .map_err(|_| AuthError::RecoveryFailedError("Invalid signature format".to_string()))?;

        // Recover the public key using k256
        let verifying_key =
            VerifyingKey::recover_from_prehash(&message_hash, &signature, recovery_id).map_err(
                |_| AuthError::RecoveryFailedError("Public key recovery failed".to_string()),
            )?;

        // Use ETHAddress's derivation method (proper EIP-55 checksumming)
        ETHAddress::from_public_key(&verifying_key)
    }

}

//===================================================================================================
// DISPLAY AND SERIALIZATION
//===================================================================================================

impl fmt::Display for ETHSignature {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Convert from string - uses normalized creation
///
/// Usage: Convenient conversion from strings
/// ```rust
/// let sig: ETHSignature = "0x1b2c3d4e5f...".try_into()?;
/// ```
impl TryFrom<&str> for ETHSignature {
    type Error = AuthError;

    fn try_from(signature: &str) -> Result<Self, Self::Error> {
        Self::new(signature)
    }
}

/// Convert from String - uses normalized creation
///
/// Usage: Convenient conversion from owned strings
/// ```rust
/// let sig: ETHSignature = signature_string.try_into()?;
/// ```
impl TryFrom<String> for ETHSignature {
    type Error = AuthError;

    fn try_from(signature: String) -> Result<Self, Self::Error> {
        Self::new(&signature)
    }
}
