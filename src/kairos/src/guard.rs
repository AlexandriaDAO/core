use candid::Principal;
use ic_cdk::caller;

/// Guard to reject anonymous callers
pub fn not_anon() -> Result<(), String> {
    if caller() == Principal::anonymous() {
        Err("Anonymous callers not allowed".to_string())
    } else {
        Ok(())
    }
}
