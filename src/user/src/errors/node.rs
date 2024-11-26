use candid::CandidType;
use serde::{Deserialize, Serialize};
use super::general::GeneralError;

#[derive(CandidType, Deserialize, Serialize, Debug)]
pub enum NodeError {
    General(GeneralError),

    // Authorization errors
    NotLibrarian,

    // Node state errors
    MaxNodesReached,
    InvalidNodeKey,
    NodeInactive,

    // Key validation errors
    KeyTooShort,
    KeyTooLong,
    KeyInvalidFormat,
    KeyRequired,
}

impl From<GeneralError> for NodeError {
    fn from(error: GeneralError) -> Self {
        NodeError::General(error)
    }
}

impl NodeError {
    pub fn to_string(&self) -> String {
        match self {
            // General Errors
            Self::General(error) => error.to_string(),

            // Authorization errors
            Self::NotLibrarian => "Only librarians can perform this action".to_string(),

            // Node state errors
            Self::MaxNodesReached => "Maximum number of nodes reached".to_string(),
            Self::InvalidNodeKey => "Invalid node key provided".to_string(),
            Self::NodeInactive => "Node is currently inactive".to_string(),

            // Key validation errors
            Self::KeyTooShort => "Private key too short".to_string(),
            Self::KeyTooLong => "Private key too long".to_string(),
            Self::KeyInvalidFormat => "Invalid private key format".to_string(),
            Self::KeyRequired => "Private key is required".to_string(),
        }
    }
}