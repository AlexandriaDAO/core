use candid::Principal;
use ic_cdk::{caller, query};
use ic_ledger_types::AccountIdentifier;
use crate::{storage::*, utils::principal_to_subaccount};
//swap
#[query]
pub async fn caller_subaccount() -> String {
    let canister_id: Principal = ic_cdk::api::id();
    let account: AccountIdentifier =
        AccountIdentifier::new(&canister_id, &principal_to_subaccount(&caller()));

    ic_cdk::println!("Caller ICP sub-account is {}", account);
    return account.to_string();
}
//stake
#[query]
pub fn get_all_stakes() -> Vec<(Principal, Stake)> {
    STAKES.with(|stakes| {
        stakes
            .borrow()
            .stakes
            .iter()
            .map(|(k, v)| (*k, Stake { amount: v.amount, time: v.time,reward_icp:v.reward_icp }))
            .collect()
    })
}

#[query]
pub fn get_stake(principal: Principal) -> Option<Stake> {
    STAKES.with(|stakes| {
        stakes.borrow().stakes.get(&principal).cloned()
    })
}
#[query]
pub fn get_totat_staked() -> u64 {
    TOTAL_ALEX_STAKED.with(|staked| {
        let staked: std::sync::MutexGuard<u64> = staked.lock().unwrap();
        *staked
    })
}
#[query]
pub fn get_current_LBRY_ratio() -> String {
    let ratio = LBRY_PER_ICP.with(|ratio_arc: &std::sync::Arc<std::sync::Mutex<u64>>| {
        let ratio = ratio_arc.lock().unwrap();
        *ratio
    });
    format!("1 ICP : {} x 10^8 LBRY", ratio)
}
#[query]
pub fn get_current_staking_reward_percentage() -> String {
    let per = STAKING_REWARD_PERCENTAGE.with(|per: &std::sync::Arc<std::sync::Mutex<f64>>| {
        let per: std::sync::MutexGuard<f64> = per.lock().unwrap();
        *per
    });
    format!("Staking percentage {}% ICP", per)
}
