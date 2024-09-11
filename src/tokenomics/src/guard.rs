
use crate::storage::*;

pub fn is_allowed() -> Result<(), String> {
    if ALLOWED_CALLERS.with(|users| users.borrow().contains(&ic_cdk::api::caller())) {
        Ok(())
    } else {
        ic_cdk::println!("Caller principal is {}", &ic_cdk::api::caller());
        Err("You are unauthorized to call this method. ".to_string())
    }
}
