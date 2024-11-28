use crate::tests_principal;
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
    
    // Basic validation
    if amount_lbry < 1 {
        return Err("Minimum amount is 1 LBRY".to_string());
    }
    
    // Get test subaccount (needed to simulate different users)
    let subaccount = get_test_subaccount(account_name.clone())
        .map_err(|e| format!("Failed to get test subaccount: {:?}", e))?;

    // Approve LBRY transfer (needed because we're simulating a user)
    let amount_lbry_e8s = amount_lbry * E8S_PER_ICP;
    let _ = approve_lbry_transfer(account_name.clone(), amount_lbry_e8s).await
        .map_err(|e| format!("Approval failed: {:?}", e))?;

    // Verify the allowance was set correctly
    let allowance = verify_allowance(account_name.clone(), amount_lbry_e8s).await
        .map_err(|e| format!("Failed to verify allowance: {:?}", e))?;
    
    if allowance != Nat::from(amount_lbry_e8s + LBRY_FEE) {
        return Err(format!("Allowance verification failed. Expected: {}, Got: {}", 
            amount_lbry_e8s + LBRY_FEE, allowance));
    }

    // Call burn function
    let swap_canister_id = crate::icp_swap_principal();
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
    let subaccount = get_test_subaccount(account_name.clone())
        .map_err(|e| (e, "Failed to get test subaccount".to_string()))?;
    
    // Increase the buffer for fees
    let approve_amount = amount_e8s + LBRY_FEE;
    
    let approve_args = ApproveArgs {
        spender: Account {
            owner: swap_canister_id,
            subaccount: None  // Match frontend: no spender subaccount
        },
        amount: Nat::from(approve_amount),
        fee: Some(Nat::from(LBRY_FEE)),
        memo: None,
        from_subaccount: Some(subaccount),  // We need this for test accounts
        created_at_time: None,  // Match frontend: no created_at_time
        expected_allowance: None,  // Match frontend: no expected_allowance
        expires_at: None,  // Match frontend: no expires_at
    };

    ic_cdk::println!("Approving {} e8s for spender: {}", approve_amount, swap_canister_id);
    ic_cdk::println!("From subaccount: {:?}", subaccount);
    ic_cdk::println!("Full approve args: {:?}", approve_args);

    let approve_result: Result<(Result<Nat, ApproveError>,), _> = ic_cdk::call(
        crate::lbry_principal(),
        "icrc2_approve",
        (approve_args,),
    ).await;

    match approve_result {
        Ok((Ok(block_index),)) => {
            ic_cdk::println!("Approval successful! Block index: {}", block_index);
            Ok(block_index)
        },
        Ok((Err(e),)) => {
            ic_cdk::println!("Approval failed with error: {:?}", e);
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
