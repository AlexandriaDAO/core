/// Solana signature type with professional Ed25519 validation
///
/// This module provides a production-ready Solana signature implementation that:
/// - Uses industry-standard ed25519-dalek crate for Ed25519 operations
/// - Validates signature format and performs cryptographic verification
/// - Works with Ed25519 signatures (64 bytes, no recovery needed)
/// - Integrates with Candid for IC serialization
///
/// KEY DIFFERENCES FROM ETHEREUM:
/// - Ed25519 signatures (64 bytes) vs ECDSA signatures (65 bytes)
/// - No address recovery possible - must verify against known public key
/// - Base58 encoding vs hex encoding
/// - No recovery ID needed (Ed25519 doesn't support recovery)
use candid::{CandidType, Deserialize};
use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use serde::Serialize;
use serde_bytes::ByteBuf;
use std::fmt;

use crate::core::error::{AuthError, AuthResult};

use super::constants::SIGNATURE_BYTES_LENGTH;
use super::message::SOLMessage;

//===================================================================================================
// SOLANA SIGNATURE TYPE
//===================================================================================================

/// Type-safe Solana signature with professional Ed25519 validation
///
/// Uses industry-standard cryptographic libraries for maximum security and compatibility.
/// Ed25519 signatures are deterministic and do not support address recovery like ECDSA.
/// Must verify against a known public key rather than recovering the signer.
///
/// Usage examples:
/// ```rust
/// // Create from signature string (Base58 or hex format)
/// let sig = SOLSignature::new("base58_signature_string")?;
///
/// // Verify signature against known address and message
/// let message = SOLMessage::new(address)?;
/// let is_valid = sig.verify(&message, &expected_address)?;
/// ```
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub struct SOLSignature(
    /// The signature bytes (64 bytes for Ed25519)
    ByteBuf,
);

//===================================================================================================
// SIGNATURE CREATION AND VALIDATION
//===================================================================================================

impl SOLSignature {
    /// Create a new SOLSignature directly from ByteBuf
    ///
    /// Takes signature bytes directly from frontend (Uint8Array -> ByteBuf).
    /// No string parsing needed - much simpler and more efficient.
    ///
    /// Usage: For signatures from Solana wallet
    /// ```rust
    /// let sig = SOLSignature::new(wallet_signature_bytebuf)?;
    /// ```
    pub fn new(signature: ByteBuf) -> AuthResult<Self> {
        // Validate Ed25519 signature length
        if signature.len() != SIGNATURE_BYTES_LENGTH {
            return Err(AuthError::SignatureInvalidError(format!(
                "Ed25519 signature must be exactly {} bytes, got {}",
                SIGNATURE_BYTES_LENGTH,
                signature.len()
            )));
        }

        Ok(Self(signature))
    }

    /// Convert signature to Base58 string (Solana standard format)
    ///
    /// Returns the signature in Base58 encoding as used by Solana ecosystem.
    ///
    /// Usage: When you need the signature as a string
    /// ```rust
    /// let sig_str = signature.to_base58();
    /// println!("Signature: {}", sig_str);
    /// ```
    pub fn to_base58(&self) -> String {
        bs58::encode(&self.0).into_string()
    }
}

//===================================================================================================
// CRYPTOGRAPHIC OPERATIONS
//===================================================================================================

impl SOLSignature {
    /// Verify signature against message and expected address
    ///
    /// **KEY DIFFERENCE FROM ETHEREUM**: Ed25519 does not support address recovery.
    /// We must verify against a known public key rather than recovering the signer.
    ///
    /// Usage: To verify a signature is valid for a given message and address
    /// ```rust
    /// let is_valid = signature.verify(&message, &expected_address)?;
    /// if is_valid {
    ///     println!("Signature is valid!");
    /// }
    /// ```
    pub fn verify(&self, message: &SOLMessage) -> AuthResult<bool> {
        // Step 1: Get the message bytes that were signed
        let message_bytes = message.to_siws().into_bytes();

        // Step 2: Get the public key from the expected address
        let address_bytes = message.address.as_bytes()?;

        let public_key = VerifyingKey::from_bytes(&address_bytes).map_err(|e| {
            AuthError::ValidationError(format!("Invalid public key from address: {}", e))
        })?;

        // What it does:
        // 1. self.0 - Gets the ByteBuf containing our signature bytes
        // 2. .as_ref() - Converts ByteBuf to &[u8]
        // 3. .try_into() - Tries to convert &[u8] to &[u8; 64] (Ed25519 signatures are exactly 64 bytes)
        // 4. .map_err(|_| {...}) - If the conversion fails (wrong length), converts the error to our custom AuthError
        // 5. Signature::from_bytes(...) - Creates an Ed25519 Signature struct from the 64-byte array

        // Why it's complex:
        // - The ed25519_dalek::Signature::from_bytes() expects &[u8; 64] (fixed-size array)
        // - But we have ByteBuf which is &[u8] (variable-size slice)
        // - The .try_into() converts variable-size slice to fixed-size array, but can fail if length ≠ 64

        // Step 3: Parse the signature bytes into Ed25519 signature
        let signature = Signature::from_bytes(self.0.as_ref().try_into().map_err(|_| {
            AuthError::SignatureInvalidError("Signature must be exactly 64 bytes".to_string())
        })?);

        // Step 4: Verify using Ed25519
        Ok(public_key.verify(&message_bytes, &signature).is_ok())
    }
}

//===================================================================================================
// DISPLAY AND CONVERSION TRAITS
//===================================================================================================

impl fmt::Display for SOLSignature {
    /// Display the signature in Base58 format (Solana standard)
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_base58())
    }
}

/// Convert from ByteBuf using `.try_into()` method
///
/// This trait enables conversion from ByteBuf using the `.try_into()` syntax.
/// Perfect for converting signature data from frontend.
///
/// Usage: When converting ByteBuf with `.try_into()`
/// ```rust
/// let sig: SOLSignature = wallet_signature_bytebuf.try_into()?;
/// ```
impl TryFrom<ByteBuf> for SOLSignature {
    type Error = AuthError;

    fn try_from(signature: ByteBuf) -> Result<Self, Self::Error> {
        Self::new(signature)
    }
}
