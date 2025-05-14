use std::fmt;

use ic_certified_map::Hash;
use serde_bytes::ByteBuf;

use candid::{CandidType, Principal};
use serde::Deserialize;

/// Represents errors that can occur during delegation operations.
///
/// This enum covers various failure scenarios when creating, verifying,
/// or validating delegations in the Internet Computer authentication flow.
#[derive(Debug)]
pub enum DelegationError {
    /// The signature for the delegation was not found
    SignatureNotFound,
    /// The witness hash doesn't match the root hash, indicating tampering or corruption
    WitnessHashMismatch(Hash, Hash),
    /// Error during serialization or deserialization of delegation data
    SerializationError(String),
    /// The provided session key is invalid or malformed
    InvalidSessionKey(String),
    /// The expiration time is invalid or malformed
    InvalidExpiration(String),
    /// The delegation signature has expired and is no longer valid
    SignatureExpired,
}

impl fmt::Display for DelegationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DelegationError::SignatureNotFound => write!(f, "Signature not found"),
            DelegationError::WitnessHashMismatch(witness_hash, root_hash) => write!(
                f,
                "Internal error: signature map computed an invalid hash tree, witness hash is {}, root hash is {}",
                hex::encode(witness_hash),
                hex::encode(root_hash)
            ),
            DelegationError::SerializationError(e) => write!(f, "Serialization error: {}", e),
            DelegationError::InvalidSessionKey(e) => write!(f, "Invalid session key: {}", e),
            DelegationError::InvalidExpiration(e) => write!(f, "Invalid expiration: {}", e),
            DelegationError::SignatureExpired => write!(f, "Signature expired"),
        }
    }
}

impl From<DelegationError> for String {
    fn from(error: DelegationError) -> Self {
        error.to_string()
    }
}

/// Represents a delegation of authentication authority to a session key.
///
/// A delegation allows a user to authorize a session key to act on their behalf
/// for a limited time period. This enables applications to perform actions with
/// the user's authority without requiring the user's private key for each action.
///
/// # Fields
/// - `pubkey`: The public key being delegated to (usually a session key)
/// - `expiration`: The timestamp when this delegation expires (in nanoseconds)
/// - `targets`: Optional list of canister IDs this delegation is valid for. If None,
///   the delegation is valid for all canisters.
///
/// # Example
/// ```
/// use candid::Principal;
/// use serde_bytes::ByteBuf;
/// use ic_siwo::delegation::types::Delegation;
///
/// // Create a delegation allowing a session key to act on behalf of a user
/// // for specific canisters until a specified time
/// let delegation = Delegation {
///     pubkey: ByteBuf::from(session_public_key),
///     expiration: 1672531200000000000, // some future timestamp
///     targets: Some(vec![
///         Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap(),
///     ]),
/// };
/// ```
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Delegation {
    /// The public key being delegated to (session key)
    pub pubkey: ByteBuf,
    /// Expiration timestamp in nanoseconds
    pub expiration: u64,
    /// Optional list of canister IDs this delegation is valid for
    pub targets: Option<Vec<Principal>>,
}

/// A delegation with a cryptographic signature proving its authenticity.
///
/// This structure combines a delegation with a signature created by the
/// delegator's private key. The signature proves that the delegation was
/// actually authorized by the user who owns the private key corresponding
/// to the identity they claim.
///
/// # Fields
/// - `delegation`: The delegation information (public key, expiration, targets)
/// - `signature`: Cryptographic signature of the delegation, created by the delegator
///
/// # Security Notes
/// - The signature must be verified to ensure the delegation is authentic
/// - A valid signature proves the delegation was created by the identity owner
/// - Applications should check that the current time is before the expiration
///
/// # Example
/// ```
/// use ic_siwo::delegation::types::{Delegation, SignedDelegation};
/// use serde_bytes::ByteBuf;
///
/// // Assuming we have a delegation and signature bytes
/// let signed_delegation = SignedDelegation {
///     delegation: delegation,
///     signature: ByteBuf::from(signature_bytes),
/// };
///
/// // This signed delegation can now be verified by the authentication system
/// ```
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct SignedDelegation {
    /// The delegation being signed
    pub delegation: Delegation,
    /// Cryptographic signature of the delegation created by the delegator
    pub signature: ByteBuf,
}
