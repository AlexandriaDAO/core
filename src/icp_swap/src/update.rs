use candid::{CandidType, Nat, Principal};
use serde::Deserialize;
use std::cell::RefCell;

use crate::{get_current_LBRY_ratio, guard::*};
use crate::{get_user_archive_balance, utils::*};
use ic_cdk::{self, caller, update};
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
#[update(guard = "not_anon")]
pub async fn swap(amount_icp: u64) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let _guard: CallerGuard = CallerGuard::new(caller)?;

    if amount_icp < 10_000_000 {
        return Err("Minimum amount is 0.1 ICP".to_string());
    }
    deposit_icp_in_canister(amount_icp).await?;
    TOTAL_ICP_AVAILABLE.with(|balance: &RefCell<u64>| -> Result<(), String> {
        let mut total = balance.borrow_mut();
        *total = total
            .checked_add(amount_icp)
            .ok_or("Arithmetic underflow occurred in TOTAL_ICP_AVAILABLE")?;
        Ok(())
    })?;
    let icp_rate_in_cents: u64 = get_current_LBRY_ratio();
    let lbry_amount: u64 = amount_icp
        .checked_mul(icp_rate_in_cents)
        .ok_or("Arithmetic overflow occurred in lbry_amount.")?;
    match mint_LBRY(lbry_amount).await {
        Ok(block_index) => {
            // Mint was successful
            ic_cdk::println!("Successful, block index: {:?}", block_index);
        }
        Err(e) => {
            // If there was an error, log it in archive trx and return an error result
            ic_cdk::println!("Mint Lbry failed: {:?}", e);
            let amount_icp_after_fee = amount_icp
                .checked_sub(ICP_TRANSFER_FEE)
                .ok_or("Arithmetic underflow in amount_icp_after_fee.")?;
            archive_user_transaction(amount_icp_after_fee)?;
            return Err("Mint Lbry failed".to_string());
        }
    };

    Ok("Swapped Successfully!".to_string())
}


#[update(guard = "not_anon")]
pub async fn burn_LBRY(amount_lbry: u64) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller)?;

    if amount_lbry < 1 {
        return Err("Minimum 1 LBRY required!".to_string());
    }

    //Dynamic price
    let mut icp_rate_in_cents: u64 = get_current_LBRY_ratio();
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
    let total_icp_available: u64 =
        TOTAL_ICP_AVAILABLE.with(|icp: &RefCell<u64>| icp.borrow().clone());
    let total_archived_bal: u64 = TOTAL_ARCHIVED_BALANCE.with(|bal| bal.borrow().clone());

    let total_unclaimed_icp: u64 = TOTAL_UNCLAIMED_ICP_REWARD.with(|icp| icp.borrow().clone());

    let mut remaining_icp: u64 = total_icp_available
        .checked_sub(total_unclaimed_icp)
        .ok_or("Arithmetic underflow in remaining_icp.")?;
    remaining_icp = remaining_icp
        .checked_sub(total_archived_bal)
        .ok_or("Arithmetic overflow occured in remaining_icp.")?;

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

    match send_icp(caller, amount_icp_e8s).await {
        Ok(block_index) => {
            // Burn was successful
            ic_cdk::println!("Successful, block index: {:?}", block_index);
        }
        Err(e) => {
            ic_cdk::println!("Send icp failed: {:?}", e);
            let amount_icp_after_fee = amount_icp_e8s
                .checked_mul(2)
                .ok_or("Arithmetic overflow occurred in amount_icp_after_fee")?
                .checked_sub(ICP_TRANSFER_FEE)
                .ok_or("Arithmetic underflow in amount_icp_after_fee.")?;
            archive_user_transaction(amount_icp_after_fee)?;
            return Err("Send Icp failed, please check redeeem function".to_string());
        }
    }

    TOTAL_ICP_AVAILABLE.with(|balance: &RefCell<u64>| -> Result<(), String> {
        let mut total = balance.borrow_mut();
        *total = total
            .checked_sub(amount_icp_e8s)
            .ok_or("Arithmetic underflow occurred in TOTAL_ICP_AVAILABLE")?;
        Ok(())
    })?;
    // Alex mint 21M only
    let limit_result = within_max_limit(amount_lbry).await;
    if limit_result == true {
        match mint_ALEX(amount_lbry, caller).await {
            Ok(result) => {
                // Mint ALEX was successful
                ic_cdk::println!("Successful {}", result);
            }
            Err(e) => {
                ic_cdk::println!("Send icp failed: {:?}", e);
                let amount_icp_after_fee = amount_icp_e8s
                    .checked_sub(ICP_TRANSFER_FEE)
                    .ok_or("Arithmetic underflow in amount_icp_after_fee.")?;
                archive_user_transaction(amount_icp_after_fee)?;
                return Err("Mint ALEX failed, please check redeeem function".to_string());
            }
        }
    }

    Ok("Burn Successfully!".to_string())
}

