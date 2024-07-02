use crate::storage::*;

pub fn is_allowed() -> Result<(), String> {
    if ALLOWED_CALLERS.with(|users| users.borrow().contains(&ic_cdk::api::caller())) {
        Ok(())
    } else {
        ic_cdk::println!("Principal is {}",&ic_cdk::api::caller());
        Err("You are unauthorized to call this method. ".to_string())
    }
}

pub fn is_admin() -> Result<(), String> {
    if ic_cdk::api::caller().to_string()=="xswc6-jimwj-wnqog-3gmkv-hglw4-aedfy-bqmr2-5uyut-cnbbg-4wvsk-bqe" {
        Ok(())
    } else {
        Err("You are unauthorized to call this method.".to_string())
    }
}
