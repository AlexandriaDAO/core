use crate::{errors::wallet::WalletError, PublicKey};

pub struct WalletValidationConstants;

impl WalletValidationConstants {
    pub const MIN_KEY_LENGTH: usize = 32;
    pub const MAX_KEY_LENGTH: usize = 9000;

    // RSA modulus (n) typical lengths
    pub const MIN_MODULUS_LENGTH: usize = 128; // 1024-bit minimum
    pub const MAX_MODULUS_LENGTH: usize = 1024; // 8192-bit maximum

    // Standard RSA public exponent (e) value in base64url
    pub const STANDARD_EXPONENT: &'static str = "AQAB"; // Represents 65537 in base64url

    // Expected key type
    pub const EXPECTED_KEY_TYPE: &'static str = "RSA";

    // Arweave address length (base64url encoded SHA-256 hash)
    pub const ADDRESS_LENGTH: usize = 43;
}

pub fn validate_key(key: &str) -> Result<(), WalletError> {
    let key = key.trim();
    if key.is_empty() {
        return Err(WalletError::KeyRequired);
    }

    if key.len() < WalletValidationConstants::MIN_KEY_LENGTH {
        return Err(WalletError::KeyTooShort);
    }
    ic_cdk::api::print(format!("Key length: {}", key.len()).as_str());
    if key.len() > WalletValidationConstants::MAX_KEY_LENGTH {
        return Err(WalletError::KeyTooLong);
    }

    // Basic character validation - only allow base64 characters
    if !key.chars().all(|c| c.is_ascii_alphanumeric() || c == '+' || c == '/' || c == '=') {
        return Err(WalletError::KeyInvalidFormat);
    }

    Ok(())
}


pub fn validate_public_key(public_key: &PublicKey) -> Result<(), WalletError> {
    // Validate key type
    if public_key.kty != WalletValidationConstants::EXPECTED_KEY_TYPE {
        return Err(WalletError::InvalidPublicKeyType);
    }

    // Validate public exponent (e)
    if public_key.e != WalletValidationConstants::STANDARD_EXPONENT {
        return Err(WalletError::InvalidPublicKeyExponent);
    }

    // Validate modulus (n)
    let n = public_key.n.trim();
    if n.is_empty() {
        return Err(WalletError::PublicKeyModulusRequired);
    }

    // Validate modulus length
    if n.len() < WalletValidationConstants::MIN_MODULUS_LENGTH {
        return Err(WalletError::PublicKeyModulusTooShort);
    }
    if n.len() > WalletValidationConstants::MAX_MODULUS_LENGTH {
        return Err(WalletError::PublicKeyModulusTooLong);
    }

    // Validate modulus format (base64url characters only)
    if !n.chars().all(|c| {
        c.is_ascii_alphanumeric() || c == '-' || c == '_'
    }) {
        return Err(WalletError::InvalidPublicKeyModulusFormat);
    }

    Ok(())
}

pub fn validate_address(address: &str) -> Result<(), WalletError> {
    if address.is_empty() {
        return Err(WalletError::AddressRequired);
    }

    if address.len() != WalletValidationConstants::ADDRESS_LENGTH {
        return Err(WalletError::AddressInvalidFormat);
    }

    // Validate address format (base64url characters only)
    if !address.chars().all(|c| {
        c.is_ascii_alphanumeric() || c == '-' || c == '_'
    }) {
        return Err(WalletError::AddressInvalidFormat);
    }

    Ok(())
}