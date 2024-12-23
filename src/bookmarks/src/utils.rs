use candid::Principal;
use sha2::{Sha256, Digest};

// This is important so we don't ever reveal the user's principal, and only in knowing a principal can a user access stuff.
pub fn hash_principal(principal: Principal) -> u64 {
    let hash = Sha256::digest(principal.as_slice());
    let mut bytes = [0u8; 8];
    bytes.copy_from_slice(&hash[..8]); // Turn the first 8 bytes into a u64.
    u64::from_be_bytes(bytes)
}