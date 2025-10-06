/// Arweave signature type with professional RSA-PSS validation
///
/// This module provides a production-ready Arweave signature implementation that:
/// - Uses industry-standard rsa crate for RSA-PSS operations
/// - Validates signature format and performs cryptographic verification
/// - Works with RSA-PSS signatures (512 bytes, no recovery possible)
/// - Integrates with Candid for IC serialization
///
/// KEY DIFFERENCES FROM SOLANA/ETHEREUM:
/// - RSA-PSS signatures (512 bytes) vs Ed25519 (64) or ECDSA (65 bytes)
/// - No address recovery possible - must verify against known public key
/// - Base64URL encoding vs Base58/hex encoding
/// - Much larger signatures due to 4096-bit RSA keys
/// - Probabilistic padding (PSS) vs deterministic schemes
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use candid::{CandidType, Deserialize};
use rsa::BigUint;
use rsa::{pkcs1::DecodeRsaPublicKey, pkcs8::DecodePublicKey, RsaPublicKey};
use serde::Serialize;
use serde_bytes::ByteBuf;
use sha2::Sha256;
use std::fmt;

use crate::core::error::{AuthError, AuthResult};

use super::constants::SIGNATURE_BYTES_LENGTH;
use super::message::ARMessage;

//===================================================================================================
// ARWEAVE SIGNATURE TYPE
//===================================================================================================

/// Type-safe Arweave signature with professional RSA-PSS validation
///
/// Uses industry-standard cryptographic libraries for maximum security and compatibility.
/// RSA-PSS signatures are probabilistic and do not support address recovery.
/// Must verify against a known public key rather than recovering the signer.
///
/// Usage examples:
/// ```rust
/// // Create from signature ByteBuf (512 bytes from frontend)
/// let sig = ARSignature::new(wallet_signature_bytes)?;
///
/// // Verify signature against known address and message
/// let message = ARMessage::new(address)?;
/// let is_valid = sig.verify(&message, &expected_address)?;
/// ```
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub struct ARSignature(
    /// The signature bytes (512 bytes for RSA-PSS 4096-bit)
    ByteBuf,
);

//===================================================================================================
// SIGNATURE CREATION AND VALIDATION
//===================================================================================================

impl ARSignature {
    /// Create a new ARSignature directly from ByteBuf
    ///
    /// Takes signature bytes directly from frontend (Uint8Array -> ByteBuf).
    /// No string parsing needed - frontend sends raw RSA-PSS signature bytes.
    ///
    /// Usage: For signatures from Arweave wallet
    /// ```rust
    /// let sig = ARSignature::new(wallet_signature_bytebuf)?;
    /// ```
    pub fn new(signature: ByteBuf) -> AuthResult<Self> {
        // Validate RSA-PSS signature length (4096-bit = 512 bytes)
        if signature.len() != SIGNATURE_BYTES_LENGTH {
            return Err(AuthError::SignatureInvalidError(format!(
                "RSA-PSS signature must be exactly {} bytes, got {}",
                SIGNATURE_BYTES_LENGTH,
                signature.len()
            )));
        }

        Ok(Self(signature))
    }

    /// Convert signature to Base64URL string (Arweave standard format)
    ///
    /// Returns the signature in Base64URL encoding as used by Arweave ecosystem.
    ///
    /// Usage: When you need the signature as a string
    /// ```rust
    /// let sig_str = signature.to_base64url();
    /// println!("Signature: {}", sig_str);
    /// ```
    pub fn to_base64url(&self) -> String {
        URL_SAFE_NO_PAD.encode(&self.0)
    }
}

//===================================================================================================
// CRYPTOGRAPHIC OPERATIONS
//===================================================================================================

