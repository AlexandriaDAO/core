use candid::Principal;

use crate::{get_principal, ICP_SWAP_CANISTER_ID};

// pub fn is_allowed() -> Result<(), String> {
//     if ALLOWED_CALLERS.with(|users| users.borrow().contains(&ic_cdk::api::caller())) {
//         Ok(())
//     } else {
//         ic_cdk::println!("Caller principal is {}", &ic_cdk::api::caller());
//         Err("You are unauthorized to call this method. ".to_string())
//     }
// }

pub fn is_allowed() -> Result<(), String> {
    if ic_cdk::api::caller() == get_principal(ICP_SWAP_CANISTER_ID) {
        Ok(())
    } else {
        Err("You are unauthorized to call this method.".to_string())
    }
}

