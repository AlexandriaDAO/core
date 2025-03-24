use candid::Principal;

pub fn not_anon() -> Result<(), String> {
    let caller = ic_cdk::api::caller();
    if caller != Principal::anonymous() {
        Ok(())
    } else {
        Err("Anonymous principal not allowed to make calls.".to_string())
    }
}
