use candid::CandidType;
use serde::{Deserialize, Serialize};
use ic_cdk::{query, update, api::id};
use crate::{lbry_principal, alex_principal};

use ic_ledger_types::{
    AccountIdentifier, Tokens,
    MAINNET_LEDGER_CANISTER_ID,
};

use candid::Nat;

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

// Helper function to convert Nat to f64
fn nat_to_f64(nat: Nat) -> f64 {
    let bytes = nat.0.to_bytes_be();
    let mut value: u64 = 0;
    for byte in bytes {
        value = value * 256 + byte as u64;
    }
    value as f64 / 100_000_000.0
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct BalanceResult {
    pub icp: f64,
    pub alex: f64,
    pub lbry: f64,
}

#[derive(CandidType, Clone)]
struct Account {
    owner: candid::Principal,
    subaccount: Option<Vec<u8>>,
}

#[update]
pub async fn check_balances(account_names: Vec<String>) -> Vec<BalanceResult> {
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
        
        // Get the subaccount for ICRC1 tokens
        let subaccount = match name.to_lowercase().as_str() {
            "alice" => get_test_subaccount(1),
            "bob" => get_test_subaccount(2),
            "charlie" => get_test_subaccount(3),
            _ => unreachable!(),
        };

        // Call the ledger canister to get ICP balance
        let icp_balance: Result<(Tokens,), _> = ic_cdk::call(
            MAINNET_LEDGER_CANISTER_ID,
            "account_balance",
            (args,)
        ).await;
        
        // Create ICRC1 account
        let icrc1_account = Account {
            owner: id(),
            subaccount: Some(subaccount.0.to_vec()),
        };

        // Get ALEX balance
        let alex_balance: Result<(Nat,), _> = ic_cdk::call(
            alex_principal(),
            "icrc1_balance_of",
            (icrc1_account.clone(),)
        ).await;

        // Get LBRY balance
        let lbry_balance: Result<(Nat,), _> = ic_cdk::call(
            lbry_principal(),
            "icrc1_balance_of",
            (icrc1_account,)
        ).await;

        let balance = BalanceResult {
            icp: match icp_balance {
                Ok((tokens,)) => e8s_to_icp(tokens.e8s()),
                Err(err) => ic_cdk::trap(&format!("Failed to get ICP balance: {:?}", err)),
            },
            alex: match alex_balance {
                Ok((tokens,)) => nat_to_f64(tokens),
                Err(err) => ic_cdk::trap(&format!("Failed to get ALEX balance: {:?}", err)),
            },
            lbry: match lbry_balance {
                Ok((tokens,)) => nat_to_f64(tokens),
                Err(err) => ic_cdk::trap(&format!("Failed to get LBRY balance: {:?}", err)),
            },
        };
        
        balances.push(balance);
    }
    
    balances
}
