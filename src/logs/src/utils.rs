use candid::{CandidType, Nat, Principal};
use ic_cdk::call;

pub const LBRY_CANISTER_ID: &str = "y33wz-myaaa-aaaap-qkmna-cai";
pub const ALEX_CANISTER_ID: &str = "ysy5f-2qaaa-aaaap-qkmmq-cai";



pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

pub async fn get_alex_supply() -> Result<Nat, String> {
    let alex_canister = get_principal(ALEX_CANISTER_ID);

    match call::<(), (Nat,)>(alex_canister, "icrc1_total_supply", ()).await {
        Ok((supply,)) => Ok(supply),
        Err((code, msg)) => Err(format!(
            "ALEX canister call failed with code {:?}: {}",
            code, msg
        )),
    }
}
pub async fn get_lbry_supply() -> Result<Nat, String> {
    let lbry_canister = get_principal(LBRY_CANISTER_ID);

    match call::<(), (Nat,)>(lbry_canister, "icrc1_total_supply", ()).await {
        Ok((supply,)) => Ok(supply),
        Err((code, msg)) => Err(format!(
            "ALEX canister call failed with code {:?}: {}",
            code, msg
        )),
    }
}


