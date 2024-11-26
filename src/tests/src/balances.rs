use candid::CandidType;
use serde::{Deserialize, Serialize};
use ic_cdk::{query, update, api::id};

use ic_ledger_types::{
    AccountIdentifier, Tokens,
    MAINNET_LEDGER_CANISTER_ID,
};

// Helper function to create a deterministic subaccount from an index
fn get_test_subaccount(index: u8) -> ic_ledger_types::Subaccount {
    let mut subaccount = ic_ledger_types::Subaccount([0; 32]);
    subaccount.0[0] = index;
    subaccount
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct TestAccounts {
    pub alice: String,
    pub bob: String,
    pub charlie: String,
}

// Get account identifiers for test users
#[query]
pub fn get_test_accounts() -> TestAccounts {
    let canister_id = id();
    
    // Create account IDs using different subaccounts
    let alice_account = ic_ledger_types::AccountIdentifier::new(&canister_id, &get_test_subaccount(1));
    let bob_account = ic_ledger_types::AccountIdentifier::new(&canister_id, &get_test_subaccount(2));
    let charlie_account = ic_ledger_types::AccountIdentifier::new(&canister_id, &get_test_subaccount(3));
    
    TestAccounts {
        alice: alice_account.to_string(),
        bob: bob_account.to_string(),
        charlie: charlie_account.to_string(),
    }
}

// Helper function to convert e8s to ICP (as f64)
fn e8s_to_icp(e8s: u64) -> f64 {
    e8s as f64 / 100_000_000.0
}

#[update]
pub async fn check_balances(account_names: Vec<String>) -> Vec<f64> {
    let mut balances = Vec::with_capacity(account_names.len());
    let test_accounts = get_test_accounts();
    
    for name in account_names {
        let account_str = match name.to_lowercase().as_str() {
            "alice" => test_accounts.alice.clone(),
            "bob" => test_accounts.bob.clone(),
            "charlie" => test_accounts.charlie.clone(),
            _ => ic_cdk::trap(&format!("Unknown account name: {}", name)),
        };
        
        let account = AccountIdentifier::from_hex(&account_str)
            .expect("Invalid account identifier format");
        let args = ic_ledger_types::AccountBalanceArgs { account };
        
        // Call the ledger canister to get balance
        let balance: Result<(Tokens,), _> = ic_cdk::call(
            MAINNET_LEDGER_CANISTER_ID,
            "account_balance",
            (args,)
        ).await;
        
        match balance {
            Ok((tokens,)) => balances.push(e8s_to_icp(tokens.e8s())),
            Err(err) => ic_cdk::trap(&format!("Failed to get balance: {:?}", err)),
        }
    }
    
    balances
}
