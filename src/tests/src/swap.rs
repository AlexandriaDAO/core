use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::update;
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};
use icrc_ledger_types::icrc2::approve::{ApproveArgs, ApproveError};
use icrc_ledger_types::icrc1::account::Account;
use candid::Nat;
use ic_ledger_types::{BlockIndex, MAINNET_LEDGER_CANISTER_ID};
use icrc_ledger_types::icrc2::allowance::{AllowanceArgs};
use std::time::Duration;
use candid::{CandidType, Deserialize};

const E8S_PER_ICP: u64 = 100_000_000;
const ICP_FEE: u64 = 10_000;
const MIN_DELAY_NS: u64 = 2_000_000_000; // 2 seconds in nanoseconds

#[update]
pub async fn test_swap(account_name: String, amount_icp: u64) -> Result<String, String> {
    let owner_id = ic_cdk::api::id();
    ic_cdk::println!("Starting test_swap with owner ID: {} ({:?})", owner_id, owner_id.as_slice());
    
    ic_cdk::println!("Testing swap for account: {}, amount: {} ICP", account_name, amount_icp);
    
    let amount_e8s = amount_icp * E8S_PER_ICP;
    
    if amount_e8s < 10_000_000 {
        return Err("Minimum amount is 0.1 ICP".to_string());
    }
    
    // 1. First approve the swap canister to spend tokens
    let approve_result = match approve_icp_transfer(account_name.clone(), amount_e8s).await {
        Ok(result) => result,
        Err(e) => return Err(format!("Approval failed: {:?}", e)),
    };
    ic_cdk::println!("ICP approval successful! Block index: {}", approve_result);
    
    // Add a delay to ensure approval is processed
    ic_cdk::println!("Waiting for approval to be processed...");
    let _ = ic_cdk::api::call::call_raw(
        Principal::from_text("aaaaa-aa").unwrap(),
        "raw_rand",
        &[],
        MIN_DELAY_NS,
    ).await;

    // 2. Verify allowance
    let allowance = match verify_allowance(account_name.clone(), amount_e8s).await {
        Ok(allowance) => allowance,
        Err(e) => return Err(format!("Failed to verify allowance: {:?}", e)),
    };
    
    ic_cdk::println!("Current allowance: {}", allowance);
    
    if allowance < Nat::from(amount_e8s) {
        return Err(format!("Insufficient allowance. Required: {}, Current: {}", amount_e8s, allowance));
    }

    // 3. Call swap function on the swap canister
    let swap_canister_id = crate::icp_swap_principal();
    let subaccount = get_test_subaccount(account_name.clone())
        .map_err(|e| format!("Failed to get test subaccount: {:?}", e))?;

    ic_cdk::println!("Attempting swap with canister ID: {}", swap_canister_id);
    ic_cdk::println!("Owner ID for transfer: {}", owner_id);
    ic_cdk::println!("Owner ID raw bytes: {:?}", owner_id.as_slice());
    ic_cdk::println!("Subaccount for transfer: {:?}", subaccount);

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

async fn approve_icp_transfer(account_name: String, amount_e8s: u64) -> CallResult<Nat> {
    let swap_canister_id = crate::icp_swap_principal();
    let owner_id = ic_cdk::api::id();
    
    // Log the principals we're using
    ic_cdk::println!("TEST CANISTER ID (owner): {} ({:?})", owner_id, owner_id.as_slice());
    ic_cdk::println!("SWAP CANISTER ID (spender): {} ({:?})", swap_canister_id, swap_canister_id.as_slice());
    
    // Add buffer to approval amount for fees (similar to frontend)
    let approve_amount = amount_e8s + ICP_FEE * 2;
    
    let subaccount = get_test_subaccount(account_name.clone())
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

    ic_cdk::println!("Approving from canister principal: {}", ic_cdk::api::id());
    ic_cdk::println!("Approving {} e8s for spender (raw principal): {:?}", approve_amount, swap_canister_id.as_slice());
    ic_cdk::println!("Approving {} e8s for spender (text format): {}", approve_amount, swap_canister_id.to_text());
    ic_cdk::println!("From subaccount: {:?}", subaccount);
    ic_cdk::println!("Full approve args: {:?}", approve_args);

    let approve_result: Result<(Result<Nat, ApproveError>,), _> = ic_cdk::call(
        MAINNET_LEDGER_CANISTER_ID,
        "icrc2_approve",
        (approve_args,),
    ).await;

    match approve_result {
        Ok((Ok(block_index),)) => {
            ic_cdk::println!("Approval successful with block index: {}", block_index);
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

async fn verify_allowance(account_name: String, amount_e8s: u64) -> CallResult<Nat> {
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

    ic_cdk::println!("Checking allowance with args: {:?}", args);

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
            ic_cdk::println!("Allowance check successful");
            ic_cdk::println!("Current allowance: {}", allowance.allowance);
            ic_cdk::println!("Expires at: {:?}", allowance.expires_at);
            Ok(allowance.allowance)
        },
        Err(e) => {
            ic_cdk::println!("Allowance check failed: {:?}", e);
            Err(e)
        }
    }
}

fn get_test_subaccount(account_name: String) -> Result<[u8; 32], ic_cdk::api::call::RejectionCode> {
    let mut subaccount = [0u8; 32];
    match account_name.to_lowercase().as_str() {
        "alice" => subaccount[0] = 1,
        "bob" => subaccount[0] = 2,
        "charlie" => subaccount[0] = 3,
        _ => {
            ic_cdk::println!("Unknown account name: {}", account_name);
            return Err(ic_cdk::api::call::RejectionCode::Unknown);
        }
    }
    Ok(subaccount)
}
