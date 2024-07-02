use candid::Principal;
use ic_cdk::{self, caller};
use ic_ledger_types::Subaccount;

use crate::get_stake;
pub fn verify_caller_balance(amount: u64) -> bool {
    ic_cdk::println!("the caller is {}", caller().to_string());
    let caller_stake = get_stake(caller());
    match caller_stake {
        Some(stake) => amount <= (stake.amount) as u64,
        None => false,
    }
}

pub fn principal_to_subaccount(principal_id: &Principal) -> Subaccount {
    let mut subaccount = [0; std::mem::size_of::<Subaccount>()];
    let principal_id = principal_id.as_slice();
    subaccount[0] = principal_id.len().try_into().unwrap();
    subaccount[1..1 + principal_id.len()].copy_from_slice(principal_id);

    Subaccount(subaccount)
}