async fn mint_LBRY(amount: u64) -> Result<BlockIndex, String> {
    let caller: Principal = caller();
    let amount = Nat::from(amount);

    let mut caller_subaccount_bytes = [0u8; 32];
    let caller_slice = caller.as_slice();
    caller_subaccount_bytes[..caller_slice.len()].copy_from_slice(caller_slice);

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

async fn deposit_icp_in_canister(amount: u64) -> Result<BlockIndex, String> {
    let canister_id = ic_cdk::api::id();
    let caller = ic_cdk::caller();

    let transfer_args = TransferFromArgs {
        from: Account {
            owner: caller,
            subaccount: None,
        },
        to: Account {
            owner: canister_id,
            subaccount: None,
        },
        amount: amount.into(),
        fee: Some(Nat::from(ICP_TRANSFER_FEE)),
        memo: None,
        created_at_time: None,
        spender_subaccount: None,
    };

    ic_cdk::call::<(TransferFromArgs,), (Result<BlockIndex, TransferFromError>,)>(
        MAINNET_LEDGER_CANISTER_ID,
        "icrc2_transfer_from",
        (transfer_args,),
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    .0
    .map_err(|e: TransferFromError| format!("ledger transfer error {:?}", e))
}

async fn send_icp(destination: Principal, amount: u64) -> Result<BlockIndexIC, String> {
    let amount = Tokens::from_e8s(amount);
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
async fn burn_token(amount: u64) -> Result<BlockIndex, String> {
    let canister_id: Principal = ic_cdk::api::id();

    let big_int_amount: BigUint = BigUint::from(amount);
    let amount: Nat = Nat(big_int_amount);

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
async fn deposit_token(amount: u64) -> Result<BlockIndex, String> {
    let caller: Principal = caller();
    let canister_id: Principal = ic_cdk::api::id();

    let mut caller_subaccount_bytes = [0u8; 32];
    let caller_slice = caller.as_slice();
    caller_subaccount_bytes[..caller_slice.len()].copy_from_slice(caller_slice);

    let amount: Nat = Nat::from(amount);
    if amount < Nat::from(0 as u8) {
        return Err("Amount is less than zero".to_string());
    }
    let transfer_from_args: TransferFromArgs = TransferFromArgs {
        from: Account::from(ic_cdk::caller()),
        memo: None,
        amount,
        spender_subaccount: None,
        fee: Some(Nat::from(ALEX_TRANSFER_FEE)),
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

#[update(guard = "not_anon")]
async fn stake_ALEX(amount: u64) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller)?;
    if amount < 100_000_000 {
        return Err("Minimum 1 Alex is required ".to_string());
    }
    let post_fee_amount = amount
        .checked_sub(ALEX_TRANSFER_FEE)
        .ok_or("Arithmetic underflow occurred in post_fee_amount")?;
    // Proceed with transfer
    deposit_token(post_fee_amount).await?;
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
                .checked_add(post_fee_amount)
                .ok_or("Arithmetic Overflow occurred in current_stake.amount")?;
            current_stake.time = ic_cdk::api::time();
            Ok(())
        });
    TOTAL_ALEX_STAKED.with(|total_staked| -> Result<(), String> {
        let mut total_staked = total_staked.borrow_mut();
        *total_staked = total_staked
            .checked_add(post_fee_amount)
            .ok_or("Arithmetic Overflow occurred in TOTAL_ALEX_STAKED.")?;
        Ok(())
    })?;
    Ok("Staked Successfully!".to_string())
}
async fn withdraw_token(amount: u64) -> Result<BlockIndex, String> {
    let caller: Principal = caller();
    let canister_id: Principal = ic_cdk::api::id();

    let mut caller_subaccount_bytes = [0u8; 32];
    let caller_slice = caller.as_slice();
    caller_subaccount_bytes[..caller_slice.len()].copy_from_slice(caller_slice);
    let amount: Nat = Nat::from(amount);
    if amount < Nat::from(0 as u8) {
        return Err("Amount is less than zero".to_string());
    }
    let transfer_from_args: TransferFromArgs = TransferFromArgs {
        from: canister_id.into(),
        memo: None,
        amount,
        spender_subaccount: None,
        fee: Some(Nat::from(ALEX_TRANSFER_FEE)),
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

#[update(guard = "not_anon")]
async fn un_stake_all_ALEX() -> Result<String, String> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller)?;
    let staked_amount = get_caller_stake_balance();
    // verify caller balance > 0
    if staked_amount <= 0 {
        return Err("Insufficent funds".to_string());
    }
    // Proceed with transfer.
    let post_fee_amount = staked_amount
        .checked_sub(ALEX_TRANSFER_FEE)
        .ok_or("Stake amount too low!")?;

    withdraw_token(post_fee_amount).await?;
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
        let mut total_staked = total_staked.borrow_mut();
        *total_staked = total_staked
            .checked_sub(staked_amount)
            .ok_or("Arithmetic underflow occurred in TOTAL_ALEX_STAKED")?;
        Ok(())
    })?;
    Ok("UnStaked Successfully!".to_string())
}

