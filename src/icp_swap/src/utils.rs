use std::{cell::RefCell, sync::{Arc, Mutex}};

use candid::Principal;
use ic_cdk::{self, caller};
use ic_ledger_types::Subaccount;

use crate::{get_stake, update, TOTAL_ICP_AVAILABLE};
pub const LBRY_RATIO: u64 = 1000;
pub const STAKING_REWARD_PERCENTAGE: u64 = 1000;   //multiply by 100 eg. 10% = 1000
const DECIMALS: usize = 8;
pub const ALEX_CANISTER_ID: &str = "7hcrm-4iaaa-aaaak-akuka-cai";
pub const LBRY_CANISTER_ID: &str = "hdtfn-naaaa-aaaam-aciva-cai";
pub const TOKENOMICS_CANISTER_ID: &str = "uxyan-oyaaa-aaaap-qhezq-cai";
pub const ICP_TRANSFER_FEE: u64 = 10_000;
pub fn verify_caller_balance(amount: u64) -> bool {
    let caller_stake = get_stake(caller());
    match caller_stake {
        Some(stake) => amount <= (stake.amount) as u64,
        None => false,
    }
}

pub fn get_caller_stake_balance() -> u64 {
    let caller_stake = get_stake(caller());
    match caller_stake {
        Some(stake) => return stake.amount,
        None => return 0,
    }
}

pub fn principal_to_subaccount(principal_id: &Principal) -> Subaccount {
    let mut subaccount = [0; std::mem::size_of::<Subaccount>()];
    let principal_id = principal_id.as_slice();
    subaccount[0] = principal_id.len().try_into().unwrap();
    subaccount[1..1 + principal_id.len()].copy_from_slice(principal_id);

    Subaccount(subaccount)
}
