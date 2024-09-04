use candid::{CandidType, Nat, Principal};
use serde::Deserialize;
use std::cell::RefCell;
use std::sync::{Arc, Mutex};

use crate::utils::*;
use crate::{get_current_LBRY_ratio, guard::*};
use ic_cdk::{self, caller, query, update};
use ic_ledger_types::{
    AccountIdentifier, BlockIndex as BlockIndexIC, Memo, Tokens, DEFAULT_SUBACCOUNT,
    MAINNET_LEDGER_CANISTER_ID,
};
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{BlockIndex, TransferArg, TransferError};
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};

use crate::{get_stake, storage::*};
use num_bigint::BigUint;

#[derive(CandidType, Deserialize, Debug)]
pub struct Metadata {
    decimals: u32,
    forex_timestamp: Option<u64>,
    quote_asset_num_received_rates: u64,
    base_asset_num_received_rates: u64,
    base_asset_num_queried_sources: u64,
    standard_deviation: u64,
    quote_asset_num_queried_sources: u64,
}
#[derive(CandidType, Deserialize, Debug)]
pub struct ExchangeRateResponse {
    metadata: Metadata,
    rate: u64,
    timestamp: u64,
    quote_asset: Asset,
    base_asset: Asset,
}
#[derive(CandidType, Deserialize, Debug)]
pub enum AssetClass {
    Cryptocurrency,
    FiatCurrency,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct Asset {
    class: AssetClass,
    symbol: String,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum XRCResponse {
    Ok(ExchangeRateResponse),
    Err(ExchangeRateError),
}
#[derive(CandidType, Deserialize)]
pub struct GetExchangeRateRequest {
    base_asset: Asset,
    quote_asset: Asset,
    timestamp: Option<u64>,
}

//swap
#[update]
pub async fn swap(amount_icp: u64) -> Result<String, String> {
    // reentrancy(|| async move{
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller)?;


    if amount_icp < 10_000_000 {
        return Err("Minimum amount is 0.1 ICP".to_string());
    }
    let limit_result = within_max_limit(0).await; //check if limit max reached
    if limit_result == false {
        return Err("No swap allowed, max limit reached!".to_string());
    }
    deposit_icp_in_canister(amount_icp).await?;
    ic_cdk::println!("******************Icp received by canister! Now Transfering the token*************************");
    TOTAL_ICP_AVAILABLE.with(|icp: &Arc<Mutex<u64>>| -> Result<(), String> {
        let mut icp: std::sync::MutexGuard<u64> = icp
            .lock()
            .map_err(|_| "Failed to lock TOTAL_ICP_AVAILABLE".to_string())?;
        *icp = icp
            .checked_add(amount_icp)
            .ok_or("Arithmetic overflow occurred in TOTAL_ICP_AVAILABLE.")?;
        Ok(())
    })?;
    let icp_rate_in_cents: u64 = get_current_LBRY_ratio();
    let lbry_amount: u64 = amount_icp
        .checked_mul(icp_rate_in_cents)
        .ok_or("Arithmetic overflow occurred in lbry_amount.")?;
    mint_LBRY(lbry_amount).await?;
    Ok("Swapped Successfully!".to_string())
    //  }).await
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
        Principal::from_text(LBRY_CANISTER_ID).expect("Could not decode the principal."),
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
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller)?;

    if amount_lbry < 1 {
        return Err("Minimum 1 LBRY required!".to_string());
    }
    let limit_result = within_max_limit(amount_lbry).await;
    if limit_result == false {
        return Err("Max limit reached, LBRY burning stopped!".to_string());
    }
    //Dynamic price
    let mut icp_rate_in_cents: u64 = get_current_LBRY_ratio();
    ic_cdk::println!("The rate is {}", icp_rate_in_cents);
    ic_cdk::println!("The amount_lbry is {}", amount_lbry);
    let mut amount_icp_e8s = amount_lbry
        .checked_mul(100_000_000)
        .ok_or("Arithmetic overflow occurred in amount_icp_e8s.")?;
    icp_rate_in_cents = icp_rate_in_cents
        .checked_mul(2)
        .ok_or("Arithmetic overflow occurred in icp_rate_in_cents")?;
    amount_icp_e8s = amount_icp_e8s
        .checked_div(icp_rate_in_cents)
        .ok_or("Division failed in amount_icp. Please verify the amount is valid and non-zero")?;

