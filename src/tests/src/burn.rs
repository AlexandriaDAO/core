use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::update;
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};
use icrc_ledger_types::icrc1::account::Account;
use candid::Nat;
use candid::{CandidType, Deserialize};
use icrc_ledger_types::icrc2::approve::{ApproveArgs, ApproveError};
use icrc_ledger_types::icrc2::allowance::{AllowanceArgs};

const E8S_PER_ICP: u64 = 100_000_000;
const MIN_DELAY_NS: u64 = 2_000_000_000; // 2 seconds in nanoseconds
const LBRY_FEE: u64 = 4_000_000;

#[derive(CandidType, Debug, Deserialize)]
pub struct BurnRequest {
    account_name: String,
    amount_lbry: u64,
}

#[derive(CandidType, Debug, Deserialize)]
pub struct BurnResult {
    account_name: String,
    result: Result<String, String>,
}

#[derive(CandidType, Deserialize, Debug)]
struct AllowanceResponse {
    allowance: Nat,
    expires_at: Option<u64>,
}

#[update]
pub async fn test_burn_batch(requests: Vec<BurnRequest>) -> Vec<BurnResult> {
    let mut results = Vec::with_capacity(requests.len());
    
    for request in requests {
        let BurnRequest { account_name, amount_lbry } = request;
        let result = test_burn_single(account_name.clone(), amount_lbry).await;
        results.push(BurnResult {
            account_name,
            result,
        });
    }
    
    results
}

async fn test_burn_single(account_name: String, amount_lbry: u64) -> Result<String, String> {
    let owner_id = ic_cdk::api::id();
    ic_cdk::println!("Starting test_burn with owner ID: {} ({:?})", owner_id, owner_id.as_slice());
    
    // Check swap canister balance first
    let swap_balance: f64 = super::balances::check_swap_canister_balance().await;
    ic_cdk::println!("Current swap canister balance: {} ICP", swap_balance);
    
    ic_cdk::println!("Testing burn for account: {}, amount: {} LBRY", account_name, amount_lbry);
    
    if amount_lbry < 1 {
        return Err("Minimum amount is 1 LBRY".to_string());
    }
    
    // Approve with e8s amount
    let approve_result = match approve_lbry_transfer(account_name.clone(), amount_lbry).await {
        Ok(result) => result,
        Err(e) => return Err(format!("LBRY approval failed: {:?}", e)),
    };
    ic_cdk::println!("LBRY approval successful! Block index: {}", approve_result);
    
    // Add a delay to ensure approval is processed
    ic_cdk::println!("Waiting for approval to be processed...");
    let _ = ic_cdk::api::call::call_raw(
        Principal::from_text("aaaaa-aa").unwrap(),
        "raw_rand",
        &[],
        MIN_DELAY_NS,
    ).await;

    // Add allowance verification after the delay
    let allowance = match verify_allowance(account_name.clone(), amount_lbry).await {
        Ok(allowance) => allowance,
        Err(e) => return Err(format!("Failed to verify allowance: {:?}", e)),
    };
    
    ic_cdk::println!("Current LBRY allowance: {}", allowance);
    
    if allowance < Nat::from(amount_lbry) {
        return Err(format!("Insufficient allowance. Required: {}, Current: {}", amount_lbry, allowance));
    }

    // Call burn function on the swap canister
    let swap_canister_id = crate::icp_swap_principal();
    let subaccount = get_test_subaccount(account_name.clone())
        .map_err(|e| format!("Failed to get test subaccount: {:?}", e))?;

    ic_cdk::println!("Subaccount for burn: {:?}", subaccount);

    let swap_canister_id = crate::icp_swap_principal();
    
    // Get current LBRY ratio and calculate expected ICP amount
    let ratio_result: Result<(u64,), _> = ic_cdk::call(
        swap_canister_id,
        "get_current_LBRY_ratio",
        (),
    ).await;
    
    if let Ok((ratio,)) = ratio_result {
        ic_cdk::println!("Current LBRY ratio: {} cents", ratio);
        let expected_icp = (amount_lbry as f64 * 100_000_000.0) / (ratio as f64 * 2.0);
        ic_cdk::println!("Expected ICP needed: {} ICP", expected_icp / 100_000_000.0);
    }

    let verify_args = AllowanceArgs {
        account: Account {
            owner: owner_id,
            subaccount: Some(subaccount),
        },
        spender: Account {
            owner: swap_canister_id,
            subaccount: None,
        },
    };

    // Double check allowance right before burn
    let final_allowance: Result<(AllowanceResponse,), _> = ic_cdk::call(
        crate::lbry_principal(),
        "icrc2_allowance",
        (verify_args,),
    ).await;

    match &final_allowance {
        Ok((response,)) => {
            ic_cdk::println!("Final allowance check before burn:");
            ic_cdk::println!("  Allowance: {}", response.allowance);
            ic_cdk::println!("  Expires at: {:?}", response.expires_at);
        },
        Err(e) => ic_cdk::println!("Failed to check final allowance: {:?}", e),
    };

    ic_cdk::println!("Burn parameters:");
    ic_cdk::println!("Amount: {}", amount_lbry);
    ic_cdk::println!("Owner: {}", owner_id);
    ic_cdk::println!("Subaccount: {:?}", subaccount);
    ic_cdk::println!("Swap canister: {}", swap_canister_id);

    let burn_result: Result<(Result<String, String>,), _> = ic_cdk::call(
        swap_canister_id,
        "burn_LBRY",
        (amount_lbry, Some(subaccount)),
    ).await;

    match burn_result {
        Ok((Ok(message),)) => Ok(message),
        Ok((Err(e),)) => Err(format!("Burn error: {}", e)),
        Err(e) => Err(format!("Call failed: {:?}", e)),
    }
}

