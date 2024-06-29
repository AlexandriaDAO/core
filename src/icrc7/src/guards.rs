use crate::state::STATE;
use candid::Principal;
use ic_cdk::caller;

#[inline(always)]
pub fn owner_guard() -> Result<(), String> {
    let owner = STATE
        .with(|s| s.borrow().icrc7_minting_authority())
        .ok_or_else(|| String::from("The canister not set owner"))?;

    if caller() == owner.owner {
        Ok(())
    } else {
        Err(String::from("The caller is not the owner of contract"))
    }
}

#[inline(always)]
pub fn authenticated_guard() -> Result<(), String> {
    if ic_cdk::caller() == Principal::anonymous() {
        Err("anonymous user is not allowed".to_string())
    } else {
        Ok(())
    }
}
