use candid::CandidType;
use serde::{Deserialize, Serialize};
use super::general::GeneralError;

#[derive(CandidType, Deserialize, Serialize, Debug)]
pub enum EngineError {
    General(GeneralError),

    // Engine state errors
    MaxEnginesReached,
    EngineInactive,

    // Title validation errors
    TitleRequired,
    TitleTooShort,
    TitleTooLong,

    // Host validation errors
    HostRequired,
    HostInvalidFormat,
    HostTooLong,

    // Key validation errors
    KeyTooShort,
    KeyTooLong,
    KeyInvalidFormat,
    KeyRequired,

    // Index validation errors
    IndexRequired,
    IndexInvalidFormat,
    IndexTooLong,
}

impl From<GeneralError> for EngineError {
    fn from(error: GeneralError) -> Self {
        EngineError::General(error)
    }
}

impl EngineError {
    pub fn to_string(&self) -> String {
        match self {
            // General Errors
            Self::General(error) => error.to_string(),

            // Engine state errors
            Self::MaxEnginesReached => "Maximum number of engines reached".to_string(),
            Self::EngineInactive => "Engine is currently inactive".to_string(),

            // Title validation errors
            Self::TitleRequired => "Title is required".to_string(),
            Self::TitleTooShort => "Title must be at least 3 characters".to_string(),
            Self::TitleTooLong => "Title must not exceed 100 characters".to_string(),

            // Host validation errors
            Self::HostRequired => "Host URL is required".to_string(),
            Self::HostInvalidFormat => "Invalid host URL format".to_string(),
            Self::HostTooLong => "Host URL must not exceed 256 characters".to_string(),

            // Key validation errors
            Self::KeyTooShort => "Private key too short".to_string(),
            Self::KeyTooLong => "Private key too long".to_string(),
            Self::KeyInvalidFormat => "Invalid private key format".to_string(),
            Self::KeyRequired => "Private key is required".to_string(),

            // Index validation errors
            Self::IndexRequired => "Index name is required".to_string(),
            Self::IndexInvalidFormat => "Invalid index name format".to_string(),
            Self::IndexTooLong => "Index name must not exceed 64 characters".to_string(),
        }
    }
}