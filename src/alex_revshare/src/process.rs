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

// Internal function - only called by timer
pub async fn process_revenue() -> Result<String, String> {
    // Always check and burn LBRY first, regardless of ICP balance
    let lbry_burned = burn_all_lbry().await?;

    let balance = get_icp_balance().await?;

    if balance < MIN_ICP_BALANCE {
        return if lbry_burned > 0 {
            Ok(format!("Burned {} LBRY. ICP balance below minimum, skipping swap", lbry_burned))
        } else {
            Ok("ICP balance below minimum".to_string())
        };
    }

    // Calculate swap amount (reserve 0.1 ICP for fees)
    let swap_amount = balance.saturating_sub(ICP_RESERVE + 20_000);

    if swap_amount < 10_000_000 {
        return Ok("Swap amount too small after fees".to_string());
    }

    swap_icp_for_lbry(swap_amount).await?;
    let newly_burned = burn_all_lbry().await?;

    Ok(format!("Swapped {} ICP and burned {} LBRY",
        swap_amount / 100_000_000, lbry_burned + newly_burned))
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
            balance.0.try_into()
                .map_err(|_| "Balance too large for u64".to_string())
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
    
    // Call swap function
    let swap_result: Result<(Result<String, String>,), _> = ic_cdk::call(
        swap_canister,
        "swap",
        (amount, None::<[u8; 32]>)
    ).await;

    match swap_result {
        Ok((Ok(_),)) => Ok(()),
        Ok((Err(e),)) => Err(format!("Swap rejected: {}", e)),
        Err(e) => Err(format!("Swap call failed: {:?}", e))
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
            // Convert Nat to u64 using TryInto
            let parsed: u64 = balance.0.try_into()
                .map_err(|_| "LBRY balance too large for u64".to_string())?;
            Ok(parsed)
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