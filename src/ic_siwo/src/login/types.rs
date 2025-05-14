use std::fmt;

use candid::CandidType;
use serde::Deserialize;
use serde_bytes::ByteBuf;
use simple_asn1::ASN1EncodeErr;

use crate::{challenge::types::ChallengeError, delegation::types::DelegationError};

/// Login details are returned after a successful login. They contain the expiration time of the
/// delegation and the user canister public key.
///
/// This structure represents the successful result of an authentication operation
/// and provides the client with the necessary information to establish an authenticated
/// session with the system.
///
/// # Fields
/// - `expiration`: The timestamp (in nanoseconds) when the session will expire
/// - `user_canister_pubkey`: The canister-specific public key that identifies the user
///
/// # Example
/// ```
/// use ic_siwo::login::types::LoginDetails;
/// use serde_bytes::ByteBuf;
///
/// // After successful login
/// let login_details = LoginDetails {
///     expiration: 1672531200000000000, // Example expiration timestamp
///     user_canister_pubkey: ByteBuf::from(pubkey_bytes),
/// };
///
/// // Client can now use these details for subsequent authenticated operations
/// println!("Session expires at: {}", login_details.expiration);
/// ```
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct LoginDetails {
    /// The session expiration time in nanoseconds since the UNIX epoch. This is the time at which
    /// the delegation will no longer be valid.
    pub expiration: u64,

    /// The user canister public key. This key is used to derive the user principal.
    pub user_canister_pubkey: ByteBuf,
}

/// Represents errors that can occur during the login process.
///
/// This enum encompasses various failure scenarios across the entire authentication
/// flow, including challenges, delegations, and ASN.1 encoding operations.
///
/// # Variants
/// - `ChallengeError`: Error in the challenge phase of authentication
/// - `DelegationError`: Error during delegation creation or verification
/// - `ASN1EncodeErr`: Error encoding ASN.1 data structures
/// - `AnonymousNotAllowed`: Anonymous principals are not allowed to login
///
/// # Example
/// ```
/// use ic_siwo::login::types::LoginError;
/// use ic_siwo::challenge::types::ChallengeError;
///
/// // Example error handling
/// let error = LoginError::ChallengeError(ChallengeError::ChallengeExpired);
/// 
/// match error {
///     LoginError::ChallengeError(ce) => println!("Challenge error: {}", ce),
///     LoginError::DelegationError(de) => println!("Delegation error: {}", de),
///     LoginError::ASN1EncodeErr(ae) => println!("ASN.1 encoding error: {}", ae),
///     LoginError::AnonymousNotAllowed => println!("Anonymous login attempt rejected"),
/// }
/// ```
pub enum LoginError {
    /// Error related to the challenge phase of authentication
    ChallengeError(ChallengeError),
    
    /// Error related to delegation operations
    DelegationError(DelegationError),
    
    /// Error during ASN.1 encoding
    ASN1EncodeErr(ASN1EncodeErr),
    
    /// Error when an anonymous principal attempts to login (not allowed)
    AnonymousNotAllowed,
}

/// Conversion from DelegationError to LoginError
///
/// This implementation allows delegation errors to be automatically converted
/// to login errors when used in a context requiring LoginError.
impl From<DelegationError> for LoginError {
    fn from(err: DelegationError) -> Self {
        LoginError::DelegationError(err)
    }
}

/// Conversion from ASN1EncodeErr to LoginError
///
/// This implementation allows ASN.1 encoding errors to be automatically converted
/// to login errors when used in a context requiring LoginError.
impl From<ASN1EncodeErr> for LoginError {
    fn from(err: ASN1EncodeErr) -> Self {
        LoginError::ASN1EncodeErr(err)
    }
}

/// Implements Display for LoginError to enable easy error message formatting
///
/// This allows login errors to be formatted as strings for logs, error responses,
/// and other user-facing contexts.
impl fmt::Display for LoginError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            LoginError::ChallengeError(e) => write!(f, "{}", e),
            LoginError::DelegationError(e) => write!(f, "{}", e),
            LoginError::ASN1EncodeErr(e) => write!(f, "{}", e),
            LoginError::AnonymousNotAllowed => write!(f, "Anonymous principals are not allowed to login"),
        }
    }
}