async fn approve_lbry_transfer(account_name: String, amount_e8s: u64) -> CallResult<Nat> {
    let swap_canister_id = crate::icp_swap_principal();
    let owner_id = ic_cdk::api::id();
    
    // Add buffer to approval amount for fees (similar to ICP swap)
    let approve_amount = amount_e8s + LBRY_FEE * 2;
    
    let subaccount = get_test_subaccount(account_name.clone())
        .map_err(|e| (e, "Failed to get test subaccount".to_string()))?;
    
    let approve_args = ApproveArgs {
        spender: Account {
            owner: swap_canister_id,
            subaccount: None,
        },
        amount: Nat::from(approve_amount),
        fee: Some(Nat::from(LBRY_FEE)), // Add fee parameter
        memo: None,
        from_subaccount: Some(subaccount),
        created_at_time: None,
        expected_allowance: None,
        expires_at: None,
    };

    ic_cdk::println!("Approving from canister principal: {}", ic_cdk::api::id());
    ic_cdk::println!("Approving {} e8s for spender (raw principal): {:?}", amount_e8s, swap_canister_id.as_slice());
    ic_cdk::println!("Approving {} e8s for spender (text format): {}", amount_e8s, swap_canister_id.to_text());
    ic_cdk::println!("From subaccount: {:?}", subaccount);
    ic_cdk::println!("Full approve args: {:?}", approve_args);

    let approve_result: Result<(Result<Nat, ApproveError>,), _> = ic_cdk::call(
        crate::lbry_principal(),
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

    let args = AllowanceArgs {
        account: Account {
            owner: ic_cdk::api::id(),
            subaccount: Some(subaccount),
        },
        spender: Account {
            owner: swap_canister_id,
            subaccount: None,
        },
    };

    ic_cdk::println!("Checking LBRY allowance with args: {:?}", args);

    #[derive(CandidType, Deserialize, Debug)]
    struct AllowanceResponse {
        allowance: Nat,
        expires_at: Option<u64>,
    }

    let allowance_result: Result<(AllowanceResponse,), _> = ic_cdk::call(
        crate::lbry_principal(),
        "icrc2_allowance",
        (args,),
    ).await;

    match allowance_result {
        Ok((allowance,)) => {
            ic_cdk::println!("LBRY allowance check successful");
            ic_cdk::println!("Current allowance: {}", allowance.allowance);
            ic_cdk::println!("Expires at: {:?}", allowance.expires_at);
            Ok(allowance.allowance)
        },
        Err(e) => {
            ic_cdk::println!("LBRY allowance check failed: {:?}", e);
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
