use crate::{
    storage::*,
    utils::{ principal_to_subaccount, SCALING_FACTOR,STAKING_REWARD_PERCENTAGE,},
};
use candid::Principal;
use ic_cdk::{api::caller,query,};
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
}

#[query]
pub fn get_current_staking_reward_percentage() -> String {
    format!("Staking percentage {}", STAKING_REWARD_PERCENTAGE / 100)
}

// #[query]
// pub async fn get_maximum_LBRY_burn_allowed() -> Result<u64, String> {
//     let lbry_per_icp: u64 = get_current_LBRY_ratio()?
//         .checked_mul(2)
//         .ok_or("Arithmetic overflow in lbry_per_icp.")?;

//     let total_icp_available: u64 = fetch_canister_icp_balance().await?;
//     if total_icp_available == 0 || lbry_per_icp == 0 {
//         return Ok(0);
//     }

//     let total_archived_bal: u64 = get_total_archived_balance();

//     let total_unclaimed_icp: u64 = get_total_unclaimed_icp_reward();

//     let mut remaining_icp: u64 = total_icp_available
//         .checked_sub(total_unclaimed_icp)
//         .ok_or("Arithmetic underflow in remaining_icp.")?;
//     remaining_icp = remaining_icp
//         .checked_sub(total_archived_bal)
//         .ok_or("Arithmetic overflow occured in remaining_icp.")?;

//     // keeping 50% for staker pools
//     let mut actual_available_icp: u64 = remaining_icp.checked_div(2).ok_or(
//         "Division failed in actual_available_icp. Please verify the amount is valid and non-zero",
//     )?;
//     let lbry_tokens = actual_available_icp
//         .checked_mul(lbry_per_icp)
//         .ok_or("Arithmetic overflow occurred in LBRY conversion")?;

//     return Ok(lbry_tokens);
// }

#[query]
pub fn get_current_LBRY_ratio() -> Result<u64, String> {
    let lbry_ratio_map = get_lbry_ratio_mem();

    match lbry_ratio_map.get(&()) {
        Some(lbry_ratio) => Ok(lbry_ratio.ratio), // Return the ratio if it exists
        None => Err("No LBRY ratio found".to_string()),
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
