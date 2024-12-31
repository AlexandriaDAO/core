use ic_cdk::update;
use crate::guard::*;
use crate::{
    utils::{
        get_alex_supply, get_apy_value, get_current_alex_rate, get_lbry_supply, get_nft_supply,
        get_stakers_count, get_total_alex_staked, get_total_lbry_burn,
    },
    Log, LOGS,
};

#[update(guard = "is_canister")]
pub async fn register_log() -> Result<String, String> {
    let alex_supply = get_alex_supply().await?;
    let lbry_supply = get_lbry_supply().await?;
    let nft_supply = get_nft_supply().await?;
    let total_lbry_burn = get_total_lbry_burn().await?;
    let alex_rate = get_current_alex_rate().await?;
    let staker_count = get_stakers_count().await?;
    let total_alex_staked = get_total_alex_staked().await?;
    let apy = get_apy_value().await?;
    let time = ic_cdk::api::time();

    LOGS.with(|logs| -> Result<(), String> {
        let mut log_map = logs.borrow_mut();
        let new_log = match log_map.get(&time) {
            Some(_existing_nft_sale) => {
                return Err("Log already exists ".to_string());
            }
            None => Log {
                alex_supply,
                lbry_supply,
                nft_supply,
                total_lbry_burn,
                alex_rate,
                staker_count,
                total_alex_staked,
                apy,
                time,
            },
        };

        log_map.insert(time.clone(), new_log);
        Ok(())
    })?;
    Ok("Logged!".to_string())
}
