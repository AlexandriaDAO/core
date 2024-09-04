use candid::Principal;

use crate::{storage::REENTRANCY_GUARD, STATE};
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
            ic_cdk::println!("Reentrancy not allowed");
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

pub struct CallerGuard {
    principal: Principal,
}

impl CallerGuard {
    pub fn new(principal: Principal) -> Result<Self, String> {
        STATE.with(|state| {
            let pending_requests = &mut state.borrow_mut().pending_requests;
            if pending_requests.contains(&principal){
                return Err(format!("Already processing a request for principal {:?}", principal.to_string()));
            }
            pending_requests.insert(principal);
            Ok(Self { principal })
        })
    }
}

impl Drop for CallerGuard {
    fn drop(&mut self) {
        STATE.with(|state| {
            state.borrow_mut().pending_requests.remove(&self.principal);
        })
    }
}