use candid::{Nat, Principal};
use ic_cdk::api::call;
use num_traits::{float, pow};
use std::cell::RefCell;
use std::sync::{Arc, Mutex};

use ic_cdk::{self, caller, update};
use ic_ledger_types::{
    AccountIdentifier, BlockIndex as BlockIndexIC, Memo, Tokens, DEFAULT_SUBACCOUNT,
    MAINNET_LEDGER_CANISTER_ID,
};
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{BlockIndex, TransferArg, TransferError};
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};

use crate::guard::*;
use crate::utils::*;
use crate::{get_stake, storage::*};
use num_bigint::BigUint;
const DECIMALS: usize=8; 

//swap
#[update]
pub async fn swap(amount_icp: u64) -> Result<String, String> {
    deposit_icp_in_canister(amount_icp).await?;
    ic_cdk::println!("******************Icp received by canister! Now Transfering the token*************************");
    let lbry_per_icp: u64 = LBRY_PER_ICP.with(|ratio: &std::sync::Arc<std::sync::Mutex<u64>>| {
        let ratio: std::sync::MutexGuard<u64> = ratio.lock().unwrap();
        *ratio
    });
    TOTAL_ICP_AVAILABLE.with(|icp: &Arc<Mutex<u64>>| {
        let mut icp: std::sync::MutexGuard<u64> = icp.lock().unwrap();
        *icp += amount_icp;
    });
    mint_LBRY(((amount_icp as f64) * (lbry_per_icp as f64 /(1*pow(10,DECIMALS)) as f64))as u64).await?;
    Ok("Swap Successfully!".to_string())
}
#[update]
async fn mint_LBRY(amount: u64) -> Result<BlockIndex, String> {
    let caller: Principal = caller();
    let amount = Nat::from(amount);

    let mut caller_subaccount_bytes = [0u8; 32];
    let caller_slice = caller.as_slice();
    caller_subaccount_bytes[..caller_slice.len()].copy_from_slice(caller_slice);

    ic_cdk::println!("Transferring {} tokens to account {}", amount, caller);

    let transfer_args: TransferArg = TransferArg {
        // can be used to distinguish between transactions
        // the amount we want to transfer
        amount,
        // we want to transfer tokens from the default subaccount of the canister
        from_subaccount: None,
        // if not specified, the default fee for the canister is used
        fee: None,
        // the account we want to transfer tokens to
        to: caller.into(),
        // a timestamp indicating when the transaction was created by the caller; if it is not specified by the caller then this is set to the current ICP time
        created_at_time: None,
        memo: None,
    };

    // 1. Asynchronously call another canister function using `ic_cdk::call`.
    ic_cdk::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
        // 2. Convert a textual representation of a Principal into an actual `Principal` object. The principal is the one we specified in `dfx.json`.
        //    `expect` will panic if the conversion fails, ensuring the code does not proceed with an invalid principal.
        Principal::from_text("c5kvi-uuaaa-aaaaa-qaaia-cai")
            .expect("Could not decode the principal."),
        // 3. Specify the method name on the target canister to be called, in this case, "icrc1_transfer".
        "icrc1_transfer",
        // 4. Provide the arguments for the call in a tuple, here `transfer_args` is encapsulated as a single-element tuple.
        (transfer_args,),
    )
    .await // 5. Await the completion of the asynchronous call, pausing the execution until the future is resolved.
    // 6. Apply `map_err` to transform any network or system errors encountered during the call into a more readable string format.
    //    The `?` operator is then used to propagate errors: if the result is an `Err`, it returns from the function with that error,
    //    otherwise, it unwraps the `Ok` value, allowing the chain to continue.
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    // 7. Access the first element of the tuple, which is the `Result<BlockIndex, TransferError>`, for further processing.
    .0
    // 8. Use `map_err` again to transform any specific ledger transfer errors into a readable string format, facilitating error handling and debugging.
    .map_err(|e| format!("ledger transfer error {:?}", e))
}

#[update]
pub async fn burn_LBRY(amount_lbry: u64) -> Result<String, String> {
    let caller: Principal = caller();
    let lbry_per_icp: u64 = LBRY_PER_ICP.with(|ratio: &std::sync::Arc<std::sync::Mutex<u64>>| {
        let ratio: std::sync::MutexGuard<u64> = ratio.lock().unwrap();
        *ratio
    });
    let amount_icp = (amount_lbry / lbry_per_icp) / 2;
    ic_cdk::println!("The amount is {}", amount_icp);
    burn_token(amount_lbry).await?;
    ic_cdk::println!("******************Token Burned*************************");
    send_icp(caller, amount_icp).await?;
    TOTAL_ICP_AVAILABLE.with(|icp: &Arc<Mutex<u64>>| {
        let mut icp = icp.lock().unwrap();
        *icp -= amount_icp;
    });
    ic_cdk::println!("******************ICP sent to caller account*************************");
    mint_UCG(amount_lbry, caller).await?;
    Ok("Burn Successfully!".to_string())
}

