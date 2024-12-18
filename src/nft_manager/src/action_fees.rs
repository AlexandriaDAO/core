use candid::{Principal, Nat};
use ic_cdk::{update, caller};
use crate::guard::not_anon;
use crate::{emporium_principal, icp_swap_principal};
use crate::coordinate_mint::verify_lbry_payment;

// Make constants public so they can be used in other modules
pub const LBRY_E8S: u64 = 100_000_000; // Base fee of 1 LBRY.
pub const LBRY_MINT_COST: u64 = 1;
pub const LBRY_MINT_COST_E8S: u64 = LBRY_MINT_COST * LBRY_E8S;

// Only Emporium could call this, since it accesses the topup acccount.
#[update(guard = "not_anon")]
pub async fn deduct_marketplace_fee(user_principal: Principal) -> Result<String, String> {
    let caller = caller();

    if caller != emporium_principal() {
        return Err("Only the emporium can call this function.".to_string());
    }

    let burn_result = burn_lbry(user_principal, Nat::from(LBRY_MINT_COST_E8S*2)).await;
    if let Err(e) = burn_result {
        return Err(format!("Error burning tokens: {}", e));
    }

    Ok("Marketplace fee successfully deducted.".to_string())
}

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

// We do one for creating nodes, staking and unstaking, uploading files, etc.
// Anything that can be bot attacked, we can require a fee for.