impl ARSignature {
    /// Verify signature against SIWA message using RSA-PSS
    ///
    /// **KEY DIFFERENCE FROM ETHEREUM/SOLANA**: RSA-PSS does not support address recovery.
    /// We verify against the public key stored in the message's ARAddress.
    ///
    /// # Arguments
    /// * `message` - ARMessage containing the SIWA message and ARAddress with public key
    ///
    /// # Usage
    /// ```rust
    /// let is_valid = signature.verify(&message)?;
    /// if is_valid {
    ///     println!("RSA-PSS signature is valid!");
    /// }
    /// ```
    pub fn verify(&self, message: &ARMessage) -> AuthResult<bool> {
        // Step 1: Validate signature length (512 bytes for RSA-4096 PSS)
        if self.0.len() != SIGNATURE_BYTES_LENGTH {
            return Err(AuthError::SignatureInvalidError(format!(
                "RSA signature must be exactly {} bytes, got {}",
                SIGNATURE_BYTES_LENGTH,
                self.0.len()
            )));
        }

        // Step 2: Get the message bytes that were signed (same pattern as Solana)
        let message_bytes = message.to_siwa().into_bytes();

        // Step 3: Hash the message bytes (Arweave signs SHA-256 hash of message)
        use crate::core::crypto::hash_bytes;
        let message_hash = hash_bytes(&message_bytes);

        // Step 4: Get public key from ARAddress in message
        let address = &message.address;
        let public_key_b64 = address.public_key();
        let public_key_bytes = URL_SAFE_NO_PAD.decode(public_key_b64).map_err(|e| {
            AuthError::ValidationError(format!("Invalid public key Base64URL: {}", e))
        })?;

        // Step 5: Parse RSA public key - handle Arweave JWK format
        // Arweave wallets provide the RSA modulus (n) as raw bytes
        // We need to construct the RSA public key with modulus + standard exponent (65537)
        let rsa_public_key = if public_key_bytes.len() == 512 {
            // Arweave format: 512 bytes = raw RSA-4096 modulus
            let modulus = BigUint::from_bytes_be(&public_key_bytes);
            let public_exponent = BigUint::from(65537u32); // Standard RSA exponent ("AQAB" in JWK)
            RsaPublicKey::new(modulus, public_exponent).map_err(|e| {
                AuthError::ValidationError(format!("Failed to construct RSA key: {}", e))
            })?
        } else {
            // Try standard formats for other lengths
            RsaPublicKey::from_public_key_der(&public_key_bytes)
                .or_else(|_| RsaPublicKey::from_pkcs1_der(&public_key_bytes))
                .map_err(|e| AuthError::ValidationError(format!("Invalid RSA public key: {}", e)))?
        };

        // Step 6: Create PSS verifying key with SHA-256
        let verifying_key = rsa::pss::VerifyingKey::<Sha256>::new(rsa_public_key);

        // Step 7: Create signature object from bytes (512 bytes for RSA-PSS)
        let signature = rsa::pss::Signature::try_from(self.0.as_ref()).map_err(|e| {
            AuthError::SignatureInvalidError(format!("Invalid RSA signature format: {}", e))
        })?;

        // Step 8: Verify PSS signature against message hash
        use rsa::signature::Verifier;
        Ok(verifying_key.verify(&message_hash, &signature).is_ok())
    }
}

//===================================================================================================
// DISPLAY AND CONVERSION TRAITS
//===================================================================================================

impl fmt::Display for ARSignature {
    /// Display the signature in Base64URL format (Arweave standard)
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_base64url())
    }
}

/// Convert from ByteBuf using `.try_into()` method
///
/// This trait enables conversion from ByteBuf using the `.try_into()` syntax.
/// Perfect for converting signature data from frontend.
///
/// # Usage
/// ```rust
/// let sig: ARSignature = wallet_signature_bytebuf.try_into()?;
/// ```
impl TryFrom<ByteBuf> for ARSignature {
    type Error = AuthError;

    fn try_from(signature: ByteBuf) -> Result<Self, Self::Error> {
        Self::new(signature)
    }
}
