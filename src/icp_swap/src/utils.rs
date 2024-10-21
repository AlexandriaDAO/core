

use candid::{CandidType, Principal};
use ic_cdk::{self, caller};
use ic_ledger_types::Subaccount;
use serde::Deserialize;

use crate::get_stake;
pub const STAKING_REWARD_PERCENTAGE: u64 = 1000; //multiply by 100 eg. 10% = 1000
pub const ALEX_CANISTER_ID: &str = "7hcrm-4iaaa-aaaak-akuka-cai";
pub const LBRY_CANISTER_ID: &str = "hdtfn-naaaa-aaaam-aciva-cai";
pub const TOKENOMICS_CANISTER_ID: &str = "uxyan-oyaaa-aaaap-qhezq-cai";
pub const XRC_CANISTER_ID: &str = "uf6dk-hyaaa-aaaaq-qaaaq-cai";
pub const ICP_TRANSFER_FEE: u64 = 10_000;
pub const ALEX_TRANSFER_FEE: u64 = 10_000;
pub const MAX_DAYS: u32 = 30;
pub const SCALING_FACTOR: u128 = 1_000_000_00_00; // Adjust based on your precision needs


pub const BURN_CYCLE_FEE: u64 = 10_000_000_000;
pub const EXPIRY_INTERVAL: u64 = 8; //604800;

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

pub async fn within_max_limit(burn_amount: u64) -> bool {
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
                return true;
            } else {
                return false;
            }
        }
        Err(e) => {
            // ic_cdk::println!("Error: {}", e);
            return false;
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