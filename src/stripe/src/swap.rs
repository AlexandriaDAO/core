use crate::{
    exchange_rate::get_icp_usd_rate,
    storage::{get_user_balance, update_user_balance},
};
use candid::{CandidType, Deserialize, Nat, Principal};
use ic_cdk::{
    api::{call, caller, id},
    println,
};
use num_traits::cast::ToPrimitive;

// ICP Ledger canister ID
const ICP_LEDGER_CANISTER_ID: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai"; // Same for Local and mainnet development

// Helper function: Send ICP to user
async fn send_icp_to_user(recipient: Principal, amount_e8s: u64) -> Result<Nat, String> {
    let to_account = Account {
        owner: recipient,
        subaccount: None,
    };

    let transfer_arg = TransferArg {
        to: to_account,
        fee: None,
        memo: None,
        from_subaccount: None,
        created_at_time: None,
        amount: Nat::from(amount_e8s),
    };

    let ledger_principal = Principal::from_text(ICP_LEDGER_CANISTER_ID)
        .map_err(|e| format!("Invalid ledger principal: {}", e))?;

    let call_result: (Result<Nat, String>,) =
        call::call(ledger_principal, "icrc1_transfer", (transfer_arg,))
            .await
            .map_err(|err| format!("Failed to transfer ICP: {:?}", err))?;

    let result: Result<Nat, String> = call_result.0;

    match result {
        Ok(block_index) => Ok(block_index),
        Err(error) => Err(format!("Transfer failed: {}", error)),
    }
}

// Helper function: Get canister ICP balance
async fn query_canister_icp_balance() -> Result<u64, String> {
    let canister_principal = id();
    let account = Account {
        owner: canister_principal,
        subaccount: None,
    };

    let ledger_principal = Principal::from_text(ICP_LEDGER_CANISTER_ID)
        .map_err(|e| format!("Invalid ledger principal: {}", e))?;

    let call_result: (Nat,) = call::call(ledger_principal, "icrc1_balance_of", (account,))
        .await
        .map_err(|err| format!("Failed to query ICP balance: {:?}", err))?;

    let balance: Nat = call_result.0;

    let balance_e8s = balance.0.to_u64().unwrap_or(0);
    Ok(balance_e8s)
}

#[derive(CandidType, Deserialize)]
pub struct Account {
    pub owner: Principal,
    pub subaccount: Option<Vec<u8>>,
}

#[derive(CandidType)]
pub struct TransferArg {
    pub to: Account,
    pub fee: Option<Nat>,
    pub memo: Option<Vec<u8>>,
    pub from_subaccount: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
    pub amount: Nat,
}

// Comprehensive swap method: USD balance to ICP
#[ic_cdk::update]
pub async fn swap_usd_to_icp() -> Result<String, String> {
    let user_principal = caller();

    // Step 0: Reject anonymous callers
    if user_principal == Principal::anonymous() {
        return Err("Authentication required. Anonymous users cannot perform swaps".to_string());
    }

    println!("Processing swap for user: {}", user_principal.to_text());

    // Step 1: Check user's USD balance (minimum 5 USD)
    let user_balance = get_user_balance(&user_principal);
    let usd_balance_dollars = user_balance.balance as f64 / 100.0; // Convert cents to dollars

    println!(
        "User has ${:.2} USD available for swap",
        usd_balance_dollars
    );

    // Step 2: Get current ICP exchange rate
    let icp_price_usd = get_icp_usd_rate()
        .await
        .map_err(|e| format!("Failed to get ICP rate: {}", e))?;

    println!("Current ICP rate: ${:.2} USD", icp_price_usd);

    // Step 3: Calculate ICP amount user will receive
    let icp_amount = usd_balance_dollars / icp_price_usd;
    let icp_amount_e8s = (icp_amount * 100_000_000.0) as u64;

    println!(
        "User will receive: {:.8} ICP ({} e8s)",
        icp_amount, icp_amount_e8s
    );

    // Step 4: Check canister's ICP balance
    let canister_icp_balance = query_canister_icp_balance()
        .await
        .map_err(|e| format!("Failed to get canister balance: {}", e))?;

    let canister_icp_amount = canister_icp_balance as f64 / 100_000_000.0;
    println!("Canister has {:.8} ICP available", canister_icp_amount);

    if canister_icp_balance < icp_amount_e8s {
        return Err(format!(
            "Insufficient canister reserves. Need {:.8} ICP but only have {:.8} ICP available",
            icp_amount, canister_icp_amount
        ));
    }

    // Step 5: Execute the swap
    // Deduct user's USD balance
    update_user_balance(&user_principal, |balance| {
        balance.balance = 0; // Use entire balance for swap
    });

    // Send ICP to user
    match send_icp_to_user(user_principal, icp_amount_e8s).await {
        Ok(block_index) => {
            println!("Swap successful, block index: {}", block_index);
            Ok(format!(
                "Swap successful! Converted ${:.2} USD to {:.8} ICP. Transaction block: {}",
                usd_balance_dollars, icp_amount, block_index
            ))
        }
        Err(error) => {
            // Rollback: restore user's USD balance if transfer failed
            update_user_balance(&user_principal, |balance| {
                balance.balance = user_balance.balance;
            });

            println!("Swap failed: {}", error);
            Err(format!("Swap failed: {}", error))
        }
    }
}