#[update]
async fn deposit_icp_in_canister(amount: u64) -> Result<BlockIndexIC, String> {
    let canister_id: Principal = ic_cdk::api::id();
    let canister_account: AccountIdentifier =
        AccountIdentifier::new(&canister_id, &DEFAULT_SUBACCOUNT);
    let amount = Tokens::from_e8s(amount);

    let transfer_args: ic_ledger_types::TransferArgs = ic_ledger_types::TransferArgs {
        memo: Memo(0),
        amount,
        fee: Tokens::from_e8s(10000),
        from_subaccount: Some(principal_to_subaccount(&caller())),
        to: canister_account,
        created_at_time: None,
    };

    ic_ledger_types::transfer(MAINNET_LEDGER_CANISTER_ID, transfer_args)
        .await
        .map_err(|e| format!("failed to call ledger: {:?}", e))?
        .map_err(|e: ic_ledger_types::TransferError| format!("ledger transfer error {:?}", e))
}
#[update]
async fn send_icp(destination: Principal, amount: u64) -> Result<BlockIndexIC, String> {
    let amount = Tokens::from_e8s(amount);
    ic_cdk::println!("Sending {} Icp to {}", amount, destination);

    let transfer_args: ic_ledger_types::TransferArgs = ic_ledger_types::TransferArgs {
        memo: Memo(0),
        amount,
        fee: Tokens::from_e8s(10000),
        from_subaccount: None,
        to: AccountIdentifier::new(&destination, &DEFAULT_SUBACCOUNT),
        created_at_time: None,
    };
    ic_ledger_types::transfer(MAINNET_LEDGER_CANISTER_ID, transfer_args)
        .await
        .map_err(|e| format!("failed to call ledger: {:?}", e))?
        .map_err(|e: ic_ledger_types::TransferError| format!("ledger transfer error {:?}", e))
}
#[update]
async fn burn_token(amount: u64) -> Result<BlockIndex, String> {
    let caller: Principal = caller();
    let canister_id: Principal = ic_cdk::api::id();

    let big_int_amount: BigUint = BigUint::from(amount);
    let amount: Nat = Nat(big_int_amount);

    ic_cdk::println!("Burning {} tokens from account {}", amount, caller);

    let transfer_from_args = TransferFromArgs {
        // the account we want to transfer tokens from (in this case we assume the caller approved the canister to spend funds on their behalf)
        from: Account::from(ic_cdk::caller()),
        // can be used to distinguish between transactions
        memo: None,
        // the amount we want to transfer
        amount,
        // the subaccount we want to spend the tokens from (in this case we assume the default subaccount has been approved)
        spender_subaccount: None,
        // if not specified, the default fee for the canister is used
        fee: None,
        // the account we want to transfer tokens to
        to: canister_id.into(),
        // a timestamp indicating when the transaction was created by the caller; if it is not specified by the caller then this is set to the current ICP time
        created_at_time: None,
    };

    // 1. Asynchronously call another canister function using `ic_cdk::call`.
    ic_cdk::call::<(TransferFromArgs,), (Result<BlockIndex, TransferFromError>,)>(
        // 2. Convert a textual representation of a Principal into an actual `Principal` object. The principal is the one we specified in `dfx.json`.
        //    `expect` will panic if the conversion fails, ensuring the code does not proceed with an invalid principal.
        Principal::from_text("c5kvi-uuaaa-aaaaa-qaaia-cai")
            .expect("Could not decode the principal."),
        // 3. Specify the method name on the target canister to be called, in this case, "icrc1_transfer".
        "icrc2_transfer_from",
        // 4. Provide the arguments for the call in a tuple, here `transfer_args` is encapsulated as a single-element tuple.
        (transfer_from_args,),
    )
    .await // 5. Await the completion of the asynchronous call, pausing the execution until the future is resolved.
    // 6. Apply `map_err` to transform any network or system errors encountered during the call into a more readable string format.
    //    The `?` operator is then used to propagate errors: if the result is an `Err`, it returns from the function with that error,
    //    otherwise, it unwraps the `Ok` value, allowing the chain to continue.
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    // 7. Access the first element of the tuple, which is the `Result<BlockIndex, TransferError>`, for further processing.
    .0
    // 8. Use `map_err` again to transform any specific ledger transfer errors into a readable string format, facilitating error handling and debugging.
    .map_err(|e: TransferFromError| format!("ledger transfer error {:?}", e))
}
#[update]
pub async fn mint_UCG(lbry_amount: u64, owner: Principal) -> Result<String, String> {
    ic_cdk::println!("Ok here am I , got this amount {} right?", lbry_amount);
    let amount = lbry_amount as f64 / (1*pow(10,DECIMALS)) as f64;
    // 1. Asynchronously call another canister function using `ic_cdk::call`.
    let result = ic_cdk::call::<(f64, Principal, Principal), (Result<String, String>,)>(
        Principal::from_text("bkyz2-fmaaa-aaaaa-qaaaq-cai")
            .expect("Could not decode the principal."),
        "mint_UCG",
        (amount, caller(), owner),
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e));

    match result {
        Ok((ledger_result,)) => match ledger_result {
            Ok(success_msg) => Ok(success_msg),
            Err(err_msg) => Err(format!("ledger transfer error: {}", err_msg)),
        },
        Err(err) => Err(err),
    }
}
//stake
#[update]
async fn deposit_token(amount: u64) -> Result<BlockIndex, String> {
    let caller: Principal = caller();
    let canister_id: Principal = ic_cdk::api::id();

    let mut caller_subaccount_bytes = [0u8; 32];
    let caller_slice = caller.as_slice();
    caller_subaccount_bytes[..caller_slice.len()].copy_from_slice(caller_slice);

    let amount: Nat = Nat::from(amount);

    ic_cdk::println!("Staking {} tokens caller account {}", amount, caller);

    let transfer_from_args: TransferFromArgs = TransferFromArgs {
        from: Account::from(ic_cdk::caller()),
        memo: None,
        amount,
        spender_subaccount: None,
        fee: None,
        to: canister_id.into(),
        created_at_time: None,
    };

    ic_cdk::call::<(TransferFromArgs,), (Result<BlockIndex, TransferFromError>,)>(
        Principal::from_text("cbopz-duaaa-aaaaa-qaaka-cai")
            .expect("Could not decode the principal."),
        "icrc2_transfer_from",
        (transfer_from_args,),
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    .0
    .map_err(|e| format!("ledger transfer error {:?}", e))
}

#[update]
async fn stake_UCG(amount: u64) -> Result<String, String> {
    // Proceed with transfer
    deposit_token(amount).await?;
    let new_stake = STAKES.with(|stakes: &RefCell<Stakes>| {
        let mut stakes = stakes.borrow_mut();

        let current_stake: &mut Stake = stakes.stakes.entry(caller()).or_insert(Stake {
            amount: 0,
            time: ic_cdk::api::time(),
            reward_icp: 0,
        });
        current_stake.amount += amount;
        current_stake.time = ic_cdk::api::time();
    });
    TOTAL_UCG_STAKED.with(|total_staked| {
        let mut total_staked: std::sync::MutexGuard<u64> = total_staked.lock().unwrap();
        *total_staked += amount
    });
    ic_cdk::println!("Staked Successfully!");
    Ok("Staked Successfully!".to_string())
}
#[update]
async fn withdraw_token(amount: u64) -> Result<BlockIndex, String> {
    let caller: Principal = caller();
    let canister_id: Principal = ic_cdk::api::id();

    let mut caller_subaccount_bytes = [0u8; 32];
    let caller_slice = caller.as_slice();
    caller_subaccount_bytes[..caller_slice.len()].copy_from_slice(caller_slice);

    let amount = Nat::from(amount);

    ic_cdk::println!("Staking {} tokens from account {}", amount, caller);

    let transfer_from_args: TransferFromArgs = TransferFromArgs {
        from: canister_id.into(),
        memo: None,
        amount,
        spender_subaccount: None,
        fee: None,
        to: Account::from(ic_cdk::caller()),
        created_at_time: None,
    };

    ic_cdk::call::<(TransferFromArgs,), (Result<BlockIndex, TransferFromError>,)>(
        Principal::from_text("cbopz-duaaa-aaaaa-qaaka-cai")
            .expect("Could not decode the principal."),
        "icrc2_transfer_from",
        (transfer_from_args,),
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    .0
    .map_err(|e| format!("ledger transfer error {:?}", e))
}
#[update]
async fn un_stake_UCG(amount: u64) -> Result<String, String> {
    // verify caller balance
    if verify_caller_balance(amount) == false {
        return Err("Insufficent funds".to_string());
    }
    // Proceed with transfer
    withdraw_token(amount).await?;
    STAKES.with(|stakes| {
        let mut stakes = stakes.borrow_mut();
        let current_stake = stakes.stakes.entry(caller()).or_insert(Stake {
            amount: 0,
            time: ic_cdk::api::time(),
            reward_icp: 0,
        });
        current_stake.amount -= amount;
    });
    TOTAL_UCG_STAKED.with(|total_staked| {
        let mut total_staked: std::sync::MutexGuard<u64> = total_staked.lock().unwrap();
        *total_staked -= amount;
    });
    ic_cdk::println!("UnStaked Successfully!");
    Ok("UnStaked Successfully!".to_string())
}
#[update(guard = "is_admin")]
pub fn set_ratio_LBRY_per_ICP(lbry_per_ICP: u64) -> Result<String, String> {
    LBRY_PER_ICP.with(|ratio: &std::sync::Arc<std::sync::Mutex<u64>>| {
        let mut ratio: std::sync::MutexGuard<u64> = ratio.lock().unwrap();
        *ratio = lbry_per_ICP;
    });
    Ok(("Successfuly updated LBRY ratio !").to_string())
}
#[update(guard = "is_admin")]
pub fn set_staking_reward(percentage: f64) -> Result<String, String> {
    STAKING_REWARD_PERCENTAGE.with(|per: &std::sync::Arc<std::sync::Mutex<f64>>| {
        let mut per: std::sync::MutexGuard<f64> = per.lock().unwrap();
        *per = percentage;
    });
    Ok(("Successfuly updated staking reward percentage !").to_string())
}
//Guard ensure call is only by canister.
// #[update(guard="is_canister")]
#[update]
pub fn distribute_reward() -> Result<String, String> {
    let staking_percentage = STAKING_REWARD_PERCENTAGE.with(|per| {
        let per: std::sync::MutexGuard<f64> = per.lock().unwrap();
        *per
    });
    if staking_percentage <= 0.0 {
        return Err("Staking percentage very low,reward not possible".to_string());
    }

    let total_icp_allocated = (TOTAL_ICP_AVAILABLE.with(|icp| {
        let icp: std::sync::MutexGuard<u64> = icp.lock().unwrap();
        ic_cdk::println!("The icp aviable are {}", icp);
        *icp
    }) as f64
        * staking_percentage) as u64
        / 100;
    ic_cdk::println!("the total icp is {}", total_icp_allocated);

    if total_icp_allocated <= 0 {
        return Err("Low Icp balance,reward not possible".to_string());
    }

    let total_staked_ucg: u64 = TOTAL_UCG_STAKED.with(|staked: &Arc<Mutex<u64>>| {
        let staked: std::sync::MutexGuard<u64> = staked.lock().unwrap();
        *staked
    });
    let icp_reward_per_ucg = total_icp_allocated / total_staked_ucg;
    ic_cdk::println!("the reward icp is {}", icp_reward_per_ucg);

    STAKES.with(|stakes: &RefCell<Stakes>| {
        let mut stakes_mut = stakes.borrow_mut();
        for stake in stakes_mut.stakes.values_mut() {
            let reward = stake.amount * icp_reward_per_ucg;
            stake.reward_icp += reward;
        }
    });
    Ok("Sucess".to_string())
}

#[update]
async fn claim_icp_reward() -> Result<String, String> {
    let caller_stake_reward: Option<Stake> = get_stake(caller());
    match caller_stake_reward {
        Some(stake) => {
            if stake.reward_icp <= 0 {
                return Err("Insufficient rewards".to_string());
            }            
            send_icp(caller(), stake.reward_icp).await?;
        
            // make reward balance to 0
            STAKES.with(|stakes| {
                let mut stakes = stakes.borrow_mut();
                let current_stake = stakes.stakes.entry(caller()).or_insert(Stake {
                    amount: 0,
                    time: ic_cdk::api::time(),
                    reward_icp: 0,
                });
                current_stake.reward_icp = 0;
            });

            Ok("success".to_string())
            // Proceed with your operatio
        }
        None => {
            // User doesn't have a stake
            return Err("No record found !".to_string());
        }
    }
}
