use candid::{ CandidType, Principal };
use ic_cdk::{ self, caller, init, post_upgrade, update };
use serde::Deserialize;
use std::time::Duration;

use crate::{
    distribute_reward,
    get_icp_rate_in_cents,
    utils::register_info_log,
    ArchiveBalance,
    DailyValues,
    LbryRatio,
    Stake,
    APY,
    ARCHIVED_TRANSACTION_LOG,
    DISTRIBUTION_INTERVALS,
    LBRY_RATIO,
    STAKES,
    TOTAL_ARCHIVED_BALANCE,
    TOTAL_UNCLAIMED_ICP_REWARD,
};

pub const REWARD_DISTRIBUTION_INTERVAL: Duration = Duration::from_secs(60 * 60); // 1 hour.
pub const PRICE_FETCH_INTERVAL: Duration = Duration::from_secs(1 * 24 * 60 * 60); // 1 days in seconds

#[derive(CandidType, Deserialize, Clone, Default)]
pub struct InitArgs {
    pub stakes: Option<Vec<(Principal, Stake)>>,
    pub archived_transaction_log: Option<Vec<(Principal, ArchiveBalance)>>,
    pub total_unclaimed_icp_reward: Option<u64>,
    pub lbry_ratio: Option<LbryRatio>,
    pub total_archived_balance: Option<u64>,
    pub apy: Option<Vec<(u32, DailyValues)>>,
    pub distribution_intervals: Option<u32>,
}

// Function to initialize global states from InitArgs.

fn initialize_globals(args: InitArgs) {
    if let Some(stakes) = args.stakes {
        STAKES.with(|m| {
            let mut stakes_map = m.borrow_mut();
            for (principal, stake) in stakes {
                stakes_map.insert(principal, stake);
            }
        });
    }

    if let Some(total_unclaimed_icp_reward) = args.total_unclaimed_icp_reward {
        TOTAL_UNCLAIMED_ICP_REWARD.with(|m| {
            m.borrow_mut().insert((), total_unclaimed_icp_reward);
        });
    }

    if let Some(lbry_ratio) = args.lbry_ratio {
        LBRY_RATIO.with(|m| {
            m.borrow_mut().insert((), lbry_ratio);
        });
    }

    if let Some(total_archived_balance) = args.total_archived_balance {
        TOTAL_ARCHIVED_BALANCE.with(|m| {
            m.borrow_mut().insert((), total_archived_balance);
        });
    }

    if let Some(apy) = args.apy {
        APY.with(|m| {
            let mut apy_map = m.borrow_mut();
            for (day, values) in apy {
                apy_map.insert(day, values);
            }
        });
    }

    if let Some(distribution_intervals) = args.distribution_intervals {
        DISTRIBUTION_INTERVALS.with(|m| {
            m.borrow_mut().insert((), distribution_intervals);
        });
    }

    if let Some(logs) = args.archived_transaction_log {
        ARCHIVED_TRANSACTION_LOG.with(|m| {
            let mut log_map = m.borrow_mut();
            for (principal, balance) in logs {
                log_map.insert(principal, balance);
            }
        });
    }
}

#[init]
fn init(args: Option<InitArgs>) {
    register_info_log(caller(), "init", "Starting initialization...");

    match args {
        Some(init_args) => {
            register_info_log(caller(), "init", "Received init arguments!");

            if let Some(ref stakes) = init_args.stakes {
                register_info_log(
                    caller(),
                    "init",
                    &format!("Stakes provided with length: {}", stakes.len())
                );
            }
            if let Some(ref archived_log) = init_args.archived_transaction_log {
                register_info_log(
                    caller(),
                    "init",
                    &format!("Archived log provided with length: {}", archived_log.len())
                );
            }
            if let Some(unclaimed_reward) = init_args.total_unclaimed_icp_reward {
                register_info_log(
                    caller(),
                    "init",
                    &format!("Total unclaimed reward: {}", unclaimed_reward)
                );
            }
            if let Some(ref ratio) = init_args.lbry_ratio {
                register_info_log(
                    caller(),
                    "init",
                    &format!("LBRY ratio provided: {}", ratio.ratio)
                );
            }

            initialize_globals(init_args);
            register_info_log(caller(), "init", "Initialization with provided args complete");
        }
        None => {
            register_info_log(caller(), "init", "No arguments provided, using defaults");
            initialize_globals(InitArgs::default());
            register_info_log(caller(), "init", "Default initialization complete");
        }
    }

    setup_timers();
    register_info_log(caller(), "init", "Initialization process completed");
}

#[post_upgrade]
fn post_upgrade() {
    setup_timers();
    register_info_log(caller(), "post_upgrade", "Post-upgrade timer setup completed");
}

fn setup_timers() {
    // Initial price fetch
    ic_cdk_timers::set_timer(Duration::from_secs(0), || {
        ic_cdk::spawn(get_icp_rate_cents_wrapper());
    });

    // Periodic reward distribution
    let _reward_timer_id: ic_cdk_timers::TimerId = ic_cdk_timers::set_timer_interval(
        REWARD_DISTRIBUTION_INTERVAL,
        || { ic_cdk::spawn(distribute_reward_wrapper()) }
    );

    // Periodic price fetch
    let _price_timer_id: ic_cdk_timers::TimerId = ic_cdk_timers::set_timer_interval(
        PRICE_FETCH_INTERVAL,
        || { ic_cdk::spawn(get_icp_rate_cents_wrapper()) }
    );
}

async fn distribute_reward_wrapper() {
    match distribute_reward().await {
        Ok(_) => (),
        Err(e) =>
            register_info_log(caller(), "distribute_reward_wrapper", &format!("Error distributing rewards: {}", e)),
    }
}
async fn get_icp_rate_cents_wrapper() {
    match get_icp_rate_in_cents().await {
        Ok(price) => {
            register_info_log(caller(), "get_icp_rate_cents_wrapper", "Price fetch completed without errors");
        }
        Err(e) => {
            register_info_log(
                caller(),
                "get_icp_rate_cents_wrapper",
                &format!("Error fetching ICP price. Error details: {:?}", e)
            );
        }
    }
}
