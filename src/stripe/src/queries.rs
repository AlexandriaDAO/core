use crate::storage::get_user_balance;
use crate::types::UserBalance;
use candid::Principal;
use ic_cdk::{caller, query};

#[query]
fn get_balance() -> Result<UserBalance, String> {
    let caller = caller();
    if caller == Principal::anonymous() {
        return Err("Authentication required".to_string());
    }
    Ok(get_user_balance(&caller))
}

#[query]
fn health() -> String {
    "OK".to_string()
}
