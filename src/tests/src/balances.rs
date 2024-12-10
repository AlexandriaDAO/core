use candid::CandidType;
use serde::{Deserialize, Serialize};
use ic_cdk::{query, update, api::id};
use crate::{lbry_principal, alex_principal, utils::{get_test_subaccount, E8S_PER_ICP}};

use ic_ledger_types::{
    AccountIdentifier, Subaccount, Tokens, MAINNET_LEDGER_CANISTER_ID
};

use candid::Nat;

#[derive(CandidType, Serialize, Deserialize)]
pub struct TestAccounts {
    pub root: String,
    pub one: String,
    pub two: String,
    pub three: String,
}

// Get account identifiers for test users
#[query]
pub fn get_test_accounts() -> TestAccounts {
    let canister_id = id();
    
    // Create account IDs using different subaccounts
    let root_account = ic_ledger_types::AccountIdentifier::new(
        &canister_id, 
        &Subaccount(get_test_subaccount("root").unwrap())
    );
    let one_account = ic_ledger_types::AccountIdentifier::new(
        &canister_id, 
        &Subaccount(get_test_subaccount("one").unwrap())
    );
    let two_account = ic_ledger_types::AccountIdentifier::new(
        &canister_id, 
        &Subaccount(get_test_subaccount("two").unwrap())
    );
    let three_account = ic_ledger_types::AccountIdentifier::new(
        &canister_id, 
        &Subaccount(get_test_subaccount("three").unwrap())
    );
    
    TestAccounts {
        root: root_account.to_string(),
        one: one_account.to_string(),
        two: two_account.to_string(),
        three: three_account.to_string(),
    }
}

// Helper function to convert e8s to ICP (as f64)
fn e8s_to_icp(e8s: u64) -> f64 {
    e8s as f64 / E8S_PER_ICP as f64
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
            "root" => test_accounts.root.clone(),
            "one" => test_accounts.one.clone(),
            "two" => test_accounts.two.clone(),
            "three" => test_accounts.three.clone(),
            _ => ic_cdk::trap(&format!("Unknown account name: {}", name)),
        };
        
        let account = AccountIdentifier::from_hex(&account_str)
            .expect("Invalid account identifier format");
        let args = ic_ledger_types::AccountBalanceArgs { account };
        
        // Get the subaccount for ICRC1 tokens
        let subaccount = Subaccount(get_test_subaccount(&name)
            .unwrap_or_else(|_| ic_cdk::trap(&format!("Unknown account name: {}", name))));

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

#[update]
pub async fn check_swap_canister_balance() -> f64 {
    let swap_canister_id = crate::icp_swap_principal();
    
    // Create account identifier for the swap canister
    let account = AccountIdentifier::new(&swap_canister_id, &Subaccount([0; 32]));
    let args = ic_ledger_types::AccountBalanceArgs { account };
    
    // Call the ledger canister to get ICP balance
    let icp_balance: Result<(Tokens,), _> = ic_cdk::call(
        MAINNET_LEDGER_CANISTER_ID,
        "account_balance",
        (args,)
    ).await;

    match icp_balance {
        Ok((tokens,)) => e8s_to_icp(tokens.e8s()),
        Err(err) => ic_cdk::trap(&format!("Failed to get ICP balance: {:?}", err)),
    }
}
