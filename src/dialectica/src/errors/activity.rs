use candid::CandidType;
use serde::{Deserialize, Serialize};
use std::fmt;

/// Error types for activity operations
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ActivityError {
    /// Anonymous users are not allowed to perform activities
    AnonymousNotAllowed,
    /// Activity not found with the given ID
    NotFound(u64),
    /// User is not authorized to perform this action
    Unauthorized,
    /// Comment is empty or too long
    InvalidComment(String),
    /// Arweave ID is invalid or empty
    InvalidArweaveId,
    /// Activity already exists (for reactions)
    AlreadyExists,
    /// Generic internal error
    InternalError(String),
}

impl fmt::Display for ActivityError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ActivityError::AnonymousNotAllowed => {
                write!(f, "Anonymous users are not allowed to perform activities")
            }
            ActivityError::NotFound(id) => {
                write!(f, "Activity with ID {} not found", id)
            }
            ActivityError::Unauthorized => {
                write!(f, "User is not authorized to perform this action")
            }
            ActivityError::InvalidComment(msg) => {
                write!(f, "Invalid comment: {}", msg)
            }
            ActivityError::InvalidArweaveId => {
                write!(f, "Invalid or empty Arweave ID")
            }
            ActivityError::AlreadyExists => {
                write!(f, "Activity already exists")
            }
            ActivityError::InternalError(msg) => {
                write!(f, "Internal error: {}", msg)
            }
        }
    }
}

impl std::error::Error for ActivityError {}

/// Type alias for Result with ActivityError
pub type ActivityResult<T> = Result<T, ActivityError>;