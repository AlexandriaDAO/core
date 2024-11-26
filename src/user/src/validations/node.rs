use crate::errors::node::NodeError;

pub struct NodeValidationConstants;

impl NodeValidationConstants {
    pub const MIN_KEY_LENGTH: usize = 32;
    pub const MAX_KEY_LENGTH: usize = 512;
}

pub fn validate_key(key: &str) -> Result<(), NodeError> {
    let key = key.trim();
    if key.is_empty() {
        return Err(NodeError::KeyRequired);
    }

    if key.len() < NodeValidationConstants::MIN_KEY_LENGTH {
        return Err(NodeError::KeyTooShort);
    }
    if key.len() > NodeValidationConstants::MAX_KEY_LENGTH {
        return Err(NodeError::KeyTooLong);
    }

    // Basic character validation - only allow base64 characters
    if !key.chars().all(|c| c.is_ascii_alphanumeric() || c == '+' || c == '/' || c == '=') {
        return Err(NodeError::KeyInvalidFormat);
    }

    Ok(())
}