use candid::{Nat, Principal};
use ic_cdk::api::call::CallResult;
use icrc_ledger_types::icrc1::account::Account;
use std::str::FromStr;
use crate::storage::SHELVES;

/// Verifies if the specified NFT is owned by the caller
/// 
/// This performs validation of the NFT ID format and then makes a canister call
/// to the appropriate ICRC7 token canister to check ownership.
/// 
/// # Arguments
/// * `nft_id` - The ID of the NFT to check
/// * `caller` - The principal ID of the caller to verify against
/// 
/// # Returns
/// * `Ok(true)` if the caller owns the NFT
/// * `Ok(false)` if the caller does not own the NFT
/// * `Err(...)` if there was a validation or canister call error
pub async fn verify_nft_ownership(nft_id: &str, caller: Principal) -> Result<bool, String> {
    // First validate that we have a proper NFT ID format
    // NFT IDs should be numerical and quite long
    if !nft_id.chars().all(|c| c.is_digit(10)) {
        return Err(format!("Invalid NFT ID format: '{}'. The ID must be numeric. You may be trying to use an Arweave transaction ID instead of the actual NFT ID.", nft_id));
    }
    
    // Additional length validation (NFT IDs are typically very long numbers)
    if nft_id.len() < 10 {
        return Err(format!("Invalid NFT ID: '{}'. NFT IDs are typically long numeric strings (>10 digits).", nft_id));
    }
    
    // Use different canister based on ID length
    // SBTs have longer IDs (95 chars) compared to NFTs (73 chars)
    let is_sbt = nft_id.len() > 90;
    
    let canister_principal = if is_sbt {
        crate::icrc7_scion_principal()
    } else {
        crate::icrc7_principal()
    };
    
    // Convert string ID to Nat for canister call
    let token_nat = match Nat::from_str(nft_id) {
        Ok(nat) => nat,
        Err(_) => {
            return Err(format!("Could not convert '{}' to a valid NFT ID. Make sure you're using the actual NFT ID and not the Arweave transaction ID.", nft_id));
        }
    };
    
    // Call owner_of on the appropriate canister
    let owner_call_result: CallResult<(Vec<Option<Account>>,)> = ic_cdk::call(
        canister_principal,
        "icrc7_owner_of",
        (vec![token_nat],)
    ).await;
    
    match owner_call_result {
        Ok((owners,)) => {
            // Check if the first element matches the caller
            if let Some(Some(account)) = owners.first() {
                return Ok(account.owner == caller);
            }
            // No owner returned means NFT doesn't exist
            Err(format!("NFT with ID '{}' not found or has no owner", nft_id))
        },
        Err((code, msg)) => {
            Err(format!("Error fetching owner for NFT {}: {:?} - {}", nft_id, code, msg))
        }
    }
}

/// Checks if a shelf exists in the global shelf registry
/// 
/// # Arguments
/// * `shelf_id` - The ID of the shelf to check
/// 
/// # Returns
/// * `true` if the shelf exists
/// * `false` if the shelf does not exist
pub fn shelf_exists(shelf_id: &String) -> bool {
    SHELVES.with(|shelves| {
        shelves.borrow().contains_key(shelf_id)
    })
}

/// Checks if one shelf ID is trying to reference itself
/// 
/// This prevents creating circular references where a shelf
/// contains itself as a slot.
/// 
/// # Arguments
/// * `shelf_id` - The ID of the container shelf
/// * `nested_shelf_id` - The ID of the shelf being added as content
/// 
/// # Returns
/// * `true` if the IDs are the same (self-reference)
/// * `false` if the IDs are different
pub fn is_self_reference(shelf_id: &String, nested_shelf_id: &String) -> bool {
    // Only check for direct self-references (shelf A cannot contain shelf A)
    shelf_id == nested_shelf_id
} 