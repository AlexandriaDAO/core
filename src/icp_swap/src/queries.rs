use crate::{storage::*, utils::principal_to_subaccount};
use candid::Principal;
use ic_cdk::{caller, query};
use ic_ledger_types::AccountIdentifier;
//swap
#[query]
pub async fn caller_subaccount() -> String {
    let canister_id: Principal = ic_cdk::api::id();
    let account: AccountIdentifier =
        AccountIdentifier::new(&canister_id, &principal_to_subaccount(&caller()));

    ic_cdk::println!("Caller ICP sub-account is {}", account);
    ic_cdk::println!("Caller  is {}", caller().to_string());

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
    TOTAL_UCG_STAKED.with(|staked| {
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
    format!("{}", ratio)
}
#[query]
pub fn get_total_unclaimed_icp_reward() -> u64 {
    TOTAL_UNCALIMED_ICP_REWARD.with(|icp| {
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
    let per = STAKING_REWARD_PERCENTAGE.with(|per: &std::sync::Arc<std::sync::Mutex<f64>>| {
        let per: std::sync::MutexGuard<f64> = per.lock().unwrap();
        *per
    });
    format!("Staking percentage {}% ICP", per)
}

#[query]
pub fn get_maximum_LBRY_burn_allowed() -> u64 {
    let lbry_per_icp: u64 = LBRY_PER_ICP.with(|ratio: &std::sync::Arc<std::sync::Mutex<u64>>| {
        let ratio: std::sync::MutexGuard<u64> = ratio.lock().unwrap();
        *ratio
    });
    // let amount_icp: u64 = (((amount_lbry as f64 / lbry_per_icp as f64) / 2.0) * 1000_000_00.0) as u64;
    let total_icp_available = TOTAL_ICP_AVAILABLE.with(|icp| {
        let icp: std::sync::MutexGuard<u64> = icp.lock().unwrap();
        *icp
    });
    ic_cdk::println!("icp avialabe {}", total_icp_available);
    ic_cdk::println!("Lbry {}", lbry_per_icp);

    if total_icp_available == 0 || lbry_per_icp == 0 {
        return 0;
    }
    let total_unclaimed_icp: u64 = TOTAL_UNCALIMED_ICP_REWARD.with(|icp| {
        let icp: std::sync::MutexGuard<u64> = icp.lock().unwrap();
        *icp
    });
    ic_cdk::println!("Unclaimed Icp {}", total_unclaimed_icp);

    // keeping 50% for staker pools
    let actual_available_icp: u64 = (total_icp_available - total_unclaimed_icp) / 2;
    let actual_available_icp_full: f64 = (actual_available_icp as f64) / 1e8;
    let lbry_tokens = actual_available_icp_full * (lbry_per_icp as f64);
    return lbry_tokens as u64;
    // let actual_available_icp: u64 = (total_icp_available - total_unclaimed_icp) / 2;
    // return actual_available_icp / lbry_per_icp;
}
