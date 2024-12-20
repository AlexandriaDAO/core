use ic_cdk_timers::set_timer_interval;
use std::time::Duration;
use ic_cdk::{call, spawn, println};
use ic_cdk::api::management_canister::main::raw_rand;
use candid::Principal;

use crate::{check_balances, swap, stake, claim_icp_reward, icp_swap_principal};

// Constants for timer intervals
pub const AUTOMATED_TEST_INTERVAL: Duration = Duration::from_secs(30); // Increased interval

async fn get_random_number() -> u8 {
    let result = raw_rand().await.expect("Failed to get randomness");
    result.0[0]
}

pub async fn random_action(percentage_chance: u8) -> bool {
    let random_number = get_random_number().await;
    random_number < percentage_chance
}

#[derive(Debug, candid::CandidType, candid::Deserialize)]
struct StakeInfo {
    time: u64,
    reward_icp: u64,
    amount: u64,
}

async fn get_stake(principal: Principal) -> Option<StakeInfo> {
    match call(icp_swap_principal(), "get_stake", (principal,)).await {
        Ok((stake,)) => stake,
        Err(e) => {
            println!("❌ Failed to get stake: {:?}", e);
            None
        }
    }
}

pub fn setup_automated_testing() {
    let _timer_id = set_timer_interval(AUTOMATED_TEST_INTERVAL, || {
        println!("⏰ Timer triggered");
        let root_account = "root".to_string();
        
        spawn(async move {
            println!("📊 Checking balances for account: {}", root_account);
            let balances = check_balances(vec![root_account.clone()]).await;
            
            if let Some(balance) = balances.first() {
                println!("💰 Current balances - ICP: {}, LBRY: {}, ALEX: {}", 
                    balance.icp, balance.lbry, balance.alex);

                // ALEX Stake check
                if balance.alex > 1.0 {
                    let amount = balance.alex.floor() as u64;
                    println!("📊Stake before action: {:?}", get_stake(ic_cdk::id()).await);
                    println!("🔒 Attempting to stake {} ALEX", amount);
                    match stake(amount, root_account.clone()).await {
                        Ok(_) => {
                            println!("✅ Successfully staked {} ALEX", amount);
                            // Check stake after staking
                            if let Some(stake_info) = get_stake(ic_cdk::id()).await {
                                println!("📊 Stake after action: {:?}", stake_info);
                            } else {
                                println!("⚠️ No stake information found");
                            }
                        },
                        Err(e) => println!("❌ Failed to stake ALEX: {:?}", e),
                    }
                }

                // ICP Swap check with reduced frequency
                if balance.icp > 1.0 && random_action(25).await {
                    let amount = balance.icp.floor() as u64;
                    println!("💱 Attempting to swap {} ICP", amount);
                    match swap(amount, root_account.clone()).await {
                        Ok(_) => println!("✅ Successfully swapped {} ICP", amount),
                        Err(e) => println!("❌ Failed to swap ICP: {:?}", e),
                    }
                }

                // Claim ICP reward with reduced frequency
                if random_action(15).await {
                    println!("🎁 Attempting to claim ICP reward");
                    match claim_icp_reward(root_account.clone()).await {
                        Ok(_) => println!("✅ Successfully claimed ICP reward"),
                        Err(e) => println!("❌ Failed to claim ICP reward: {:?}", e),
                    }
                }
            } else {
                println!("⚠️ No balance information found for account: {}", root_account);
            }
        });
    });
    
    println!("✅ Automated testing setup complete");
}

#[ic_cdk::update]
pub fn init_automated_testing() {
    println!("🚀 Initializing automated testing");
    setup_automated_testing();
}

#[ic_cdk::update]
pub fn test_logging() {
    println!("🔍 Test log message");
}
