use candid::{CandidType, Principal};
use ic_cdk::{self, caller};
use ic_ledger_types::Subaccount;
use serde::Deserialize;

use crate::{get_distribution_interval, get_distribution_interval_mem, get_lbry_ratio_mem, get_stake, get_total_archived_balance, get_total_archived_balance_mem, get_total_unclaimed_icp_reward, get_total_unclaimed_icp_reward_mem, ArchiveBalance, LbryRatio, ARCHIVED_TRANSACTION_LOG};
pub const STAKING_REWARD_PERCENTAGE: u64 = 1000; //multiply by 100 eg. 10% = 1000
pub const ALEX_CANISTER_ID: &str = "7hcrm-4iaaa-aaaak-akuka-cai";
pub const LBRY_CANISTER_ID: &str = "hdtfn-naaaa-aaaam-aciva-cai";
pub const TOKENOMICS_CANISTER_ID: &str = "chddw-rqaaa-aaaao-qevqq-cai";
pub const XRC_CANISTER_ID: &str = "uf6dk-hyaaa-aaaaq-qaaaq-cai";
pub const ICP_TRANSFER_FEE: u64 = 10_000;
pub const ALEX_TRANSFER_FEE: u64 = 10_000;
pub const MAX_DAYS: u32 = 30;
pub const SCALING_FACTOR: u128 = 1_000_000_000_000; // Adjust based on your precision needs
pub const BURN_CYCLE_FEE: u64 = 10_000_000_000;

pub fn verify_caller_balance(amount: u64) -> bool {
    let caller_stake = get_stake(caller());
    match caller_stake {
        Some(stake) => amount <= (stake.amount) as u64,
        None => false,
    }
}
pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
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

pub async fn within_max_limit(burn_amount: u64) -> u64 {
    let result: Result<(u64, u64), String> = ic_cdk::call::<(), (u64, u64)>(
        Principal::from_text(TOKENOMICS_CANISTER_ID).expect("Could not decode the principal."),
        "get_max_stats",
        (),
    )
    .await
    .map_err(|e: (ic_cdk::api::call::RejectionCode, String)| {
        format!("failed to call ledger: {:?}", e)
    });

    match result {
        Ok((max_threshold, total_burned)) => {
            if (burn_amount + total_burned) <= max_threshold {
                return burn_amount;
            } else {
                return max_threshold-total_burned;
            }
        }
        Err(e) => {
            // ic_cdk::println!("Error: {}", e);
            return 0;
        }
    }
}
pub async fn tokenomics_burn_LBRY_stats() -> Result<(u64, u64), String> {
    let result: Result<(u64, u64), String> = ic_cdk::call::<(), (u64, u64)>(
        Principal::from_text(TOKENOMICS_CANISTER_ID).expect("Could not decode the principal."),
        "get_max_stats",
        (),
    )
    .await
    .map_err(|e: (ic_cdk::api::call::RejectionCode, String)| {
        format!("failed to call ledger: {:?}", e)
    });

    match result {
        Ok((max_threshold, total_burned)) => {
            return Ok((max_threshold, total_burned));
        }
        Err(e) => {
            return Err("Some {}".into());
        }
    }
}

// pub static TOTAL_ARCHIVED_BALANCE: RefCell<u64> = RefCell::new(0);
pub(crate) fn add_to_distribution_intervals(amount: u32) -> Result<(), String> {
    let current_total = get_distribution_interval();
    let new_total = current_total
        .checked_add(amount)
        .ok_or("Arithmetic overflow occurred in  fn add_to_distribution_intervals() ")?;
    let mut result = get_distribution_interval_mem();
    result.insert((), new_total);
    Ok(())
}
pub(crate) fn add_to_total_archived_balance(amount: u64) -> Result<(), String> {
    let current_total = get_total_archived_balance();
    let new_total = current_total
        .checked_add(amount)
        .ok_or("Arithmetic overflow occurred in  fn add_to_total_archived_balance() ")?;
    let mut result = get_total_archived_balance_mem();
    result.insert((), new_total);
    Ok(())
}
pub(crate) fn sub_to_total_archived_balance(amount: u64) -> Result<(), String> {
    let current_total = get_total_archived_balance();
    let new_total = current_total
        .checked_sub(amount)
        .ok_or("Arithmetic underflow occurred in  fn sub_to_total_archived_balance() ")?;
    let mut result = get_total_archived_balance_mem();
    result.insert((), new_total);
    Ok(())
}
pub(crate) fn add_to_unclaimed_amount(amount: u64) -> Result<(), String> {
    let current_total = get_total_unclaimed_icp_reward();
    let new_total = current_total
        .checked_add(amount)
        .ok_or("Arithmetic overflow occurred in  fn add_to_unclaimed_amount() ")?;
    let mut result = get_total_unclaimed_icp_reward_mem();
    result.insert((), new_total);
    Ok(())
}
pub(crate) fn sub_to_unclaimed_amount(amount: u64) -> Result<(), String> {
    let current_total = get_total_unclaimed_icp_reward();
    let new_total = current_total
        .checked_sub(amount)
        .ok_or("Arithmetic overflow occurred in  fn sub_to_unclaimed_amount() ")?;
    let mut result = get_total_unclaimed_icp_reward_mem();
    result.insert((), new_total);
    Ok(())
}

pub(crate) fn update_current_LBRY_ratio(new_ratio: u64, current_time: u64) -> Result<(), String> {
    // Get the StableBTreeMap for LBRY ratio
    let mut lbry_ratio_map = get_lbry_ratio_mem();

    // Create a new LbryRatio instance with the provided values
    let lbry_ratio = LbryRatio {
        ratio: new_ratio,
        time: current_time,
    };

    // Insert or update the LbryRatio value at the key `()`
    lbry_ratio_map.insert((), lbry_ratio);
    Ok(())
}
pub(crate)  
fn archive_user_transaction(amount: u64) -> Result<String, String> {
    let caller = ic_cdk::caller();

    ARCHIVED_TRANSACTION_LOG.with(|trxs| -> Result<(), String> {
        let mut trxs = trxs.borrow_mut();

        let mut user_archive = trxs.get(&caller).unwrap_or(ArchiveBalance { icp: 0 });
        user_archive.icp = user_archive
            .icp
            .checked_add(amount)
            .ok_or("Arithmetic overflow occurred in user_trx")?;

        trxs.insert(caller, user_archive);

        Ok(())
    })?;
    add_to_total_archived_balance(amount)?;

    Ok("Transaction added successfully!".to_string())
}

#[derive(CandidType, Deserialize, Debug)]
pub enum ExchangeRateError {
    AnonymousPrincipalNotAllowed,
    CryptoQuoteAssetNotFound,
    FailedToAcceptCycles,
    ForexBaseAssetNotFound,
    CryptoBaseAssetNotFound,
    StablecoinRateTooFewRates,
    ForexAssetsNotFound,
    InconsistentRatesReceived,
    RateLimited,
    StablecoinRateZeroRate,
    Other { code: u32, description: String },
    ForexInvalidTimestamp,
    NotEnoughCycles,
    ForexQuoteAssetNotFound,
    StablecoinRateNotFound,
    Pending,
}