//Guard ensure call is only by canister.
#[update(guard = "is_canister")]
pub fn distribute_reward() -> Result<String, String> {
    let intervals = DISTRIBUTION_INTERVALS.with(|intervals| intervals.borrow().clone());

    let staking_percentage = STAKING_REWARD_PERCENTAGE;
    let total_icp_available: u64 =
        TOTAL_ICP_AVAILABLE.with(|icp: &RefCell<u64>| icp.borrow().clone());

    let total_unclaimed_icp_reward: u64 = TOTAL_UNCLAIMED_ICP_REWARD.with(|icp| icp.borrow().clone());
    let total_archived_bal: u64 = TOTAL_ARCHIVED_BALANCE.with(|bal: &RefCell<u64>| bal.borrow().clone());

    let unclaimed_icps: u64 =total_unclaimed_icp_reward
        .checked_add(total_archived_bal)
        .ok_or("Arithmetic underflow occured in remaining_icp.")?;

    if total_icp_available == 0 || total_icp_available < unclaimed_icps {
        return Err("Insufficient ICP balance for reward distribution".to_string());
    }
    let mut total_icp_allocated: u128 = total_icp_available
        .checked_sub((unclaimed_icps  as u128).try_into().unwrap())
        .ok_or("Arithmetic underflow occurred in total_icp_available.")?
        .into();
    total_icp_allocated = total_icp_allocated
        .checked_mul(staking_percentage as u128)
        .ok_or("Arithmetic overflow occurred in total_icp_allocated.")?;
    total_icp_allocated = total_icp_allocated.checked_div(10000).ok_or(
        "Division failed in ICP allocation. Please verify the amount is valid and non-zero",
    )?;
    if total_icp_allocated < 1000_000_000 {
        return Err("Cannot distribute reward allocated Icp balance less than 10".to_string());
    }
    let total_staked_alex = TOTAL_ALEX_STAKED.with(|staked| staked.borrow().clone()) as u128;
    if total_staked_alex == 0 {
        return Err("No ALEX staked, cannot distribute rewards".to_string());
    }
    let mut icp_reward_per_alex = total_icp_allocated.checked_mul(SCALING_FACTOR).ok_or("Arithmetic overflow occured in icp_reward_per_alex.")?
        .checked_div(total_staked_alex)
        .ok_or("Division failed in icp_reward_per_alex. Please verify it's valid and non-zero")?;

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

    APY.with(|values| {
        values.borrow_mut().values.insert(intervals%MAX_DAYS, icp_reward_per_alex);
    });

    TOTAL_UNCLAIMED_ICP_REWARD.with(|icp| -> Result<(), String> {
        let mut icp = icp.borrow_mut();
        *icp = icp
            .checked_add(total_icp_reward as u64)
            .ok_or("Arithmetic overflow occurred in TOTAL_UNCLAIMED_ICP_REWARD.")?;
        Ok(())
    })?;

    DISTRIBUTION_INTERVALS.with(|intervals| -> Result<(), String> {
        let mut intervals = intervals.borrow_mut();
        *intervals = intervals
            .checked_add(1 as u32)
            .ok_or("Arithmetic overflow occurred in DISTRIBUTION_INTERVALS.")?;
        Ok(())
    })?;

    Ok("Success".to_string())
}

