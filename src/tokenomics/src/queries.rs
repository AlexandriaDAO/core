use crate::{ALLOWED_CALLERS, CURRENT_THRESHOLD, LBRY_THRESHOLDS, TOTAL_LBRY_BURNED, TOTAL_UCG_MINTED, UCG_PER_THRESHOLD};
use candid::Principal;
use ic_cdk::{caller, query};

#[query]
pub fn get_totat_LBRY_burn() -> f64 {
    TOTAL_LBRY_BURNED.with(|total_burned| {
        let total_burned: std::sync::MutexGuard<f64> = total_burned.lock().unwrap();
        *total_burned
    })
}

#[query]
pub fn get_totat_UCG_minted() -> f64 {
    TOTAL_UCG_MINTED.with(|mint| {
        let mint: std::sync::MutexGuard<f64> = mint.lock().unwrap();
        *mint
    })
}

#[query]
pub fn get_current_UCG_rate() -> f64 {
    let current_threshold = CURRENT_THRESHOLD.with(|current_threshold| {
        let current_threshold = current_threshold.lock().unwrap();
        *current_threshold
    });
    UCG_PER_THRESHOLD[current_threshold as usize]
}
#[query]
pub fn get_current_LBRY_threshold() -> f64 {
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