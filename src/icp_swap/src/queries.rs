use crate::{
    storage::*,
    utils::{principal_to_subaccount, DEFAULT_LBRY_RATIO, SCALING_FACTOR, STAKING_REWARD_PERCENTAGE},
};
use candid::Principal;
use ic_cdk::{api::caller, query};
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
        let stakes_map = stakes.borrow();

        // return a Vec of tuples
        stakes_map
            .iter()
            .map(|(principal, stake)| (principal.clone(), stake.clone())) // Clone to ensure ownership
            .collect()
    })
}

#[query]
pub fn get_stakers_count() -> u64 {
    STAKES.with(|stakes| {
        let stakes_map = stakes.borrow();
        stakes_map.len() as u64 // Return the number of stakers as u64
    })
}
#[query]
pub fn get_stake(principal: Principal) -> Option<Stake> {
    STAKES.with(|stakes| {
        let stakes_map = stakes.borrow();
        stakes_map.get(&principal)
    })
}

#[query]
pub fn get_total_unclaimed_icp_reward() -> u64 {
    let result = get_total_unclaimed_icp_reward_mem();
    result.get(&()).unwrap_or(0)
    // // Alternative approach just using the canister balance, but this would only be fair if people claimed every day.
    // pub async fn get_total_unclaimed_icp_reward() -> Result<u64, String> {
    //     // Get total ICP in canister
    //     let total_icp_available = fetch_canister_icp_balance().await?;

    //     // Get total archived balance (ICP that's waiting to be redeemed)
    //     let total_archived_bal = get_total_archived_balance();

    //     // The unclaimed rewards are what remains after subtracting archived balances
    //     let unclaimed_rewards = total_icp_available
    //         .checked_sub(total_archived_bal)
    //         .ok_or("Arithmetic underflow when calculating unclaimed rewards")?;

    //     Ok(unclaimed_rewards)
}

#[query]
pub fn get_current_staking_reward_percentage() -> String {
    format!("Staking percentage {}", STAKING_REWARD_PERCENTAGE / 100)
}

#[query]
pub fn get_current_LBRY_ratio() -> u64 {
    let lbry_ratio_map = get_lbry_ratio_mem();

    match lbry_ratio_map.get(&()) {
        Some(lbry_ratio) => return lbry_ratio.ratio, // Return the ratio if it exists
        None => return DEFAULT_LBRY_RATIO,                          //defult case
    }
}

#[query]
pub fn get_user_archive_balance(principal: Principal) -> Option<ArchiveBalance> {
    ARCHIVED_TRANSACTION_LOG.with(|trx| {
        let trxs = trx.borrow();
        trxs.get(&principal)
    })
}

#[query]
pub fn get_all_archive_balances() -> Vec<(Principal, ArchiveBalance)> {
    ARCHIVED_TRANSACTION_LOG.with(|trxs| {
        let trxs = trxs.borrow();

        trxs.iter()
            .map(|(principal, balance)| (principal.clone(), balance.clone()))
            .collect()
    })
}
#[query]
pub fn get_total_archived_balance() -> u64 {
    let result = get_total_archived_balance_mem();
    result.get(&()).unwrap_or(0)
}
#[query]
pub fn get_distribution_interval() -> u32 {
    let result = get_distribution_interval_mem();
    result.get(&()).unwrap_or(0)
}

#[query]
pub fn get_all_apy_values() -> Vec<(u32, u128)> {
    APY.with(|apy| {
        let mut values: Vec<(u32, u128)> = apy
            .borrow()
            .iter()
            .map(|(day, daily_values)| {
                // Extract the day and its corresponding reward value
                let icp_reward_per_alex =
                    daily_values.values.get(&day).cloned().unwrap_or_default();
                (day, icp_reward_per_alex)
            })
            .collect();

        // Sort the values by day (ascending order)
        values.sort_by_key(|&(day, _)| day);

        values
    })
}
#[query]
pub fn get_scaling_factor() -> u128 {
    return SCALING_FACTOR;
}
