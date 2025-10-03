//===================================================================================================
// CORE AUTHENTICATION ERRORS
//===================================================================================================
//
// This module provides comprehensive error handling for all authentication operations.
// Supports both default error messages and custom messages for provider-specific contexts.

use candid::{CandidType, Deserialize};
use serde::Serialize;
use std::fmt;

/// Usage examples:
/// ```rust
/// // Default error message
/// return Err(AuthError::AddressFormat);  // "Invalid address format"
///
/// // Custom error message
/// return Err(AuthError::AddressFormatError("Ethereum address must start with 0x".to_string()));
///
/// // Generic custom errors
/// return Err(AuthError::AuthenticationError("Something unexpected happened".to_string()));
/// ```
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub enum AuthError {
    //===============================================================================================
    // DEFAULT MESSAGE VARIANTS (NO PARAMETERS)
    //===============================================================================================

    // Address and signature validation errors
    AddressFormat,
    SignatureInvalid,
    MessageExpired,
    NonceInvalid,
    RecoveryFailed,
    ChainIdInvalid,

    // System and storage errors
    StorageFailed,
    HexDecodingFailed,
    ValidationFailed,

    // Authentication session errors
    SessionNotFound,
    DelegationNotFound,
    MessageNotFound,
    DelegationHashMismatch,
    WitnessHashMismatch,
    SerializationFailed,

    //===============================================================================================
    // CUSTOM MESSAGE VARIANTS (WITH "ERROR" SUFFIX)
    //===============================================================================================

    // Address and signature validation errors with custom messages
    AddressFormatError(String),
    SignatureInvalidError(String),
    MessageExpiredError(String),
    NonceInvalidError(String),
    RecoveryFailedError(String),
    ChainIdInvalidError(String),

    // System and storage errors with custom messages
    StorageError(String),
    HexDecodingError(String),
    ValidationError(String),

    // Authentication session errors with custom messages
    SessionNotFoundError(String),
    DelegationNotFoundError(String),
    MessageNotFoundError(String),
    DelegationHashMismatchError(String),
    WitnessHashMismatchError(String),
    SerializationError(String),

    // Generic authentication error with custom message
    AuthenticationError(String),
}

/// Result type alias for Authentication operations
/// Simplifies function signatures throughout the Authentication provider
///
/// Usage: Instead of `Result<ETHAddress, AuthError>` just use `AuthResult<ETHAddress>`
pub type AuthResult<T> = Result<T, AuthError>;

//===================================================================================================
// DISPLAY IMPLEMENTATION
//===================================================================================================

impl fmt::Display for AuthError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            //===========================================================================================
            // DEFAULT MESSAGE VARIANTS
            //===========================================================================================

            // Address and signature validation errors
            AuthError::AddressFormat => write!(f, "Invalid address format"),
            AuthError::SignatureInvalid => write!(f, "Invalid signature"),
            AuthError::MessageExpired => write!(f, "Message has expired"),
            AuthError::NonceInvalid => write!(f, "Invalid nonce"),
            AuthError::RecoveryFailed => write!(f, "Address recovery failed"),
            AuthError::ChainIdInvalid => write!(f, "Invalid chain ID"),

            // System and storage errors
            AuthError::StorageFailed => write!(f, "Storage operation failed"),
            AuthError::HexDecodingFailed => write!(f, "Hex decoding failed"),
            AuthError::ValidationFailed => write!(f, "Validation failed"),

            // Authentication session errors
            AuthError::SessionNotFound => write!(f, "Session not found"),
            AuthError::DelegationNotFound => write!(f, "Delegation not found"),
            AuthError::MessageNotFound => write!(f, "Message not found"),
            AuthError::DelegationHashMismatch => write!(f, "Delegation hash mismatch"),
            AuthError::WitnessHashMismatch => write!(f, "Witness hash mismatch"),
            AuthError::SerializationFailed => write!(f, "Serialization failed"),

            //===========================================================================================
            // CUSTOM MESSAGE VARIANTS
            //===========================================================================================

            // Address and signature validation errors with custom messages
            AuthError::AddressFormatError(msg) => {
                write!(f, "Invalid address format: {}", msg)
            }
            AuthError::SignatureInvalidError(msg) => write!(f, "Invalid signature: {}", msg),
            AuthError::MessageExpiredError(msg) => write!(f, "Message has expired: {}", msg),
            AuthError::NonceInvalidError(msg) => write!(f, "Invalid nonce: {}", msg),
            AuthError::RecoveryFailedError(msg) => write!(f, "Address recovery failed: {}", msg),
            AuthError::ChainIdInvalidError(msg) => write!(f, "Invalid chain ID: {}", msg),

            // System and storage errors with custom messages
            AuthError::StorageError(msg) => write!(f, "Storage operation failed: {}", msg),
            AuthError::HexDecodingError(msg) => write!(f, "Hex decoding failed: {}", msg),
            AuthError::ValidationError(msg) => write!(f, "Validation failed: {}", msg),

            // Authentication session errors with custom messages
            AuthError::SessionNotFoundError(msg) => write!(f, "Session not found: {}", msg),
            AuthError::DelegationNotFoundError(msg) => write!(f, "Delegation not found: {}", msg),
            AuthError::MessageNotFoundError(msg) => write!(f, "Message not found: {}", msg),
            AuthError::DelegationHashMismatchError(msg) => {
                write!(f, "Delegation hash mismatch: {}", msg)
            }
            AuthError::WitnessHashMismatchError(msg) => write!(f, "Witness hash mismatch: {}", msg),
            AuthError::SerializationError(msg) => write!(f, "Serialization failed: {}", msg),

            // Generic authentication error
            AuthError::AuthenticationError(msg) => write!(f, "Authentication error: {}", msg),
        }
    }
}