#[update(guard = "not_anon")]
async fn claim_icp_reward() -> Result<String, String> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller)?;
    let caller_stake_reward: Option<Stake> = get_stake(caller);
    match caller_stake_reward {
        Some(stake) => {
            if stake.reward_icp <= 1000_000 {
                return Err("Insufficient rewards".to_string());
            }
            let total_icp_available: u64 =
                TOTAL_ICP_AVAILABLE.with(|icp: &RefCell<u64>| icp.borrow().clone());

            if stake.reward_icp > total_icp_available {
                return Err("Insufficient ICP Balance in canister".to_string());
            }
            send_icp(caller, stake.reward_icp).await?;
            TOTAL_UNCLAIMED_ICP_REWARD.with(|icp| -> Result<(), String> {
                let mut icp = icp.borrow_mut();
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
            TOTAL_ICP_AVAILABLE.with(|balance: &RefCell<u64>| -> Result<(), String> {
                let mut total = balance.borrow_mut();
                *total = total
                    .checked_sub(stake.reward_icp)
                    .ok_or("Arithmetic underflow occurred in TOTAL_ICP_AVAILABLE")?;
                Ok(())
            })?;
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

    let xrc_canister_id = Principal::from_text(XRC_CANISTER_ID).unwrap();

    let call_result: Result<Vec<u8>, (ic_cdk::api::call::RejectionCode, String)> =
        ic_cdk::api::call::call_raw(
            xrc_canister_id,
            "get_exchange_rate",
            &candid::encode_args((request,)).unwrap(),
            BURN_CYCLE_FEE, // payment fee
        )
        .await;

    match call_result {
        Ok(response_bytes) => match candid::decode_one::<XRCResponse>(&response_bytes) {
            Ok(response) => {
                println!("Decoded response: {:?}", response);
                match response {
                    XRCResponse::Ok(exchange_rate) => {
                        let divisor: u64 =
                            10_u64.pow(exchange_rate.metadata.decimals.checked_sub(2).ok_or(
                                "Arithmetic underflow in exchange_rate.metadata.decimals",
                            )?);
                        let price_in_cents_es8 = exchange_rate.rate.checked_div(divisor).ok_or(
                            "Division failed in price_in_cents_es8. Please verify it's valid and non-zero"
                        )?;

                        // Update the closure to handle potential errors
                        LBRY_RATIO.with(|ratio| -> Result<(), String> {
                            let mut ratio = ratio.borrow_mut();
                            ratio.ratio = price_in_cents_es8;
                            ratio.time = ic_cdk::api::time().checked_div(1_000_000_000)
                                .ok_or("Division failed in ratio.time. Please verify the amount is valid and non-zero")?;
                            Ok(())
                        }).map_err(|e| e.to_string())?; // Propagate any error from the closure

                        Ok(price_in_cents_es8)
                    }
                    XRCResponse::Err(err) => {
                        println!("Error in XRC response: {:?}", err);
                        Err("Error in XRC response".to_string())
                    }
                }
            }
            Err(_e) => {
                // println!("Decoding error: {:?}", e);
                Err("Error in decoding XRC response".to_string())
            }
        },
        Err((_rejection_code, _msg)) => {
            // ic_cdk::println!("Call rejected: {:?}, {}", rejection_code, msg);
            Err("Error call rejected".to_string())
        }
    }
}
fn archive_user_transaction(amount: u64) -> Result<String, String> {
    ARCHIVED_TRANSACTION_LOG.with(|trxs: &RefCell<Trxs>| -> Result<(), String> {
        let mut trxs = trxs.borrow_mut();
        let user_archive = trxs
            .archive_trx
            .entry(caller())
            .or_insert(ArchiveBalance { icp: 0 });
        user_archive.icp = user_archive
            .icp
            .checked_add(amount)
            .ok_or("Arithmetic overflow occurred in user_trx")?;
        Ok(())
    })?;
    TOTAL_ARCHIVED_BALANCE.with(|balance: &RefCell<u64>| -> Result<(), String> {
        let mut total = balance.borrow_mut();
        *total = total
            .checked_add(amount)
            .ok_or("Arithmetic overflow occurred in TOTAL_ARCHIVED_BALANCE")?;
        Ok(())
    })?;
    // TOTAL_ARCHIVED_BALANCE.with(|balance| *balance.borrow_mut().checked_add(amount).ok_or("Somet")? amount);
    Ok("Transaction added successfully!".to_string())
}

#[update(guard = "not_anon")]
async fn redeem() -> Result<String, String> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller)?;
    let caller_archive_profile: Option<ArchiveBalance> = get_user_archive_balance(caller);
    match caller_archive_profile {
        Some(trx) => {
            if trx.icp <= 0 {
                return Err("Insufficient Balance".to_string());
            }
            let total_icp_available: u64 =
                TOTAL_ICP_AVAILABLE.with(|icp: &RefCell<u64>| icp.borrow().clone());

            if trx.icp > total_icp_available {
                return Err("Insufficient ICP Balance in canister".to_string());
            }
            send_icp(caller, trx.icp).await?;
            TOTAL_ARCHIVED_BALANCE.with(|balance: &RefCell<u64>| -> Result<(), String> {
                let mut total = balance.borrow_mut();
                *total = total
                    .checked_sub(trx.icp)
                    .ok_or("Arithmetic underflow occurred in TOTAL_ARCHIVED_BALANCE")?;
                Ok(())
            })?;
            TOTAL_ICP_AVAILABLE.with(|balance: &RefCell<u64>| -> Result<(), String> {
                let mut total = balance.borrow_mut();
                *total = total
                    .checked_sub(trx.icp)
                    .ok_or("Arithmetic underflow occurred in TOTAL_ICP_AVAILABLE")?;
                Ok(())
            })?;
            // make  balance to 0
            ARCHIVED_TRANSACTION_LOG.with(|trx: &RefCell<Trxs>| {
                let mut trx = trx.borrow_mut();
                let user_archive = trx
                    .archive_trx
                    .entry(caller)
                    .or_insert(ArchiveBalance { icp: 0 });
                user_archive.icp = 0;
            });

            Ok("Success".to_string())
        }
        None => {
            return Err("No record found !".to_string());
        }
    }
}