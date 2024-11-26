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