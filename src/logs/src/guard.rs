pub fn is_canister() -> Result<(), String> {
    if ic_cdk::api::caller() == ic_cdk::api::id() {
        Ok(())
    } else {
        Err("You are unauthorized to call this method.".to_string())
    }
}

