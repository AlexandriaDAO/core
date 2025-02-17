use candid::Principal;

use crate::STATE;

pub struct CallerGuard {
    principal: Principal,
}

impl CallerGuard {
    pub fn new(principal: Principal) -> Result<Self, String> {
        STATE.with(|state| {
            let pending_requests = &mut state.borrow_mut().pending_requests;
            if pending_requests.contains(&principal) {
                return Err(format!(
                    "Already processing a request for principal {:?}",
                    principal.to_string()
                ));
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

pub fn not_anon() -> Result<(), String> {
    let caller = ic_cdk::api::caller();
    if caller != Principal::anonymous() {
        Ok(())
    } else {
        Err("Anonymous principal not allowed to make calls.".to_string())
    }
}
