use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::update;
use icrc_ledger_types::icrc2::approve::{ApproveArgs, ApproveError};
use icrc_ledger_types::icrc1::account::Account;
use candid::Nat;
use ic_ledger_types::MAINNET_LEDGER_CANISTER_ID;
use icrc_ledger_types::icrc2::allowance::{AllowanceArgs};
use candid::{CandidType, Deserialize};
use crate::utils::{get_test_subaccount, E8S_PER_ICP, ICP_FEE, MIN_DELAY_NS};

#[update]
pub async fn swap(amount_icp: u64, account_name: String) -> Result<String, String> {
    let amount_e8s = amount_icp * E8S_PER_ICP;
    
    if amount_e8s < 10_000_000 {
        return Err("Minimum amount is 0.1 ICP".to_string());
    }
    
    // 1. First approve the swap canister to spend tokens
    let approve_result = match approve_icp_transfer(&account_name, amount_e8s).await {
        Ok(result) => result,
        Err(e) => return Err(format!("Approval failed: {:?}", e)),
    };

    // Add a delay to ensure approval is processed
    let _ = ic_cdk::api::call::call_raw(
        Principal::from_text("aaaaa-aa").unwrap(),
        "raw_rand",
        &[],
        MIN_DELAY_NS,
    ).await;

    // 2. Verify allowance
    let allowance = match verify_allowance(&account_name, amount_e8s).await {
        Ok(allowance) => allowance,
        Err(e) => return Err(format!("Failed to verify allowance: {:?}", e)),
    };
    
    if allowance < Nat::from(amount_e8s) {
        return Err(format!("Insufficient allowance. Required: {}, Current: {}", amount_e8s, allowance));
    }

    // 3. Call swap function on the swap canister
    let swap_canister_id = crate::icp_swap_principal();
    let subaccount = get_test_subaccount(&account_name)
        .map_err(|e| format!("Failed to get test subaccount: {:?}", e))?;

    let swap_result: Result<(Result<String, String>,), _> = ic_cdk::call(
        swap_canister_id,
        "swap",
        (amount_e8s, Some(subaccount)),
    ).await;

    match swap_result {
        Ok((Ok(message),)) => Ok(message),
        Ok((Err(e),)) => Err(format!("Swap error: {}", e)),
        Err(e) => Err(format!("Call failed: {:?}", e)),
    }
}

async fn approve_icp_transfer(account_name: &str, amount_e8s: u64) -> CallResult<Nat> {
    let swap_canister_id = crate::icp_swap_principal();
    let owner_id = ic_cdk::api::id();
    
    // Add buffer to approval amount for fees (similar to frontend)
    let approve_amount = amount_e8s + ICP_FEE * 2;
    
    let subaccount = get_test_subaccount(account_name)
        .map_err(|e| (e, "Failed to get test subaccount".to_string()))?;
    
    let approve_args = ApproveArgs {
        spender: Account {
            owner: swap_canister_id,
            subaccount: None,
        },
        amount: Nat::from(approve_amount),
        fee: Some(Nat::from(ICP_FEE)),
        memo: None,
        from_subaccount: Some(subaccount),
        created_at_time: None,
        expected_allowance: None,
        expires_at: None,
    };

    let approve_result: Result<(Result<Nat, ApproveError>,), _> = ic_cdk::call(
        MAINNET_LEDGER_CANISTER_ID,
        "icrc2_approve",
        (approve_args,),
    ).await;

    match approve_result {
        Ok((Ok(block_index),)) => {
            Ok(block_index)
        },
        Ok((Err(e),)) => {
            ic_cdk::println!("Approval returned error: {:?}", e);
            Err((ic_cdk::api::call::RejectionCode::Unknown, format!("{:?}", e)))
        },
        Err(e) => {
            ic_cdk::println!("Approval call rejected: {:?}", e);
            Err(e)
        }
    }
}

async fn verify_allowance(account_name: &str, amount_e8s: u64) -> CallResult<Nat> {
    let swap_canister_id = crate::icp_swap_principal();
    let subaccount = get_test_subaccount(account_name)
        .map_err(|e| (e, "Failed to get test subaccount".to_string()))?;

    // Use the canister's own principal since it owns all test accounts
    let args = AllowanceArgs {
        account: Account {
            owner: ic_cdk::api::id(), // Use canister's principal instead of caller
            subaccount: Some(subaccount),
        },
        spender: Account {
            owner: swap_canister_id,
            subaccount: None,
        },
    };

    #[derive(CandidType, Deserialize, Debug)]
    struct AllowanceResponse {
        allowance: Nat,
        expires_at: Option<u64>,
    }

    let allowance_result: Result<(AllowanceResponse,), _> = ic_cdk::call(
        MAINNET_LEDGER_CANISTER_ID,
        "icrc2_allowance",
        (args,),
    ).await;

    match allowance_result {
        Ok((allowance,)) => {
            
            if allowance.allowance < Nat::from(amount_e8s) {
                return Err((
                    ic_cdk::api::call::RejectionCode::Unknown, 
                    format!("Insufficient allowance. Required: {}, Current: {}", amount_e8s, allowance.allowance)
                ));
            }
            
            Ok(allowance.allowance)
        },
        Err(e) => {
            ic_cdk::println!("Allowance check failed: {:?}", e);
            Err(e)
        }
    }
}