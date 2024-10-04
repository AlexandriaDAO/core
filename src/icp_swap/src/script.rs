use std::time::Duration;
use ic_cdk::{self, init, update};

use crate::{distribute_reward,get_icp_rate_in_cents};
use crate::guard::*;

const REWARD_DISTRIBUTION_INTERVAL: Duration = Duration::from_secs(24*60*60); // 1 days in seconds
const PRICE_FETCH_INTERVAL: Duration = Duration::from_secs(1*24*60*60); // 1 days in seconds

#[init]
 fn init() {
    ic_cdk_timers::set_timer(Duration::from_secs(0), || {
        ic_cdk::spawn(get_icp_rate_cents_wrapper());
    });
    let _reward_timer_id: ic_cdk_timers::TimerId = ic_cdk_timers::set_timer_interval(REWARD_DISTRIBUTION_INTERVAL, distribute_reward_wrapper);
    let _price_timer_id: ic_cdk_timers::TimerId = ic_cdk_timers::set_timer_interval(PRICE_FETCH_INTERVAL, || ic_cdk::spawn(get_icp_rate_cents_wrapper()));
}
#[update(guard = "is_canister")]
fn distribute_reward_wrapper() {
    match distribute_reward() {
        Ok(_) => ic_cdk::println!("Rewards distributed successfully"),
        Err(e) => ic_cdk::println!("Error distributing rewards: {}", e),
    }
}
#[update(guard = "is_canister")]
async fn get_icp_rate_cents_wrapper() {
    match get_icp_rate_in_cents().await {
        Ok(price) => {
            ic_cdk::println!("ICP price fetched successfully: {} cents", price);
        },
        Err(e) => {
            ic_cdk::println!("Error fetching ICP price: {}", e);
        },
    }
}

