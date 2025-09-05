use candid::{Principal, Nat};
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc2::approve::{ApproveArgs, ApproveError};

// Constants
const MIN_ICP_BALANCE: u64 = 100_000_000;  // 1 ICP minimum to trigger swap
const ICP_RESERVE: u64 = 10_000_000;       // 0.1 ICP reserve for fees (matching lbryfun)

// Canister IDs
const ICP_LEDGER: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";
const LBRY_CANISTER: &str = "y33wz-myaaa-aaaap-qkmna-cai";
const CORE_ICP_SWAP: &str = "54fqz-5iaaa-aaaap-qkmqa-cai";
const LBRY_BURN_ADDRESS: &str = "54fqz-5iaaa-aaaap-qkmqa-cai"; // Minting account = burn

// Internal function - only called by timer, not exposed publicly
pub async fn process_revenue() -> Result<String, String> {
    let balance = get_icp_balance().await?;
    
    if balance < MIN_ICP_BALANCE {
        return Ok(format!("Balance {} below minimum {}", balance, MIN_ICP_BALANCE));
    }
    
    // Calculate swap amount (matching lbryfun's reserve calculation)
    // Need to account for approval fee (10_000) and transfer fee (10_000)
    let swap_amount = balance.saturating_sub(ICP_RESERVE + 20_000);
    
    // Sanity check - should never happen with MIN_ICP_BALANCE check
    if swap_amount < 10_000_000 { // Less than 0.1 ICP
        return Ok("Swap amount too small after fees".to_string());
    }
    
    swap_icp_for_lbry(swap_amount).await?;
    
    // Burn all LBRY
    let burned = burn_all_lbry().await?;
    
    Ok(format!("Swapped {} ICP and burned {} LBRY", swap_amount / 100_000_000, burned))
}

// Get current ICP balance
async fn get_icp_balance() -> Result<u64, String> {
    let ledger = Principal::from_text(ICP_LEDGER).unwrap();
    let account = Account {
        owner: ic_cdk::id(),
        subaccount: None,
    };
    
    let result: Result<(Nat,), _> = ic_cdk::call(
        ledger,
        "icrc1_balance_of",
        (account,)
    ).await;
    
    match result {
        Ok((balance,)) => {
            let balance_str = balance.to_string();
            Ok(balance_str.parse::<u64>().unwrap_or(0))
        }
        Err(e) => Err(format!("Failed to get balance: {:?}", e))
    }
}

// Swap ICP for LBRY using core swap canister - FIXED to match lbryfun
async fn swap_icp_for_lbry(amount: u64) -> Result<(), String> {
    let swap_canister = Principal::from_text(CORE_ICP_SWAP).unwrap();
    let icp_ledger = Principal::from_text(ICP_LEDGER).unwrap();
    
    // First approve the swap canister to spend our ICP
    // CRITICAL FIX: Using proper ApproveArgs from icrc-ledger-types
    let approve_args = ApproveArgs {
        from_subaccount: None,
        spender: Account {
            owner: swap_canister,
            subaccount: None,
        },
        amount: Nat::from(amount + 10_000), // Amount plus transfer fee
        expected_allowance: None,
        expires_at: None,
        fee: None,
        memo: None,
        created_at_time: None,
    };
    
    let approve_result: Result<(Result<Nat, ApproveError>,), _> = ic_cdk::call(
        icp_ledger,
        "icrc2_approve",
        (approve_args,)
    ).await;
    
    match approve_result {
        Ok((Ok(_),)) => {},
        Ok((Err(e),)) => return Err(format!("Approval failed: {:?}", e)),
        Err(e) => return Err(format!("Approval call failed: {:?}", e)),
    }
    
    // Call swap function on the core project's ICP_SWAP canister
    let swap_result: Result<(String,), _> = ic_cdk::call(
        swap_canister,
        "swap",
        (amount, None::<[u8; 32]>)
    ).await;
    
    match swap_result {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Swap failed: {:?}", e))
    }
}

// Get LBRY balance
async fn get_lbry_balance() -> Result<u64, String> {
    let lbry = Principal::from_text(LBRY_CANISTER).unwrap();
    let account = Account {
        owner: ic_cdk::id(),
        subaccount: None,
    };
    
    let result: Result<(Nat,), _> = ic_cdk::call(
        lbry,
        "icrc1_balance_of",
        (account,)
    ).await;
    
    match result {
        Ok((balance,)) => {
            let balance_str = balance.to_string();
            Ok(balance_str.parse::<u64>().unwrap_or(0))
        }
        Err(e) => Err(format!("Failed to get LBRY balance: {:?}", e))
    }
}

// Burn all LBRY tokens
async fn burn_all_lbry() -> Result<u64, String> {
    let lbry_balance = get_lbry_balance().await?;
    
    if lbry_balance == 0 {
        return Ok(0);
    }
    
    let lbry = Principal::from_text(LBRY_CANISTER).unwrap();
    let burn_address = Principal::from_text(LBRY_BURN_ADDRESS).unwrap();
    
    // Using icrc_ledger_types for the transfer
    let transfer_args = icrc_ledger_types::icrc1::transfer::TransferArg {
        from_subaccount: None,
        to: Account {
            owner: burn_address,
            subaccount: None,
        },
        fee: None,
        created_at_time: None,
        memo: None,
        amount: Nat::from(lbry_balance),
    };
    
    let result: Result<(Result<Nat, icrc_ledger_types::icrc1::transfer::TransferError>,), _> = ic_cdk::call(
        lbry,
        "icrc1_transfer",
        (transfer_args,)
    ).await;
    
    match result {
        Ok((Ok(_),)) => Ok(lbry_balance),
        Ok((Err(e),)) => Err(format!("Burn transfer failed: {:?}", e)),
        Err(e) => Err(format!("Burn call failed: {:?}", e))
    }
}