    if amount_icp_e8s == 0 {
        return Err("Calculated ICP amount is too small".to_string());
    }
    let total_icp_available = TOTAL_ICP_AVAILABLE.with(|icp: &Arc<Mutex<u64>>| {
        let icp: std::sync::MutexGuard<u64> = icp.lock().unwrap();
        *icp
    });
    let total_unclaimed_icp: u64 = TOTAL_UNCLAIMED_ICP_REWARD.with(|icp| {
        let icp: std::sync::MutexGuard<u64> = icp.lock().unwrap();
        *icp
    });

    let remaining_icp: u64 = total_icp_available
        .checked_sub(total_unclaimed_icp)
        .ok_or("Arithmetic underflow in remaining_icp.")?;

    // Calculate 50% of the remaining ICP (keeping 50% for staker pools)
    let actual_available_icp = remaining_icp.checked_div(2).ok_or(
        "Division failed in actual_available_icp. Please verify the amount is valid and non-zero",
    )?;

    if amount_icp_e8s > actual_available_icp {
        return Err("Burning stopped, insufficent icp funds ".to_string());
    }
    let amount_lbry_e8s = amount_lbry
        .checked_mul(100_000_000)
        .ok_or("Arithmetic overflow occurred in amount_lbry_e8s.")?;
    burn_token(amount_lbry_e8s).await?;
    ic_cdk::println!("******************Token Burned*************************");
    send_icp(caller, amount_icp_e8s).await?;
    TOTAL_ICP_AVAILABLE.with(|icp: &Arc<Mutex<u64>>| -> Result<(), String> {
        let mut icp = icp
            .lock()
            .map_err(|_| "Failed to lock TOTAL_ICP_AVAILABLE".to_string())?;
        *icp = icp
            .checked_sub(amount_icp_e8s)
            .ok_or_else(|| "Arithmetic underflow in TOTAL_ICP_AVAILABLE.".to_string())?;
        Ok(())
    })?;
    ic_cdk::println!("******************ICP sent to caller account*************************");
    mint_ALEX(amount_lbry, caller).await?;
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
        fee: Tokens::from_e8s(ICP_TRANSFER_FEE),
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
        fee: Tokens::from_e8s(ICP_TRANSFER_FEE),
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
        Principal::from_text(LBRY_CANISTER_ID).expect("Could not decode the principal."),
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
async fn mint_ALEX(lbry_amount: u64, caller: Principal) -> Result<String, String> {
    // 1. Asynchronously call another canister function using `ic_cdk::call`.
    let result: Result<(Result<String, String>,), String> =
        ic_cdk::call::<(u64, Principal), (Result<String, String>,)>(
            Principal::from_text(TOKENOMICS_CANISTER_ID).expect("Could not decode the principal."),
            "mint_ALEX",
            (lbry_amount, caller),
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
        Principal::from_text(ALEX_CANISTER_ID).expect("Could not decode the principal."),
        "icrc2_transfer_from",
        (transfer_from_args,),
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    .0
    .map_err(|e| format!("ledger transfer error {:?}", e))
}

#[update]
async fn stake_ALEX(amount: u64) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller)?;
    if amount < 100_000_000 {
        return Err("Minimum 1 Alex is required ".to_string());
    }
    // Proceed with transfer
    deposit_token(amount).await?;
    let new_stake: Result<(), String> =
        STAKES.with(|stakes: &RefCell<Stakes>| -> Result<(), String> {
            let mut stakes: std::cell::RefMut<Stakes> = stakes.borrow_mut();

            let current_stake: &mut Stake = stakes.stakes.entry(caller).or_insert(Stake {
                amount: 0,
                time: ic_cdk::api::time(),
                reward_icp: 0,
            });
            current_stake.amount = current_stake
                .amount
                .checked_add(amount)
                .ok_or("Arithmetic Overflow occurred in current_stake.amount")?;
            current_stake.time = ic_cdk::api::time();
            Ok(())
        });
    TOTAL_ALEX_STAKED.with(|total_staked: &Arc<Mutex<u64>>| -> Result<(), String> {
        let mut total_staked: std::sync::MutexGuard<u64> = total_staked.lock().unwrap();
        *total_staked = total_staked
            .checked_add(amount)
            .ok_or("Arithmetic Overflow occurred in TOTAL_ALEX_STAKED.")?;
        Ok(())
    })?;
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

