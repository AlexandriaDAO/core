use ic_cdk::api::management_canister::main::raw_rand;
use ic_cdk::api::time;
use candid::Principal;
use sha2::{Sha256, Digest};
use bs58;

pub mod id_conversion;

pub async fn generate_shelf_id(caller: &Principal) -> String {
    // Get current timestamp in nanoseconds from IC
    let timestamp = time();
    
    // Get random bytes from IC
    let random_bytes = raw_rand().await.unwrap().0;
    
    // Combine components
    let mut combined = Vec::new();
    combined.extend_from_slice(&timestamp.to_be_bytes());
    combined.extend_from_slice(caller.as_slice());
    combined.extend_from_slice(&random_bytes);
    
    // Take first 12 bytes of hash and encode as base58
    let mut hasher = Sha256::new();
    hasher.update(&combined);
    let hash = hasher.finalize();
    let id = bs58::encode(&hash[..12]).into_string();
    
    // Add prefix
    format!("sh_{}", id)
}

/// Normalizes a tag by converting to lowercase and trimming whitespace.
pub fn normalize_tag(tag: &str) -> String {
    tag.trim().to_lowercase()
} 