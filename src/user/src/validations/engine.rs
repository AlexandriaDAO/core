use crate::{errors::engine::EngineError, CreateEngineRequest};

pub struct EngineValidationConstants;

impl EngineValidationConstants {
    pub const MIN_TITLE_LENGTH: usize = 3;
    pub const MAX_TITLE_LENGTH: usize = 100;

    pub const MAX_HOST_LENGTH: usize = 256;

    pub const MIN_KEY_LENGTH: usize = 32;
    pub const MAX_KEY_LENGTH: usize = 512;

    pub const MAX_INDEX_LENGTH: usize = 64;
}

pub fn validate_create_engine_request(request: &CreateEngineRequest) -> Result<(), EngineError> {
    validate_title(&request.title)?;
    validate_host(&request.host)?;
    validate_key(&request.key)?;
    validate_index(&request.index)?;
    Ok(())
}

pub fn validate_title(title: &str) -> Result<(), EngineError> {
    let title = title.trim();
    if title.is_empty() {
        return Err(EngineError::TitleRequired);
    }
    if title.len() < EngineValidationConstants::MIN_TITLE_LENGTH {
        return Err(EngineError::TitleTooShort);
    }
    if title.len() > EngineValidationConstants::MAX_TITLE_LENGTH {
        return Err(EngineError::TitleTooLong);
    }
    Ok(())
}

pub fn validate_host(host: &str) -> Result<(), EngineError> {
    let host = host.trim();
    if host.is_empty() {
        return Err(EngineError::HostRequired);
    }
    if host.len() > EngineValidationConstants::MAX_HOST_LENGTH {
        return Err(EngineError::HostTooLong);
    }
    if !host.starts_with("http://") && !host.starts_with("https://") {
        return Err(EngineError::HostInvalidFormat);
    }
    Ok(())
}

pub fn validate_index(index: &str) -> Result<(), EngineError> {
    let index = index.trim();
    if index.is_empty() {
        return Err(EngineError::IndexRequired);
    }
    if index.len() > EngineValidationConstants::MAX_INDEX_LENGTH {
        return Err(EngineError::IndexTooLong);
    }
    if !index.chars().all(|c| c.is_ascii_alphanumeric() || c == '_') {
        return Err(EngineError::IndexInvalidFormat);
    }
    Ok(())
}

// ... existing validate_key function remains unchanged ...
pub fn validate_key(key: &str) -> Result<(), EngineError> {
    let key = key.trim();
    if key.is_empty() {
        return Err(EngineError::KeyRequired);
    }

    if key.len() < EngineValidationConstants::MIN_KEY_LENGTH {
        return Err(EngineError::KeyTooShort);
    }
    if key.len() > EngineValidationConstants::MAX_KEY_LENGTH {
        return Err(EngineError::KeyTooLong);
    }

    // Basic character validation - only allow base64 characters
    if !key.chars().all(|c| c.is_ascii_alphanumeric() || c == '+' || c == '/' || c == '=') {
        return Err(EngineError::KeyInvalidFormat);
    }

    Ok(())
}