    ic_cdk::println!("Un staking {} tokens from account {}", amount, caller);

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
        Principal::from_text(ALEX_CANISTER_ID).expect("Could not decode the principal."),
        "icrc2_transfer_from",
        (transfer_from_args,),
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    .0
    .map_err(|e| format!("ledger transfer error {:?}", e))
}
#[update]
async fn un_stake_ALEX(amount: u64) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller)?;
    if amount < 100_000_000 {
        return Err("Minimum 1 Alex is required ".to_string());
    }
    // verify caller balance
    if verify_caller_balance(amount) == false {
        return Err("Insufficent funds".to_string());
    }
    // Proceed with transfer
    withdraw_token(amount).await?;
    STAKES.with(|stakes| -> Result<(), String> {
        let mut stakes = stakes.borrow_mut();
        let current_stake = stakes.stakes.entry(caller).or_insert(Stake {
            amount: 0,
            time: ic_cdk::api::time(),
            reward_icp: 0,
        });
        current_stake.amount = current_stake
            .amount
            .checked_sub(amount)
            .ok_or("Arithmetic underflow occurred in STAKES.")?;
        Ok(())
    })?;

    TOTAL_ALEX_STAKED.with(|total_staked| -> Result<(), String> {
        let mut total_staked: std::sync::MutexGuard<u64> = total_staked.lock().unwrap();
        *total_staked = total_staked
            .checked_sub(amount)
            .ok_or("Arithmetic underflow occurred in TOTAL_ALEX_STAKED")?;
        Ok(())
    })?;
    ic_cdk::println!("UnStaked Successfully!");
    Ok("UnStaked Successfully!".to_string())
}
#[update]
async fn un_stake_all_ALEX() -> Result<String, String> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller)?;
    let staked_amount = get_caller_stake_balance();
    // verify caller balance > 0
    if staked_amount <= 0 {
        return Err("Insufficent funds".to_string());
    }
    // Proceed with transfer.
    withdraw_token(staked_amount).await?;
    STAKES.with(|stakes| -> Result<(), String> {
        let mut stakes = stakes.borrow_mut();
        let current_stake = stakes.stakes.entry(caller).or_insert(Stake {
            amount: 0,
            time: ic_cdk::api::time(),
            reward_icp: 0,
        });
        current_stake.amount = current_stake
            .amount
            .checked_sub(staked_amount)
            .ok_or_else(|| "Arithmetic underflow occurred in STAKES".to_string())?;
        Ok(())
    })?;
    TOTAL_ALEX_STAKED.with(|total_staked| -> Result<(), String> {
        let mut total_staked: std::sync::MutexGuard<u64> = total_staked.lock().unwrap();
        *total_staked = total_staked
            .checked_sub(staked_amount)
            .ok_or("Arithmetic underflow occurred in TOTAL_ALEX_STAKED")?;
        Ok(())
    })?;
    ic_cdk::println!("UnStaked Successfully!");
    Ok("UnStaked Successfully!".to_string())
}

