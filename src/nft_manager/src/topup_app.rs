use candid::{Nat, Principal};
use ic_cdk::api::call::CallResult;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};

use crate::guard::not_anon;
use crate::id_converter::principal_to_subaccount;
use crate::topup_wallet::get_topup_balance;
use crate::{lbry_principal, kairos_principal};

/// Check if a canister is approved to spend from user's locked balance
fn is_approved_app(canister: Principal) -> bool {
    canister == kairos_principal()
    // Add more approved apps here as needed
}

/// Transfer LBRY from user's locked balance to an approved app's user subaccount.
/// This allows apps like Kairos to use the user's spending balance for gaming.
///
/// # Flow
/// 1. User calls this function with app canister and amount
/// 2. Validates app is approved (e.g., Kairos)
/// 3. Checks user has sufficient locked balance
/// 4. Transfers from NFT Manager subaccount[user] → App subaccount[user]
///
/// # Arguments
/// * `app_canister` - The canister ID of the app (must be approved)
/// * `amount` - Amount in e8s to transfer
///
/// # Returns
/// * Block index on success
#[ic_cdk::update(guard = "not_anon")]
pub async fn spend_for_app(app_canister: Principal, amount: u64) -> Result<Nat, String> {
    let caller = ic_cdk::caller();

    // Validate app is approved
    if !is_approved_app(app_canister) {
        return Err("App not authorized to spend from locked balance".to_string());
    }

    // Check user has sufficient balance
    let balance = get_topup_balance(caller).await?;
    let amount_nat = Nat::from(amount);
    let fee = Nat::from(4_000_000u64); // 0.04 LBRY fee

    let total_needed = amount_nat.clone() + fee.clone();
    if balance < total_needed {
        return Err(format!(
            "Insufficient balance. Required: {} (including fee), Available: {}",
            total_needed, balance
        ));
    }

    // Transfer from user's NFT Manager subaccount to app's user subaccount
    let transfer_arg = TransferArg {
        to: Account {
            owner: app_canister,
            subaccount: Some(principal_to_subaccount(caller)),
        },
        fee: Some(fee),
        memo: None,
        from_subaccount: Some(principal_to_subaccount(caller)),
        created_at_time: None,
        amount: amount_nat,
    };

    let transfer_result: CallResult<(Result<Nat, TransferError>,)> = ic_cdk::call(
        lbry_principal(),
        "icrc1_transfer",
        (transfer_arg,),
    ).await;

    match transfer_result {
        Ok((Ok(block_index),)) => Ok(block_index),
        Ok((Err(e),)) => Err(format!("LBRY transfer failed: {:?}", e)),
        Err((code, msg)) => Err(format!("Error calling LBRY canister: {:?} - {}", code, msg)),
    }
}
