use std::time::Duration;
use ic_cdk::{init, update};
use crate::guard::*;
use crate::register_log;
pub const LOG_INTERVAL: Duration = Duration::from_secs(60*60); // 1 hour.

#[init]
 fn init() {
    let _log_timer_id: ic_cdk_timers::TimerId = ic_cdk_timers::set_timer_interval(LOG_INTERVAL, || ic_cdk::spawn(register_log_wrapper()));
}

#[update(guard = "is_canister")]
async fn register_log_wrapper() {
    match register_log().await {
        Ok(_) => ic_cdk::println!("Logged wrapper"),
        Err(e) => ic_cdk::println!("Error registering log: {}", e),
    }
}