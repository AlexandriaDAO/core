use ic_cdk::api::management_canister::main::raw_rand;
use ic_cdk::api::time;
use base58::ToBase58;
use ic_cdk::export::Principal;

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
    let hash = ic_cdk::api::crypto::sha256(&combined);
    let id = &hash[..12].to_base58();
    
    // Add prefix
    format!("sh_{}", id)
} 