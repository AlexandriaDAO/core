use crate::state::STATE;
use ic_cdk::caller;

#[inline(always)]
pub fn owner_guard() -> Result<(), String> {
    let owner = STATE.with(|s| s.borrow().ledger_id);

    if caller() == owner {
        Ok(())
    } else {
        Err(String::from("The caller is not the owner of contract"))
    }
}
