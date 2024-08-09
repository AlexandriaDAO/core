use crate::{ALLOWED_CALLERS, CURRENT_THRESHOLD, LBRY_THRESHOLDS, TOTAL_LBRY_BURNED, TOTAL_ALEX_MINTED, ALEX_PER_THRESHOLD};
use candid::Principal;
use ic_cdk::{caller, query};

#[query]
pub fn get_total_LBRY_burn() -> u64 {
    TOTAL_LBRY_BURNED.with(|total_burned| {
        let total_burned: std::sync::MutexGuard<u64> = total_burned.lock().unwrap();
        *total_burned
    })
}

#[query]
pub fn get_total_ALEX_minted() -> u64 {
    TOTAL_ALEX_MINTED.with(|mint| {
        let mint: std::sync::MutexGuard<u64> = mint.lock().unwrap();
        *mint
    })
}

#[query]
pub fn get_current_ALEX_rate() -> u64 {
    let current_threshold = CURRENT_THRESHOLD.with(|current_threshold| {
        let current_threshold = current_threshold.lock().unwrap();
        *current_threshold
    });
    ALEX_PER_THRESHOLD[current_threshold as usize]
}
#[query]
pub fn get_current_LBRY_threshold() -> u64 {
    let current_threshold = CURRENT_THRESHOLD.with(|current_threshold| {
        let current_threshold = current_threshold.lock().unwrap();
        *current_threshold
    });
    LBRY_THRESHOLDS[current_threshold as usize]
}
#[query]
pub fn get_allowed_callers() -> Vec<Principal> {
    ALLOWED_CALLERS.with(|callers| callers.borrow().iter().cloned().collect())
}
#[query]
pub fn your_principal() -> Result<String,String> {
    Ok(caller().to_string())
}