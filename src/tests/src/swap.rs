use crate::icp_swap_principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::update;
use ic_ledger_types::AccountIdentifier;
use crate::balances::get_test_accounts;

#[update]
pub async fn swap_tokens(account_name: String, amount: u64) -> CallResult<()> {
    let test_accounts = get_test_accounts();
    
    // Get the account identifier based on the name
    let account_str = match account_name.to_lowercase().as_str() {
        "alice" => test_accounts.alice.clone(),
        "bob" => test_accounts.bob.clone(),
        "charlie" => test_accounts.charlie.clone(),
        _ => ic_cdk::trap(&format!("Unknown account name: {}", account_name)),
    };

    // Convert hex string to AccountIdentifier
    let account = AccountIdentifier::from_hex(&account_str)
        .unwrap_or_else(|_| ic_cdk::trap("Invalid account identifier format"));

    let swap_canister_id = icp_swap_principal();
    
    // Create a tuple with the correct types
    let args = (amount, account);  // Note: Swapped order to match expected types

    // Make the swap call
    ic_cdk::call(swap_canister_id, "swap", args).await
}
