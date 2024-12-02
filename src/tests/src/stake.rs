use ic_cdk::update;
use icrc_ledger_types::icrc2::approve::{ApproveArgs, ApproveError};
use icrc_ledger_types::icrc1::account::Account;
use candid::Nat;
use crate::utils::{get_test_subaccount, E8S_PER_ALEX, ALEX_FEE};

#[update]
pub async fn stake(amount: u64, balance_name: String) -> Result<String, String> {
    let swap_canister_id = crate::icp_swap_principal();

    if amount < 1 {
        return Err("Minimum Stake is 1 ALEX".to_string());
    }

    // get subaccount from balance name
    let from_subaccount = get_test_subaccount(&balance_name)
        .map_err(|_| format!("Invalid balance name: {}. Must be one of: admin, alice, bob, charlie", balance_name))?;

    let amount_e8s = amount * E8S_PER_ALEX;

    // Approve ALEX transfer
    let approve_args = ApproveArgs {
        spender: Account {
            owner: swap_canister_id,
            subaccount: None,
        },
        amount: Nat::from(amount_e8s + ALEX_FEE),
        fee: Some(Nat::from(ALEX_FEE)),
        memo: None,
        from_subaccount: Some(from_subaccount),
        created_at_time: None,
        expected_allowance: None,
        expires_at: None,
    };

    // Call approve on ALEX ledger
    let approve_result: Result<(Result<Nat, ApproveError>,), _> = ic_cdk::call(
        crate::alex_principal(),
        "icrc2_approve",
        (approve_args,),
    ).await;

    match approve_result {
        Ok((Ok(_),)) => {
            // Call stake function on swap canister
            let stake_result: Result<(Result<String, String>,), _> = ic_cdk::call(
                swap_canister_id,
                "stake_ALEX",
                (amount, Some(from_subaccount)),
            ).await;

            match stake_result {
                Ok((Ok(message),)) => Ok(message),
                Ok((Err(e),)) => Err(format!("Stake error: {}", e)),
                Err(e) => Err(format!("Stake call failed: {:?}", e)),
            }
        },
        Ok((Err(e),)) => Err(format!("Approval failed: {:?}", e)),
        Err(e) => Err(format!("Approval call failed: {:?}", e)),
    }
}