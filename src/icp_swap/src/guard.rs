use crate::{TOTAL_ICP_AVAILABLE, TOTAL_UNCALIMED_ICP_REWARD};

pub fn is_admin() -> Result<(), String> {
    if ic_cdk::api::caller().to_string()
        == "xswc6-jimwj-wnqog-3gmkv-hglw4-aedfy-bqmr2-5uyut-cnbbg-4wvsk-bqe"
    {
        Ok(())
    } else {
        Err("You are unauthorized to call this method.".to_string())
    }
}
pub fn is_canister() -> Result<(), String> {
    if ic_cdk::api::caller().to_string() == "br5f7-7uaaa-aaaaa-qaaca-cai" {
        Ok(())
    } else {
        Err("You are unauthorized to call this method.".to_string())
    }
}
pub fn is_burning_allowed() -> Result<(), String> {
    let total_icp_available= TOTAL_ICP_AVAILABLE.with(|icp| {
        let icp: std::sync::MutexGuard<u64> = icp.lock().unwrap();
        *icp
    });
    let total_unclaimed_icp: u64=TOTAL_UNCALIMED_ICP_REWARD.with(|icp| {
        let icp: std::sync::MutexGuard<u64> = icp.lock().unwrap();
        *icp
    });
    Ok(())
}
