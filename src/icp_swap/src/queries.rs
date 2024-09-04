use crate::{
    storage::*,
    utils::{principal_to_subaccount, STAKING_REWARD_PERCENTAGE},
};
use candid::Principal;
use ic_cdk::{caller, query};
use ic_ledger_types::AccountIdentifier;
//swap
#[query]
pub async fn caller_subaccount() -> String {
    let canister_id: Principal = ic_cdk::api::id();
    let account: AccountIdentifier =
        AccountIdentifier::new(&canister_id, &principal_to_subaccount(&caller()));
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
            .map(|(k, v)| {
                (
                    *k,
                    Stake {
                        amount: v.amount,
                        time: v.time,
                        reward_icp: v.reward_icp,
                    },
                )
            })
            .collect()
    })
}

#[query]
pub fn get_stake(principal: Principal) -> Option<Stake> {
    STAKES.with(|stakes| stakes.borrow().stakes.get(&principal).cloned())
}
#[query]
pub fn get_total_staked() -> u64 {
    TOTAL_ALEX_STAKED.with(|staked| {
        let staked: std::sync::MutexGuard<u64> = staked.lock().unwrap();
        *staked
    })
}

#[query]
pub fn get_total_unclaimed_icp_reward() -> u64 {
    TOTAL_UNCLAIMED_ICP_REWARD.with(|icp| {
        let icp: std::sync::MutexGuard<u64> = icp.lock().unwrap();
        *icp
    })
}
#[query]
pub fn get_total_icp_avialable() -> u64 {
    TOTAL_ICP_AVAILABLE.with(|icp| {
        let icp: std::sync::MutexGuard<u64> = icp.lock().unwrap();
        *icp
    })
}
#[query]
pub fn get_current_staking_reward_percentage() -> String {
    format!("Staking percentage {}", STAKING_REWARD_PERCENTAGE/100)
}

#[query]
pub fn get_maximum_LBRY_burn_allowed() -> Result<u64, String> {
    let lbry_per_icp: u64 = get_current_LBRY_ratio()
        .checked_mul(2)
        .ok_or("Arithmetic overflow in lbry_per_icp calculation")?;
    let total_icp_available: u64 = TOTAL_ICP_AVAILABLE.with(|icp| {
        let icp: std::sync::MutexGuard<u64> = icp.lock().unwrap();
        *icp
    });
    ic_cdk::println!("icp avialabe {}", total_icp_available);
    ic_cdk::println!("Lbry {}", lbry_per_icp);

    if total_icp_available == 0 || lbry_per_icp == 0 {
        return Ok(0);
    }
    let total_unclaimed_icp: u64 = TOTAL_UNCLAIMED_ICP_REWARD.with(|icp| {
        let icp: std::sync::MutexGuard<u64> = icp.lock().unwrap();
        *icp
    });
    ic_cdk::println!("Unclaimed Icp {}", total_unclaimed_icp);

    // keeping 50% for staker pools
    let mut actual_available_icp: u64 = total_icp_available
        .checked_sub(total_unclaimed_icp)
        .ok_or("Arithmetic underflow in actual_available_icp calculation")?;
    actual_available_icp = actual_available_icp / 2;
    let lbry_tokens = actual_available_icp
        .checked_mul(lbry_per_icp)
        .ok_or("Arithmetic overflow occurred in LBRY conversion")?;

    return Ok(lbry_tokens);
}

#[query]
pub fn get_current_LBRY_ratio() -> u64 {
    let ratio: LbryRatio = LBRY_RATIO.with(|ratio| ratio.borrow().clone());
    return ratio.ratio;
}
