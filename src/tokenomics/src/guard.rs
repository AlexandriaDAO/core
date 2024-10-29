use crate::{get_principal, ICP_SWAP_CANISTER_ID};

pub fn is_allowed() -> Result<(), String> {
    if ic_cdk::api::caller() == get_principal(ICP_SWAP_CANISTER_ID) {
        Ok(())
    } else {
        Err("You are unauthorized to call this method.".to_string())
    }
}
