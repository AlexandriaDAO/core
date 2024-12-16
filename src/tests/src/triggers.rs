use ic_cdk_timers::set_timer_interval;
use std::time::Duration;
use ic_cdk::spawn;
use ic_cdk::api::management_canister::main::raw_rand;
use ic_cdk::println;

use crate::{check_balances, swap, burn, stake, unstake, claim_icp_reward};

// Constants for timer intervals
pub const AUTOMATED_TEST_INTERVAL: Duration = Duration::from_secs(10);

async fn get_random_number() -> u8 {
    let result = raw_rand().await.expect("Failed to get randomness");
    result.0[0]
}

pub async fn random_action(percentage_chance: u8) -> bool {
    let random_number = get_random_number().await;
    random_number < percentage_chance
}

pub fn setup_automated_testing() {
    println!("🤖 Setting up automated testing...");
    
    let _timer_id = set_timer_interval(AUTOMATED_TEST_INTERVAL, || {
        println!("⏰ Timer triggered");
        let root_account = "root".to_string();
        
        spawn(async move {
            println!("📊 Checking balances for account: {}", root_account);
            let balances = check_balances(vec![root_account.clone()]).await;
            
            if let Some(balance) = balances.first() {
                println!("💰 Current balances - ICP: {}, LBRY: {}, ALEX: {}", 
                    balance.icp, balance.lbry, balance.alex);

                // ICP Swap check
                if balance.icp > 1.0 {
                    if random_action(50).await {
                        let amount = balance.icp.floor() as u64;
                        println!("💱 Attempting to swap {} ICP", amount);
                        match swap(amount, root_account.clone()).await {
                            Ok(_) => println!("✅ Successfully swapped {} ICP", amount),
                            Err(e) => println!("❌ Failed to swap ICP: {:?}", e),
                        }
                    }
                }

                // LBRY Burn check
                if balance.lbry > 10.0 {
                    if random_action(50).await {
                        let amount = (balance.lbry - 0.04).floor() as u64;
                        println!("🔥 Attempting to burn {} LBRY", amount);
                        match burn(amount, root_account.clone()).await {
                            Ok(_) => println!("✅ Successfully burned {} LBRY", amount),
                            Err(e) => println!("❌ Failed to burn LBRY: {:?}", e),
                        }
                    }
                }

                // ALEX Stake check
                if balance.alex > 1.0 {
                    let amount = balance.alex.floor() as u64;
                    println!("🔒 Attempting to stake {} ALEX", amount);
                    match stake(amount, root_account.clone()).await {
                        Ok(_) => println!("✅ Successfully staked {} ALEX", amount),
                        Err(e) => println!("❌ Failed to stake ALEX: {:?}", e),
                    }
                }
            } else {
                println!("⚠️ No balance information found for account: {}", root_account);
            }

            // Random unstake check
            if random_action(10).await {
                println!("🔓 Attempting to unstake ALEX");
                match unstake(root_account.clone()).await {
                    Ok(_) => println!("✅ Successfully unstaked ALEX"),
                    Err(e) => println!("❌ Failed to unstake ALEX: {:?}", e),
                }
            }

            // Random claim ICP reward check
            if random_action(35).await {
                println!("🎁 Attempting to claim ICP reward");
                match claim_icp_reward(root_account.clone()).await {
                    Ok(_) => println!("✅ Successfully claimed ICP reward"),
                    Err(e) => println!("❌ Failed to claim ICP reward: {:?}", e),
                }
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