//Guard ensure call is only by canister.
#[update(guard = "is_canister")]
pub fn distribute_reward() -> Result<String, String> {
    const SCALING_FACTOR: u128 = 1_000_000; // Adjust based on your precision needs

    let staking_percentage = STAKING_REWARD_PERCENTAGE;
    let total_icp_available = TOTAL_ICP_AVAILABLE.with(|icp| {
        let icp: std::sync::MutexGuard<u64> = icp.lock().unwrap();
        *icp
    });
    let total_unclaimed_icp_reward = TOTAL_UNCLAIMED_ICP_REWARD.with(|icp| {
        let icp: std::sync::MutexGuard<u64> = icp.lock().unwrap();
        *icp
    });
    ic_cdk::println!("The unclaimed reward is ,{}", total_unclaimed_icp_reward);
    if total_icp_available <= 0 || total_icp_available < total_unclaimed_icp_reward {
        return Err("Insufficient ICP balance for reward distribution".to_string());
    }
    let mut total_icp_allocated: u128 = total_icp_available
        .checked_sub((total_unclaimed_icp_reward as u128).try_into().unwrap())
        .ok_or("Arithmetic underflow occurred in total_icp_available.")?
        .into();
    total_icp_allocated = total_icp_allocated
        .checked_mul(staking_percentage as u128)
        .ok_or("Arithmetic overflow occurred in total_icp_allocated.")?;
    ic_cdk::println!("Allocated icp {}", total_icp_allocated);

    total_icp_allocated = total_icp_allocated.checked_div(10000).ok_or(
        "Division failed in ICP allocation. Please verify the amount is valid and non-zero",
    )?;
    if total_icp_allocated < 1000_000_000 {
        return Err("Cannot distribute reward allocated Icp balance less than 10".to_string());
    }
    let total_staked_alex =
        TOTAL_ALEX_STAKED.with(|staked: &Arc<Mutex<u64>>| *staked.lock().unwrap()) as u128;
    if total_staked_alex == 0 {
        return Err("No ALEX staked, cannot distribute rewards".to_string());
    }
    ic_cdk::println!("Allocated icp2 {}", total_icp_allocated);
    ic_cdk::println!("total staked alex {}", total_staked_alex);

    let icp_reward_per_alex = (total_icp_allocated * SCALING_FACTOR)
        .checked_div(total_staked_alex)
        .ok_or("Division failed in icp_reward_per_alex. Please verify it's valid and non-zero")?;

    ic_cdk::println!("ICP reward per alex (scaled) is {} !", icp_reward_per_alex);

    let mut total_icp_reward: u128 = 0;

    STAKES.with(|stakes: &RefCell<Stakes>| -> Result<(), String> {
        let mut stakes_mut = stakes.borrow_mut();
        for stake in stakes_mut.stakes.values_mut() {
            let reward = (stake.amount as u128)
                .checked_mul(icp_reward_per_alex)
                .ok_or_else(|| "Arithmetic overflow occurred in reward.".to_string())?
                .checked_div(SCALING_FACTOR)
                .ok_or_else(|| {
                    "Division failed in reward. Please verify it's valid and non-zero".to_string()
                })?;

            total_icp_reward = total_icp_reward
                .checked_add(reward)
                .ok_or_else(|| "Arithmetic overflow occurred in total_icp_reward.".to_string())?;

            stake.reward_icp = stake.reward_icp.checked_add(reward as u64).ok_or_else(|| {
                "Arithmetic overflow occurred in individual stake.reward_icp".to_string()
            })?;
        }
        Ok(())
    })?;

    TOTAL_UNCLAIMED_ICP_REWARD.with(|icp: &Arc<Mutex<u64>>| -> Result<(), String> {
        let mut icp = icp
            .lock()
            .map_err(|_| "Failed to lock TOTAL_UNCLAIMED_ICP_REWARD".to_string())?;
        *icp = icp
            .checked_add(total_icp_reward as u64)
            .ok_or("Arithmetic overflow occurred in TOTAL_UNCLAIMED_ICP_REWARD.")?;
        Ok(())
    })?;
    Ok("Success".to_string())
}

#[update]
async fn claim_icp_reward() -> Result<String, String> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller)?;
    let caller_stake_reward: Option<Stake> = get_stake(caller);
    match caller_stake_reward {
        Some(stake) => {
            if stake.reward_icp <= 1000_000 {
                return Err("Insufficient rewards".to_string());
            }
            let total_icp_available = TOTAL_ICP_AVAILABLE.with(|icp| {
                let icp: std::sync::MutexGuard<u64> = icp.lock().unwrap();
                *icp
            });
            if stake.reward_icp > total_icp_available {
                return Err("Insufficient ICP Balance in canister".to_string());
            }
            send_icp(caller, stake.reward_icp).await?;
            TOTAL_UNCLAIMED_ICP_REWARD.with(|icp| -> Result<(), String> {
                let mut icp = icp
                    .lock()
                    .map_err(|_| "Failed to lock TOTAL_UNCLAIMED_ICP_REWARD".to_string())?;
                // Use checked addition for TOTAL_UNCLAIMED_ICP_REWARD
                *icp = icp.checked_sub(stake.reward_icp).ok_or_else(|| {
                    "Arithmetic underflow occurred in TOTAL_UNCLAIMED_ICP_REWARD".to_string()
                })?;
                Ok(())
            })?;
            // make reward balance to 0
            STAKES.with(|stakes: &RefCell<Stakes>| {
                let mut stakes = stakes.borrow_mut();
                let current_stake = stakes.stakes.entry(caller).or_insert(Stake {
                    amount: 0,
                    time: ic_cdk::api::time(),
                    reward_icp: 0,
                });
                current_stake.reward_icp = 0;
            });

            Ok("Success".to_string())
        }
        None => {
            // User doesn't have a stake
            return Err("No record found !".to_string());
        }
    }
}

