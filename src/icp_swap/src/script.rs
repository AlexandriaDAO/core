use std::time::Duration;
use crate::distribute_reward;

const N: Duration = Duration::from_secs(180);//3 min in seconds

#[ic_cdk::init]
fn init() {
    let _timer_id = ic_cdk_timers::set_timer_interval(N, distribute_reward_wrapper);
}
#[ic_cdk::update]
fn distribute_reward_wrapper() {
    match distribute_reward() {
        Ok(_) => ic_cdk::println!("Rewards distributed successfully"),
        Err(e) => ic_cdk::println!("Error distributing rewards: {}", e),
    }
}
