/// Cryptographic utilities for multi-provider authentication systems
/// Provides secure hashing, domain separation, and encoding functions
/// Ensures deterministic behavior across local development and production
use sha2::{Digest, Sha256};

use crate::core::error::{AuthError, AuthResult};

//===================================================================================================
// CORE HASHING FUNCTIONS
//===================================================================================================

/// Hash bytes using SHA-256 - IC standard hash function
/// Provides consistent 256-bit hashing for all authentication operations
pub fn hash_bytes(value: impl AsRef<[u8]>) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(value.as_ref());
    hasher.finalize().into()
}


/// Hash with domain separator for cryptographic security
/// Prevents hash collision attacks between different contexts
/// Format: hash(len(separator) || separator || bytes)
pub fn hash_with_domain(separator: &[u8], bytes: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update([separator.len() as u8]);
    hasher.update(separator);
    hasher.update(bytes);
    hasher.finalize().into()
}

/// Combine multiple byte arrays and hash the result
/// Useful for creating composite identifiers from multiple inputs
pub fn hash_combined(parts: &[&[u8]]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    for part in parts {
        hasher.update(part);
    }
    hasher.finalize().into()
}

//===================================================================================================
// STRUCTURED HASHING FUNCTIONS
//===================================================================================================

/// Hash a key-value pair for delegation structures
/// Returns hash(key) + hash(value) as 64-byte array for deterministic delegation hashing
pub fn hash_key_value_pair(key: &str, value: &[u8]) -> [u8; 64] {
    let key_hash = hash_bytes(key);
    let value_hash = hash_bytes(value);

    let mut result = [0u8; 64];
    result[..32].copy_from_slice(&key_hash);
    result[32..].copy_from_slice(&value_hash);
    result
}

/// Encode u64 value as LEB128 bytes for IC compatibility
/// LEB128 (Little Endian Base 128) encoding used for timestamps and numeric values
pub fn leb128_encode_u64(value: u64) -> Vec<u8> {
    let mut buf = Vec::new();
    leb128::write::unsigned(&mut buf, value).expect("LEB128 encoding should never fail for u64");
    buf
}


/// Convert hex string to 32-byte hash
///
/// Handles hex decoding and ensures exactly 32 bytes for hash/key usage.
/// Automatically strips 0x prefix if present.
///
/// Usage: Convert hex message IDs, session IDs, etc. to [u8; 32]
/// ```rust
/// let hash = hex_to_hash("abc123def456...")?;
/// let hash = hex_to_hash("0xabc123def456...")?; // 0x prefix OK
/// ```
pub fn hex_to_hash(hex_string: &str) -> AuthResult<[u8; 32]> {
    let cleaned_hex = hex_string.trim_start_matches("0x");
    let decoded_bytes = hex::decode(cleaned_hex)?;

    if decoded_bytes.len() != 32 {
        return Err(AuthError::ValidationError(format!(
            "Hash must be exactly 32 bytes, got {}",
            decoded_bytes.len()
        )));
    }

    let mut hash = [0u8; 32];
    hash.copy_from_slice(&decoded_bytes);
    Ok(hash)
}