#[update(guard = "is_canister")]
pub async fn get_icp_rate_in_cents() -> Result<u64, String> {
    let request: GetExchangeRateRequest = GetExchangeRateRequest {
        base_asset: Asset {
            symbol: "ICP".to_string(),
            class: AssetClass::Cryptocurrency,
        },
        quote_asset: Asset {
            symbol: "USDT".to_string(),
            class: AssetClass::Cryptocurrency,
        },
        timestamp: None,
    };

    // XRC canister ID
    let xrc_canister_id = Principal::from_text(XRC_CANISTER_ID).unwrap();

    // Prepare the call
    let call_result: Result<Vec<u8>, (ic_cdk::api::call::RejectionCode, String)> =
        ic_cdk::api::call::call_raw(
            xrc_canister_id,
            "get_exchange_rate",
            &candid::encode_args((request,)).unwrap(),
            10000000000, // payment fee
        )
        .await;

    match call_result {
        Ok(response_bytes) => match candid::decode_one::<XRCResponse>(&response_bytes) {
            Ok(response) => {
                println!("Decoded response: {:?}", response);
                match response {
                    XRCResponse::Ok(exchange_rate) => {
                        let divisor: u64 = 10_u64.pow(exchange_rate.metadata.decimals - 2);
                        let price_in_cents_es8 = exchange_rate.rate.checked_div(divisor).ok_or(
                            "Division failed in price_in_cents_es8. Please verify it's valid and non-zero"
                        )?;
                        LBRY_RATIO.with(|ratio| {
                            let mut ratio = ratio.borrow_mut();
                            ratio.ratio = price_in_cents_es8;
                            ratio.time = ic_cdk::api::time() / 1_000_000_000;
                        });
                        Ok(price_in_cents_es8)
                    }
                    XRCResponse::Err(err) => {
                        println!("Error in XRC response: {:?}", err);
                        Err("Error in XRC response".to_string())
                    }
                }
            }
            Err(e) => {
                println!("Decoding error: {:?}", e);
                Err("Error in decoding XRC response".to_string())
            }
        },
        Err((rejection_code, msg)) => {
            ic_cdk::println!("Call rejected: {:?}, {}", rejection_code, msg);
            Err("Error call rejected".to_string())
        }
    }
}

#[update]
pub async fn transfer_from_user_wallet(amount_icp: u64,destination: String) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller)?;
 
    transfer_icp_from_user(amount_icp,destination).await?;
    ic_cdk::println!("******************Icp sent !*************************");
    Ok("Transfered Successfully!".to_string())
    //  }).await
}


#[update]
async fn transfer_icp_from_user(amount: u64,destination: String) -> Result<BlockIndexIC, String> {
    let amount = Tokens::from_e8s(amount);
    let transfer_args: ic_ledger_types::TransferArgs = ic_ledger_types::TransferArgs {
        memo: Memo(0),
        amount,
        fee: Tokens::from_e8s(ICP_TRANSFER_FEE),
        from_subaccount: Some(principal_to_subaccount(&caller())),
        to: AccountIdentifier::new(&Principal::from_text(destination).expect("Could not decode the principal."), &DEFAULT_SUBACCOUNT),
        created_at_time: None,
    };

    ic_ledger_types::transfer(MAINNET_LEDGER_CANISTER_ID, transfer_args)
        .await
        .map_err(|e| format!("failed to call ledger: {:?}", e))?
        .map_err(|e: ic_ledger_types::TransferError| format!("ledger transfer error {:?}", e))
}