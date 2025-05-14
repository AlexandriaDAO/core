use crate::settings::types::Settings;
use crate::utils::{generate_nonce, get_current_time};
use crate::with_settings;
use candid::{CandidType, Deserialize};
use serde::Serialize;
use std::fmt;

use ed25519_dalek::{Verifier, Signature};
use serde_bytes::ByteBuf;

use super::utils::decode_der_public_key;

/// Represents errors that can occur during challenge operations.
///
/// This enum covers various failure scenarios when creating, verifying,
/// or validating challenges during the authentication flow.
#[derive(Debug, Clone, CandidType)]
pub enum ChallengeError {
    /// The requested challenge could not be found
    ChallengeNotFound,
    /// The challenge exists but has expired
    ChallengeExpired,
    /// The challenge is invalid (malformed or tampered)
    ChallengeInvalid,
    /// The principal has too many active challenges
    TooManyChallenges,
    /// The provided public key is invalid or malformed
    InvalidPublicKey(String),
    /// The provided signature is invalid or malformed
    InvalidSignature,
    /// The signature verification process failed
    SignatureVerificationFailed,
}

impl fmt::Display for ChallengeError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ChallengeError::ChallengeNotFound => write!(f, "Challenge not found"),
            ChallengeError::ChallengeExpired => write!(f, "Challenge has expired"),
            ChallengeError::ChallengeInvalid => write!(f, "Challenge is invalid"),
            ChallengeError::TooManyChallenges => write!(f, "Too many active challenges for this principal"),
            ChallengeError::InvalidPublicKey(msg) => write!(f, "Invalid or malformed public key: {}", msg),
            ChallengeError::InvalidSignature => write!(f, "Invalid or malformed signature"),
            ChallengeError::SignatureVerificationFailed => write!(f, "Signature verification failed"),
        }
    }
}

impl From<ChallengeError> for String {
    fn from(error: ChallengeError) -> Self {
        error.to_string()
    }
}

/// Challenge structure for authentication
///
/// A challenge represents a time-limited, one-time token that is used in
/// cryptographic proof-of-possession flows. Each challenge contains a secure
/// random nonce and timestamps for creation and expiration.
///
/// # Example
/// ```
/// use ic_siwo::challenge::types::Challenge;
///
/// // Create a new challenge
/// let challenge = Challenge::new();
/// 
/// // Check if the challenge has expired
/// if !challenge.is_expired() {
///     println!("Challenge is valid until: {}", challenge.expires_at);
/// }
/// 
/// // Verify a signature against this challenge
/// let result = challenge.is_valid(
///     message,
///     signature_bytes,
///     public_key_bytes
/// );
/// 
/// match result {
///     Ok(_) => println!("Signature verified successfully"),
///     Err(e) => println!("Signature verification failed: {}", e),
/// }
/// ```
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Challenge {
    /// Secure random challenge string
    pub nonce: String,
    /// Expiration timestamp in nanoseconds
    pub expires_at: u64,
    /// Creation timestamp for auditing
    pub created_at: u64,
}

impl Challenge {
    /// Creates a new challenge with a random nonce and expiration time.
    ///
    /// The expiration time is determined by the system settings, typically
    /// set to several minutes from the creation time.
    ///
    /// # Returns
    /// A new `Challenge` instance with a secure random nonce.
    ///
    /// # Example
    /// ```
    /// let challenge = Challenge::new();
    /// println!("New challenge created with nonce: {}", challenge.nonce);
    /// ```
    pub fn new() -> Self {
        let nonce = generate_nonce();
        let current_time = get_current_time();
        with_settings!(|settings: &Settings| {
            Challenge {
                nonce,
                created_at: current_time,
                expires_at: current_time.saturating_add(settings.challenge_expires_in),
            }
        })
    }

    /// Checks if the challenge has expired.
    ///
    /// # Returns
    /// `true` if the current time is past the challenge's expiration time, `false` otherwise.
    ///
    /// # Example
    /// ```
    /// if challenge.is_expired() {
    ///     println!("This challenge can no longer be used");
    /// } else {
    ///     println!("Challenge is still valid");
    /// }
    /// ```
    pub fn is_expired(&self) -> bool {
        let current_time = get_current_time();
        current_time > self.expires_at
    }

    /// Validates a signature against a message and public key.
    ///
    /// This method verifies that the provided signature was created using
    /// the private key corresponding to the provided public key, and that
    /// it correctly signs the given message.
    ///
    /// # Parameters
    /// - `message`: The message that was signed
    /// - `signature`: The cryptographic signature as a byte buffer
    /// - `public_key`: The public key in DER format as a byte buffer
    ///
    /// # Returns
    /// - `Ok(())`: If the signature is valid
    /// - `Err(ChallengeError)`: If the public key is invalid, the signature is invalid,
    ///   or the verification failed
    ///
    /// # Example
    /// ```
    /// // Assume we have message, signature and public_key from a client
    /// match challenge.is_valid(message, signature, public_key) {
    ///     Ok(_) => {
    ///         println!("Signature verification successful");
    ///         // Proceed with authentication
    ///     },
    ///     Err(e) => {
    ///         println!("Verification failed: {}", e);
    ///         // Deny authentication
    ///     }
    /// }
    /// ```
    pub fn is_valid(&self, message: String, signature: ByteBuf, public_key: ByteBuf) -> Result<(), ChallengeError> {
        // Decode the public key from DER format
        let verifying_key = decode_der_public_key(&public_key)
            .map_err(|e| ChallengeError::InvalidPublicKey(e))?;

        // Parse the signature
        let signature = Signature::from_slice(&signature)
            .map_err(|_| ChallengeError::InvalidSignature)?;

        // Verify the signature against the principal bytes
        verifying_key.verify(message.as_bytes(), &signature)
            .map_err(|_| ChallengeError::SignatureVerificationFailed)
    }
}