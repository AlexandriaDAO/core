use candid::CandidType;
use serde::{Deserialize, Serialize};
use crate::ValidationConstants;
use super::general::GeneralError;

#[derive(CandidType, Deserialize, Serialize, Debug)]
pub enum UserError {
    General(GeneralError),

    // Username Errors
    UsernameTaken,
    UsernameTooShort,
    UsernameTooLong,
    UsernameInvalidCharacters,
    UsernameReserved,
    UsernameContainsInappropriate,
    UsernameStartsWithInvalidChar,

    // Profile Update Errors
    NameTooShort,
    NameTooLong,
    NameContainsInvalidChars,
    AvatarUrlInvalid,
}

impl From<GeneralError> for UserError {
    fn from(error: GeneralError) -> Self {
        UserError::General(error)
    }
}

impl UserError {
    pub fn to_string(&self) -> String {
        match self {
            // General Errors
            Self::General(error) => error.to_string(),

            // Username Errors
            Self::UsernameTaken => "This username is already taken".to_string(),
            Self::UsernameTooShort => format!( "Username must be at least {} characters long", ValidationConstants::MIN_USERNAME_LENGTH ),
            Self::UsernameTooLong => format!( "Username must be less than {} characters long", ValidationConstants::MAX_USERNAME_LENGTH ),
            Self::UsernameInvalidCharacters => "Username can only contain letters, numbers, underscores, and hyphens, and must start with a letter".to_string(),
            Self::UsernameReserved => "This username is reserved and cannot be used".to_string(),
            Self::UsernameContainsInappropriate => "Username contains inappropriate content".to_string(),
            Self::UsernameStartsWithInvalidChar => "Username must start with a letter".to_string(),

            // Profile Update Errors
            Self::NameTooShort => format!( "Name must be at least {} characters long", ValidationConstants::MIN_NAME_LENGTH ),
            Self::NameTooLong => format!( "Name must be less than {} characters long", ValidationConstants::MAX_NAME_LENGTH ),
            Self::NameContainsInvalidChars => "Name contains invalid characters. Only letters, numbers, spaces, hyphens, apostrophes, and periods are allowed".to_string(),
            Self::AvatarUrlInvalid => "Invalid avatar URL. Please provide a valid HTTPS URL".to_string(),
        }
    }
}