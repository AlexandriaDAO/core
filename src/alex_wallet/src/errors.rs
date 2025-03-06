use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(CandidType, Deserialize, Serialize, Debug)]
pub struct ErrorResponse {
    pub code: String,
    pub message: String,
}

pub trait ToErrorResponse {
    fn to_error_response(&self) -> ErrorResponse;
}

#[derive(CandidType, Deserialize, Serialize, Debug)]
pub enum GeneralError {
    // Authentication/Authorization
    NotAuthorized,
    AnonymousNotAllowed,

    // Common CRUD Errors
    NotFound(String),      // e.g., "User", "Node", "Profile"
    AlreadyExists(String), // e.g., "User with this principal", "Username"

    // State Errors
    StateError(String),    // e.g., "Failed to load state", "State update failed"

    // Validation Errors
    ValidationError(String), // e.g., "Invalid format", "Required field missing"

    // Other General Errors
    InvalidInput(String),   // e.g., "Invalid parameters provided"
    InternalError(String),  // e.g., "Unexpected error occurred"
}


impl GeneralError {
    pub fn to_string(&self) -> String {
        match self {
            // Auth errors
            Self::NotAuthorized => "Not authorized to perform this action".to_string(),
            Self::AnonymousNotAllowed => "Anonymous access is not allowed".to_string(),

            // CRUD errors
            Self::NotFound(entity) => format!("{} not found", entity),
            Self::AlreadyExists(entity) => format!("{} already exists", entity),

            // State errors
            Self::StateError(msg) => format!("State error: {}", msg),

            // Validation errors
            Self::ValidationError(msg) => format!("Validation error: {}", msg),

            // Other errors
            Self::InvalidInput(msg) => format!("Invalid input: {}", msg),
            Self::InternalError(msg) => format!("Internal error: {}", msg),
        }
    }
}

#[derive(CandidType, Deserialize, Serialize, Debug)]
pub enum WalletError {
    General(GeneralError),

    // Authorization errors
    NotLibrarian,

    // Wallet state errors
    MaxWalletsReached,
    InvalidWalletKey,
    WalletInactive,

    // Wallet key validation errors
    KeyTooShort,
    KeyTooLong,
    KeyInvalidFormat,
    KeyRequired,

    // Wallet address validation errors
    AddressInvalidFormat,
    AddressRequired,

    InvalidPublicKeyType,
    InvalidPublicKeyExponent,
    PublicKeyModulusRequired,
    PublicKeyModulusTooShort,
    PublicKeyModulusTooLong,
    InvalidPublicKeyModulusFormat,

}

impl From<GeneralError> for WalletError {
    fn from(error: GeneralError) -> Self {
        WalletError::General(error)
    }
}

impl WalletError {
    pub fn to_string(&self) -> String {
        match self {
            // General Errors
            Self::General(error) => error.to_string(),

            // Authorization errors
            Self::NotLibrarian => "Only librarians can perform this action".to_string(),

            // Wallet state errors
            Self::MaxWalletsReached => "Maximum number of wallets reached".to_string(),
            Self::InvalidWalletKey => "Invalid wallet key provided".to_string(),
            Self::WalletInactive => "Wallet is currently inactive".to_string(),

            // Wallet key validation errors
            Self::KeyTooShort => "Private key too short".to_string(),
            Self::KeyTooLong => "Private key too long".to_string(),
            Self::KeyInvalidFormat => "Invalid private key format".to_string(),
            Self::KeyRequired => "Private key is required".to_string(),

            // Wallet address validation errors
            Self::AddressInvalidFormat => "Invalid address format".to_string(),
            Self::AddressRequired => "Address is required".to_string(),

            // Wallet public key validation errors
            Self::InvalidPublicKeyType => "Key type must be RSA".to_string(),
            Self::InvalidPublicKeyExponent => "Invalid public exponent".to_string(),
            Self::PublicKeyModulusRequired => "Modulus is required".to_string(),
            Self::PublicKeyModulusTooShort => "Modulus is too short".to_string(),
            Self::PublicKeyModulusTooLong => "Modulus is too long".to_string(),
            Self::InvalidPublicKeyModulusFormat => "Invalid modulus format".to_string(),
        }
    }
}