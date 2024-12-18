use candid::{Principal, Nat};
use ic_cdk::{update, caller};
use crate::guard::not_anon;
use crate::{emporium_principal, icp_swap_principal};
use crate::coordinate_mint::verify_lbry_payment;


// Only Emporium could call this, since it accesses the topup acccount.
// Fee amount is in e8s, so 1 LBRY would be 'const LBRY_E8S: u64 = 100_000_000;' and Nat::from(LBRY_E8S)
#[update(guard = "not_anon")]
pub async fn deduct_marketplace_fee(user_principal: Principal, fee_amount: Nat) -> Result<String, String> {
    let caller = caller();

    if caller != emporium_principal() {
        return Err("Only the emporium can call this function.".to_string());
    }

    let burn_result = burn_lbry(user_principal, fee_amount).await;
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


// We do one for creating nodes, staking and unstaking, uploading files, etc.
// Anything that can be bot attacked, we can require a fee for.