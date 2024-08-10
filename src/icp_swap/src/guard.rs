use crate::storage::REENTRANCY_GUARD;
use crate::{TOTAL_ICP_AVAILABLE, TOTAL_UNCLAIMED_ICP_REWARD};
pub fn is_admin() -> Result<(), String> {
    if ic_cdk::api::caller().to_string()
        == "xswc6-jimwj-wnqog-3gmkv-hglw4-aedfy-bqmr2-5uyut-cnbbg-4wvsk-bqe"
    {
        Ok(())
    } else {
        Err("You are unauthorized to call this method.".to_string())
    }
}
pub fn is_canister() -> Result<(), String> {
    if ic_cdk::api::caller().to_string() == "5qx27-tyaaa-aaaal-qjafa-cai" {
        Ok(())
    } else {
        Err("You are unauthorized to call this method.".to_string())
    }
}
pub fn reentrancy<F, R>(f: F) -> R where F: FnOnce() -> R,
{
    REENTRANCY_GUARD.with(|guard| {
        if guard.get() {
            panic!("Reentrancy not allowed!");
        }
        guard.set(true);
    });
    let result = f();
    REENTRANCY_GUARD.with(|guard| {
        guard.set(false);
    });
    result
}
