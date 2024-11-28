use candid::Principal;
use ic_cdk::update;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc2::approve::{ApproveArgs, ApproveError};
use icrc_ledger_types::icrc2::allowance::{AllowanceArgs};
use candid::Nat;

const E8S_PER_ICP: u64 = 100_000_000;
const LBRY_FEE: u64 = 4_000_000;

#[update]
pub async fn burn_lbry(amount: u64, from_subaccount: Option<[u8; 32]>) -> Result<String, String> {
    let owner_id = ic_cdk::api::id();
    let swap_canister_id = crate::icp_swap_principal();
    
    // Basic validation
    if amount < 1 {
        return Err("Minimum amount is 1 LBRY".to_string());
    }

    // Convert amount to e8s
    let amount_e8s = amount * E8S_PER_ICP;

    // Approve LBRY transfer
    let approve_args = ApproveArgs {
        spender: Account {
            owner: swap_canister_id,
            subaccount: None
        },
        amount: Nat::from(amount_e8s + LBRY_FEE),
        fee: Some(Nat::from(LBRY_FEE)),
        memo: None,
        from_subaccount,
        created_at_time: None,
        expected_allowance: None,
        expires_at: None,
    };

    // Call approve on LBRY ledger
    let approve_result: Result<(Result<Nat, ApproveError>,), _> = ic_cdk::call(
        crate::lbry_principal(),
        "icrc2_approve",
        (approve_args,),
    ).await;

    match approve_result {
        Ok((Ok(_),)) => {
            // Call burn function on swap canister
            let burn_result: Result<(Result<String, String>,), _> = ic_cdk::call(
                swap_canister_id,
                "burn_LBRY",
                (amount, from_subaccount),
            ).await;

            match burn_result {
                Ok((Ok(message),)) => Ok(message),
                Ok((Err(e),)) => Err(format!("Burn error: {}", e)),
                Err(e) => Err(format!("Burn call failed: {:?}", e)),
            }
        },
        Ok((Err(e),)) => Err(format!("Approval failed: {:?}", e)),
        Err(e) => Err(format!("Approval call failed: {:?}", e)),
    }
}
