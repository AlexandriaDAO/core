use ic_cdk::update;

use crate::{
    utils::{get_alex_supply, get_lbry_supply, get_nft_supply},
    Log, LOGS,
};

#[update]
pub async fn register_log() -> Result<String, String> {
    let alex_supply = get_alex_supply().await?;
    let lbry_supply = get_lbry_supply().await?;
    let nft_supply = get_nft_supply().await?;
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
                time,
            },
        };

        log_map.insert(time.clone(), new_log);
        Ok(())
    })?;
    Ok("Logged!".to_string())
}