//===================================================================================================
// ERROR CONVERSION IMPLEMENTATIONS
//===================================================================================================

/// Convert from hex decoding errors
/// This allows hex::decode() errors to automatically become AuthError
///
/// Usage: When hex::decode() fails, it automatically converts to AuthError::HexDecodingRaw
/// ```rust
/// let bytes = hex::decode("invalid_hex")?;  // ? automatically converts hex error to AuthError
/// ```
impl From<hex::FromHexError> for AuthError {
    fn from(err: hex::FromHexError) -> Self {
        AuthError::HexDecodingError(format!("Hex decoding failed: {}", err))
    }
}

/// Convert array conversion errors to AuthError automatically
///
/// This enables automatic error propagation when converting Vec<u8> to [u8; N].
///
/// Usage: When try_into() fails, it automatically converts to AuthError::ValidationFailedRaw
/// ```rust
/// let array: [u8; 32] = vec.try_into()?;  // ? automatically converts TryFromSliceError to AuthError
/// ```
impl From<std::array::TryFromSliceError> for AuthError {
    fn from(_: std::array::TryFromSliceError) -> Self {
        AuthError::ValidationError(
            "Invalid byte array length - must be exactly 32 bytes".to_string(),
        )
    }
}

/// Convert AuthError to String for compatibility
/// This allows AuthError to be used anywhere a String is expected
///
/// Usage: Return AuthError from functions that expect String errors
/// ```rust
/// fn some_function() -> Result<(), String> {
///     validate_address(addr).map_err(|e| e.into())?;  // AuthError -> String
///     Ok(())
/// }
/// ```
impl From<AuthError> for String {
    fn from(error: AuthError) -> Self {
        error.to_string()
    }
}

/// Convert from String to AuthenticationError error for convenience
/// This allows any String to become an AuthError::AuthenticationError
///
/// Usage: Quick error creation from dynamic strings
/// ```rust
/// let msg = format!("Failed at step {}", step_number);
/// return Err(msg.into());  // String -> AuthError::AuthenticationError
/// ```
impl From<String> for AuthError {
    fn from(msg: String) -> Self {
        AuthError::AuthenticationError(msg)
    }
}

/// Convert from &str to AuthenticationError error for convenience
/// This allows any string literal to become an AuthError::AuthenticationError
///
/// Usage: Quick error creation from string literals
/// ```rust
/// return Err("Something went wrong".into());  // &str -> AuthError::AuthenticationError
/// ```
impl From<&str> for AuthError {
    fn from(msg: &str) -> Self {
        AuthError::AuthenticationError(msg.to_string())
    }
}