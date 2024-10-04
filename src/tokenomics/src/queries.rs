
use crate::{CURRENT_THRESHOLD, LBRY_THRESHOLDS, TOTAL_LBRY_BURNED, TOTAL_ALEX_MINTED, ALEX_PER_THRESHOLD};
use ic_cdk::{caller, query};

#[query]
pub fn get_total_LBRY_burn() -> u64 {
    TOTAL_LBRY_BURNED.with(|total_burned|total_burned.borrow().clone())
}

#[query]
pub fn get_total_ALEX_minted() -> u64 {
    TOTAL_ALEX_MINTED.with(|mint| 
        mint.borrow().clone()
      
    )
}

#[query]
pub fn get_current_ALEX_rate() -> u64 {
    let current_threshold = CURRENT_THRESHOLD.with(|current_threshold|  current_threshold.borrow().clone());
    ALEX_PER_THRESHOLD[current_threshold as usize]
}
#[query]
pub fn get_current_LBRY_threshold() -> u64 {
    let current_threshold = CURRENT_THRESHOLD.with(|current_threshold| current_threshold.borrow().clone());
    LBRY_THRESHOLDS[current_threshold as usize]
}

#[query]
pub fn get_max_stats() -> (u64,u64) {
    let max_threshold=  LBRY_THRESHOLDS[LBRY_THRESHOLDS.len() -1];
    let total_burned = get_total_LBRY_burn();
    (max_threshold, total_burned)
}

#[query]
pub fn your_principal() -> Result<String,String> {
    Ok(caller().to_string())
}