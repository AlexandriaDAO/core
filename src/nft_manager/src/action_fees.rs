use candid::{Principal, Nat};
use ic_cdk::{update, caller};
use crate::guard::not_anon;
use crate::{emporium_principal, icp_swap_principal};
use crate::coordinate_mint::verify_lbry_payment;

// Make constants public so they can be used in other modules
pub const LBRY_E8S: u64 = 100_000_000; // Base fee of 1 LBRY.
pub const LBRY_MINT_COST: u64 = 5;
pub const LBRY_MINT_COST_E8S: u64 = LBRY_MINT_COST * LBRY_E8S;
pub const LBRY_SHELF_CREATION_COST: u64 = 50;
pub const LBRY_SHELF_CREATION_COST_E8S: u64 = LBRY_SHELF_CREATION_COST * LBRY_E8S;

// Only Emporium could call this, since it accesses the topup acccount.
// Currently 4X the mint cost (5 cents).
#[update(guard = "not_anon")]
pub async fn deduct_marketplace_fee(user_principal: Principal) -> Result<String, String> {
    let caller = caller();

    if caller != emporium_principal() {
        return Err("Only the emporium can call this function.".to_string());
    }

    let burn_result = burn_lbry(user_principal, Nat::from(LBRY_MINT_COST_E8S*4)).await;
    if let Err(e) = burn_result {
        return Err(format!("Error burning tokens: {}", e));
    }

    Ok("Marketplace fee successfully deducted.".to_string())
}

#[update(guard = "not_anon")]
pub async fn deduct_upload_fee(from: Principal, file_size_bytes: u64) -> Result<(), String> {
    let file_size_mb = (file_size_bytes as f64 / (1024.0 * 1024.0)).ceil() as u64;
    let lbry_to_burn = 5 * file_size_mb * LBRY_E8S;
    burn_lbry(from, Nat::from(lbry_to_burn)).await
}

#[update(guard = "not_anon")]
pub async fn deduct_shelf_creation_fee(user_principal: Principal) -> Result<String, String> {
    let burn_result = burn_lbry(user_principal, Nat::from(LBRY_SHELF_CREATION_COST_E8S)).await;
    if let Err(_e) = burn_result {
        return Err("Not enough balance. Shelves cost 50 LBRY to create.".to_string());
    }

    Ok("Shelf creation fee successfully deducted.".to_string())
}

// Overarching utility function for burning LBRY.
async fn burn_lbry(from: Principal, amount: Nat) -> Result<(), String> {
    verify_lbry_payment(
        from,
        icp_swap_principal(),
        None,
        amount
    )
    .await
    .map_err(|_| "Failed to burn LBRY tokens (transfer to ICP_SWAP failed)".to_string())
}

// This one is used for minting an original NFT (burns 1 LBRY).
pub async fn burn_mint_fee(from: Principal) -> Result<(), String> {
    burn_lbry(from, Nat::from(LBRY_MINT_COST_E8S)).await
}