mod process;

use ic_cdk::{init, post_upgrade};
use ic_cdk_timers::set_timer_interval;
use std::time::Duration;

const CHECK_INTERVAL: u64 = 3600; // Check every hour

#[init]
fn init() {
    setup_timer();
    ic_cdk::print("Alex RevShare service initialized - processing every hour");
}

#[post_upgrade]
fn post_upgrade() {
    setup_timer();
    ic_cdk::print("Alex RevShare service upgraded - timer restarted");
}

fn setup_timer() {
    set_timer_interval(
        Duration::from_secs(CHECK_INTERVAL),
        || {
            ic_cdk::spawn(async {
                let _ = process::process_revenue().await;
            });
        }
    );
}

// Export candid
ic_cdk::export_candid!();