use crate::{
    get_current_LBRY_ratio,
    get_distribution_interval,
    get_total_archived_balance,
    get_total_unclaimed_icp_reward,
    guard::*,
    ExecutionError,
    DEFAULT_ADDITION_OVERFLOW_ERROR,
    DEFAULT_BURN_FAILED_ERROR,
    DEFAULT_DIVISION_ERROR,
    DEFAULT_INSUFFICIENT_BALANCE_ERROR,
    DEFAULT_INSUFFICIENT_BALANCE_REWARD_DISTRIBUTION_ERROR,
    DEFAULT_INSUFFICIENT_CANISTER_BALANCE_ERROR,
    DEFAULT_INVALID_AMOUNT_ERROR,
    DEFAULT_MINIMUM_REQUIRED_ERROR,
    DEFAULT_MINT_FAILED,
    DEFAULT_MULTIPLICATION_OVERFLOW_ERROR,
    DEFAULT_TRANSFER_FAILED_ERROR,
    DEFAULT_UNDERFLOW_ERROR,
};
use crate::{ get_stake, storage::* };
use crate::{ get_user_archive_balance, utils::* };
use candid::{ CandidType, Nat, Principal };
use ic_cdk::{ self, caller, update };
use ic_ledger_types::{
    AccountIdentifier,
    BlockIndex as BlockIndexIC,
    Memo,
    Subaccount,
    Tokens,
    DEFAULT_SUBACCOUNT,
    MAINNET_LEDGER_CANISTER_ID,
};
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{ BlockIndex, TransferArg, TransferError };
use icrc_ledger_types::icrc2::transfer_from::{ TransferFromArgs, TransferFromError };
use num_bigint::BigUint;
use serde::Deserialize;

#[warn(non_snake_case)]
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
pub async fn swap(
    amount_icp: u64,
    from_subaccount: Option<[u8; 32]>
) -> Result<String, ExecutionError> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller).map_err(|e| ExecutionError::Unauthorized(e.to_string()))?;
    register_info_log(caller, "swap", &format!("Swap initiated: {}  ICP (e8s)", amount_icp));
    if amount_icp < 10_000_000 {
        return Err(
            ExecutionError::new_with_log(caller, "swap", ExecutionError::MinimumRequired {
                required: 10_000_000,
                provided: amount_icp,
                token: "ICP".to_string(),
                details: DEFAULT_MINIMUM_REQUIRED_ERROR.to_string(),
            })
        );
    }

    deposit_icp_in_canister(amount_icp, from_subaccount).await.map_err(|e| 
        ExecutionError::new_with_log(caller, "swap", ExecutionError::TransferFailed {
            source: caller.to_string(),
            dest: "canister".to_string(),
            token: "ICP".to_string(),
            amount: amount_icp,
            details: e.to_string(),
            reason: DEFAULT_TRANSFER_FAILED_ERROR.to_string(),
        })
    )?;
    register_info_log(
        caller,
        "swap",
        &format!("Successfully deposited {} ICP (e8s) into canister", amount_icp)
    );
    let icp_rate_in_cents: u64 = get_current_LBRY_ratio();
    // checke here if return
    let lbry_amount: u64 = amount_icp.checked_mul(icp_rate_in_cents).ok_or_else(|| 
        ExecutionError::new_with_log(caller, "swap", ExecutionError::MultiplicationOverflow {
            operation: DEFAULT_MULTIPLICATION_OVERFLOW_ERROR.to_string(),
            details: format!(
                "amount_icp: {} with icp_rate_in_cents: {}",
                amount_icp,
                icp_rate_in_cents
            ),
        })
    )?;

    match mint_LBRY(lbry_amount).await {
        Ok(_) => {
            register_info_log(
                caller,
                "swap",
                &format!(
                    "Successfully swapped {} ICP (e8s) for {} LBRY (e8s) tokens",
                    amount_icp,
                    lbry_amount
                )
            );
        }
        Err(e) => {
            // If there was an error, log it in archive trx and return an error result
            let amount_icp_after_fee = amount_icp.checked_sub(ICP_TRANSFER_FEE).ok_or_else(||
                ExecutionError::new_with_log(caller, "swap", ExecutionError::Underflow {
                    operation: DEFAULT_UNDERFLOW_ERROR.to_string(),
                    details: format!(
                        "amount_icp: {} with ICP_TRANSFER_FEE: {}",
                        amount_icp,
                        ICP_TRANSFER_FEE
                    ),
                })
            )?;

            archive_user_transaction(amount_icp_after_fee)?;

            return Err(
                ExecutionError::new_with_log(caller, "swap", ExecutionError::MintFailed {
                    token: "LBRY".to_string(),
                    amount: lbry_amount,
                    reason: "LBRY ".to_string() + DEFAULT_MINT_FAILED,
                    details: e.to_string(),
                })
            );
        }
    }

    Ok("Swapped Successfully!".to_string())
}

#[allow(non_snake_case)]
#[update(guard = "not_anon")]
pub async fn burn_LBRY(
    amount_lbry: u64,
    from_subaccount: Option<[u8; 32]>
) -> Result<String, ExecutionError> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller).map_err(|e| ExecutionError::Unauthorized(e.to_string()))?;
    register_info_log(
        caller,
        "burn_LBRY",
        &format!("burn_LBRY initiated: {} LBRY ", amount_lbry)
    );

    if amount_lbry < 1 {
        return Err(
            ExecutionError::new_with_log(caller, "burn_LBRY", ExecutionError::MinimumRequired {
                required: 1,
                provided: amount_lbry,
                token: "LBRY".to_string(),
                details: DEFAULT_MINIMUM_REQUIRED_ERROR.to_string(),
            })
        );
    }

    //Dynamic price
    let mut icp_rate_in_cents: u64 = get_current_LBRY_ratio();
    let mut amount_icp_e8s = amount_lbry.checked_mul(100_000_000).ok_or_else(|| {
        ExecutionError::new_with_log(caller, "burn_LBRY", ExecutionError::MultiplicationOverflow {
            operation: DEFAULT_MULTIPLICATION_OVERFLOW_ERROR.to_string(),
            details: format!("amount_lbry: {} with : {}", amount_lbry, 100_000_000),
        })
    })?;
    icp_rate_in_cents = icp_rate_in_cents.checked_mul(2).ok_or_else(||
        ExecutionError::new_with_log(caller, "burn_LBRY", ExecutionError::MultiplicationOverflow {
            operation: DEFAULT_MULTIPLICATION_OVERFLOW_ERROR.to_string(),
            details: format!("icp_rate_in_cents: {} with  {}", amount_lbry, 2),
        })
    )?;
    amount_icp_e8s = amount_icp_e8s.checked_div(icp_rate_in_cents).ok_or_else(||
        ExecutionError::new_with_log(caller, "burn_LBRY", ExecutionError::DivisionFailed {
            operation: DEFAULT_DIVISION_ERROR.to_string(),
            details: format!(
                "amount_icp_e8s: {} with icp_rate_in_cents: {}",
                amount_icp_e8s,
                icp_rate_in_cents
            ),
        })
    )?;

    if amount_icp_e8s == 0 {
        return Err(
            ExecutionError::new_with_log(caller, "burn_LBRY", ExecutionError::InvalidAmount {
                amount: amount_icp_e8s,
                reason: DEFAULT_INVALID_AMOUNT_ERROR.to_string(),
                details: format!("Calculated ICP amount:{} too small", amount_icp_e8s),
            })
        );
    }

    let mut total_icp_available: u64 = 0;
    match fetch_canister_icp_balance().await {
        Ok(bal) => {
            total_icp_available = bal;
        }
        Err(e) => {
            return Err(e);
        }
    }
    let total_archived_bal: u64 = get_total_archived_balance();

    let total_unclaimed_icp: u64 = get_total_unclaimed_icp_reward();

    let mut remaining_icp: u64 = total_icp_available.checked_sub(total_unclaimed_icp).ok_or_else(||
        ExecutionError::new_with_log(caller, "burn_LBRY", ExecutionError::Underflow {
            operation: DEFAULT_UNDERFLOW_ERROR.to_string(),
            details: format!(
                "total_icp_available: {} with total_unclaimed_icp: {}",
                total_icp_available,
                total_unclaimed_icp
            ),
        })
    )?;
    remaining_icp = remaining_icp.checked_sub(total_archived_bal).ok_or_else(||
        ExecutionError::new_with_log(caller, "burn_LBRY", ExecutionError::Underflow {
            operation: DEFAULT_UNDERFLOW_ERROR.to_string(),
            details: format!(
                "remaining_icp: {} with total_archived_bal: {}",
                remaining_icp,
                total_archived_bal
            ),
        })
    )?;

    // For burns, we only need to ensure we have enough ICP to pay out
    // No need to reserve 50% since burning increases our ICP reserves
    if amount_icp_e8s > remaining_icp {
        return Err(
            ExecutionError::new_with_log(
                caller,
                "burn_LBRY",
                ExecutionError::InsufficientCanisterBalance {
                    required: amount_icp_e8s,
                    available: remaining_icp,
                    details: DEFAULT_INSUFFICIENT_CANISTER_BALANCE_ERROR.to_string(),
                }
            )
        );
    }

    let amount_lbry_e8s = amount_lbry
        .checked_mul(100_000_000) //todo
        .ok_or_else(||
            ExecutionError::new_with_log(
                caller,
                "burn_LBRY",
                ExecutionError::MultiplicationOverflow {
                    operation: DEFAULT_MULTIPLICATION_OVERFLOW_ERROR.to_string(),
                    details: format!("amount_lbry: {} with {}", amount_lbry, 100_000_000),
                }
            )
        )?;

    burn_token(amount_lbry_e8s, from_subaccount).await.map_err(|e|
        ExecutionError::new_with_log(caller, "burn_LBRY", ExecutionError::BurnFailed {
            token: "LBRY".to_string(),
            amount: amount_lbry,
            details: e.to_string(),
            reason: DEFAULT_BURN_FAILED_ERROR.to_string(),
        })
    )?;
    register_info_log(
        caller,
        "burn_LBRY",
        &format!(
            "Successfully burned {} LBRY tokens ({} e8s). Preparing to send {} ICP (e8s).",
            amount_lbry,
            amount_lbry_e8s,
            amount_icp_e8s
        )
    );
    // Is this the problem since from_subaccount is alice/bob/etc.?
    match send_icp(caller, amount_icp_e8s, None).await {
        Ok(_) => {
            register_info_log(
                caller,
                "burn_LBRY",
                &format!("Successfully sent {} ICP (e8s) to {}", amount_icp_e8s, caller)
            );
        }
        Err(e) => {
            let amount_icp_after_fee = amount_icp_e8s
                .checked_mul(2)
                .ok_or_else(||
                    ExecutionError::new_with_log(
                        caller,
                        "burn_LBRY",
                        ExecutionError::MultiplicationOverflow {
                            operation: DEFAULT_MULTIPLICATION_OVERFLOW_ERROR.to_string(),
                            details: format!("amount_icp_e8s: {} with {}", amount_icp_e8s, 2),
                        }
                    )
                )?
                .checked_sub(ICP_TRANSFER_FEE)
                .ok_or_else(||
                    ExecutionError::new_with_log(caller, "burn_LBRY", ExecutionError::Underflow {
                        operation: DEFAULT_UNDERFLOW_ERROR.to_string(),
                        details: format!(
                            "amount_icp_e8s: {} with ICP_TRANSFER_FEE: {}",
                            amount_icp_e8s,
                            ICP_TRANSFER_FEE
                        ),
                    })
                )?;

            archive_user_transaction(amount_icp_after_fee)?;
            return Err(
                ExecutionError::new_with_log(caller, "burn_LBRY", ExecutionError::TransferFailed {
                    source: "canister".to_string(),
                    dest: caller.to_string(),
                    token: "ICP".to_string(),
                    amount: amount_icp_e8s,
                    details: e,
                    reason: DEFAULT_TRANSFER_FAILED_ERROR.to_string(),
                })
            );
        }
    }

    // No LBRY burn limit - the 21M ALEX cap is still enforced in the mint_ALEX function (reason described in commented out utils.rs function)
    // Original code checked against LBRY thresholds:
    // let limit_result = within_max_limit(amount_lbry).await.map_err(|e|
    //     ExecutionError::new_with_log(
    //         caller,
    //         "burn_LBRY",
    //         ExecutionError::StateError(format!("Failed to check max limit: {}", e))
    //     )
    // )?;

    // if limit_result > 0 {
        match mint_ALEX(amount_lbry, caller, from_subaccount).await {
            Ok(_) => {
                register_info_log(
                    caller,
                    "burn_LBRY",
                    &format!("Burn completed successfully.Minted ALEX tokens to {}", caller)
                );
            }
            Err(e) => {
                let amount_icp_after_fee = amount_icp_e8s
                    .checked_sub(ICP_TRANSFER_FEE)
                    .ok_or_else(||
                        ExecutionError::new_with_log(
                            caller,
                            "burn_LBRY",
                            ExecutionError::Underflow {
                                operation: DEFAULT_UNDERFLOW_ERROR.to_string(),
                                details: format!(
                                    "amount_icp_e8s: {} with ICP_TRANSFER_FEE: {}",
                                    amount_icp_e8s,
                                    ICP_TRANSFER_FEE
                                ),
                            }
                        )
                    )?;

                archive_user_transaction(amount_icp_after_fee)?;
                return Err(
                    ExecutionError::new_with_log(caller, "burn_LBRY", ExecutionError::MintFailed {
                        token: "ALEX".to_string(),
                        amount: amount_lbry,
                        details: e,
                        reason: DEFAULT_MINT_FAILED.to_string(),
                    })
                );
            }
        }
    // } 
    // // else {
    // //     // ALEX fully minted
    // //     register_info_log(
    // //         caller,
    //         "burn_LBRY",
    //         &format!("Burn completed successfully. No more ALEX tokens can be minted.")
    //     );
    // }

    Ok("Burn Successfully!".to_string())
}

#[allow(non_snake_case)]
async fn mint_LBRY(amount: u64) -> Result<BlockIndex, TransferError> {
    let caller: Principal = caller();
    let amount = Nat::from(amount);

    let transfer_args: TransferArg = TransferArg {
        // can be used to distinguish between transactions
        // the amount we want to transfer
        amount,
        // we want to transfer tokens from the default subaccount of the canister
        from_subaccount: None,
        // if not specified, the default fee for the canister is used
        fee: None,
        // the account we want to transfer tokens to
        to: Account {
            owner: caller,
            subaccount: None,
        },
        // a timestamp indicating when the transaction was created by the caller; if it is not specified by the caller then this is set to the current ICP time
        created_at_time: None,
        memo: None,
    };

    // 1. Asynchronously call another canister function using `ic_cdk::call`.
    let result = ic_cdk
        ::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
            // 2. Convert a textual representation of a Principal into an actual `Principal` object. The principal is the one we specified in `dfx.json`.
            //    `expect` will panic if the conversion fails, ensuring the code does not proceed with an invalid principal.
            Principal::from_text(LBRY_CANISTER_ID).expect("Could not decode the principal."),
            // 3. Specify the method name on the target canister to be called, in this case, "icrc1_transfer".
            "icrc1_transfer",
            // 4. Provide the arguments for the call in a tuple, here `transfer_args` is encapsulated as a single-element tuple.
            (transfer_args,)
        ).await
        .map_err(|_| TransferError::GenericError {
            message: "Call failed".to_string(),
            error_code: Nat::from(0 as u32),
        })?;
    result.0
}

async fn deposit_icp_in_canister(
    amount: u64,
    from_subaccount: Option<[u8; 32]>
) -> Result<BlockIndex, TransferFromError> {
    let canister_id = ic_cdk::api::id();
    let caller = ic_cdk::caller();

    let transfer_args = TransferFromArgs {
        from: Account {
            owner: caller,
            subaccount: from_subaccount,
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

    let (result,): (Result<BlockIndex, TransferFromError>,) = ic_cdk
        ::call(MAINNET_LEDGER_CANISTER_ID, "icrc2_transfer_from", (transfer_args,)).await
        .map_err(|_| TransferFromError::GenericError {
            message: "Call failed".to_string(),
            error_code: Nat::from(0 as u32),
        })?;

    result // Return the inner Result<BlockIndex, TransferFromError>
}

async fn send_icp(
    destination: Principal,
    amount: u64,
    from_subaccount: Option<[u8; 32]>
) -> Result<BlockIndexIC, String> {
    let amount = Tokens::from_e8s(amount);
    let from_subaccount = from_subaccount.map(Subaccount);

    let transfer_args: ic_ledger_types::TransferArgs = ic_ledger_types::TransferArgs {
        memo: Memo(0),
        amount,
        fee: Tokens::from_e8s(ICP_TRANSFER_FEE),
        from_subaccount,
        to: AccountIdentifier::new(&destination, &from_subaccount.unwrap_or(DEFAULT_SUBACCOUNT)),
        created_at_time: None,
    };
    ic_ledger_types
        ::transfer(MAINNET_LEDGER_CANISTER_ID, transfer_args).await
        .map_err(|e| format!("failed to call ledger: {:?}", e))?
        .map_err(|e: ic_ledger_types::TransferError| format!("ledger transfer error {:?}", e))
}

#[allow(non_snake_case)]
async fn mint_ALEX(
    lbry_amount: u64,
    caller: Principal,
    to_subaccount: Option<[u8; 32]>
) -> Result<String, String> {
    // 1. Asynchronously call another canister function using `ic_cdk::call`.
    let result: Result<(Result<String, String>,), String> = ic_cdk
        ::call::<(u64, Principal, Option<[u8; 32]>), (Result<String, String>,)>(
            Principal::from_text(TOKENOMICS_CANISTER_ID).expect("Could not decode the principal."),
            "mint_ALEX",
            (lbry_amount, caller, to_subaccount)
        ).await
        .map_err(|e| format!("failed to call ledger: {:?}", e));

    match result {
        Ok((ledger_result,)) =>
            match ledger_result {
                Ok(success_msg) => Ok(success_msg),
                Err(err_msg) => Err(format!("ledger transfer error: {}", err_msg)),
            }
        Err(err) => Err(err),
    }
}
//stake //
#[allow(non_snake_case)]
#[update(guard = "not_anon")]
async fn stake_ALEX(
    amount: u64,
    from_subaccount: Option<[u8; 32]>
) -> Result<String, ExecutionError> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller).map_err(|e| ExecutionError::Unauthorized(e.to_string()))?;
    register_info_log(caller, "stake_ALEX", &format!("Staking initiated: {} ALEX", amount));
    let mut alex_fee = ALEX_FEE.with(|fee| *fee.borrow());
    if amount < 100_000_000 {
        return Err(
            ExecutionError::new_with_log(caller, "stake_ALEX", ExecutionError::MinimumRequired {
                required: 100_000_000,
                provided: amount,
                token: "ALEX".to_string(),
                details: DEFAULT_MINIMUM_REQUIRED_ERROR.to_string(),
            })
        );
    }

    if alex_fee == 0 {
        let fee: u64 = get_alex_fee().await?;
        update_ALEX_fee(fee)?;
        alex_fee = fee;
    }

    let post_fee_amount = amount.checked_sub(alex_fee).ok_or_else(||
        ExecutionError::new_with_log(caller, "stake_ALEX", ExecutionError::Underflow {
            operation: DEFAULT_UNDERFLOW_ERROR.to_string(),
            details: format!("amount: {} with alex_fee: {}", amount, alex_fee),
        })
    )?;
    // Proceed with transfer
    deposit_token(post_fee_amount, from_subaccount).await.map_err(|e|
        ExecutionError::new_with_log(caller, "stake_ALEX", ExecutionError::TransferFailed {
            source: caller.to_string(),
            dest: "canister".to_string(),
            token: "ALEX".to_string(),
            amount: post_fee_amount,
            details: e.to_string(),
            reason: DEFAULT_TRANSFER_FAILED_ERROR.to_string(),
        })
    )?;
    register_info_log(
        caller,
        "stake_ALEX",
        &format!("Successfully transferred {} ALEX (e8s) to canister", post_fee_amount)
    );
    let current_time = ic_cdk::api::time();
    STAKES.with(
        |stakes| -> Result<(), ExecutionError> {
            let mut stakes_map = stakes.borrow_mut();

            let updated_stake = match stakes_map.get(&caller) {
                Some(existing_stake) => {
                    let mut updated = existing_stake.clone();
                    updated.amount = updated.amount.checked_add(post_fee_amount).ok_or_else(||
                        ExecutionError::new_with_log(
                            caller,
                            "stake_ALEX",
                            ExecutionError::AdditionOverflow {
                                operation: DEFAULT_ADDITION_OVERFLOW_ERROR.to_string(),
                                details: format!(
                                    "updated.amount: {} with post_fee_amount: {}",
                                    updated.amount,
                                    post_fee_amount
                                ),
                            }
                        )
                    )?;
                    updated.time = current_time;

                    register_info_log(
                        caller,
                        "stake_ALEX",
                        &format!(
                            "Successfully staked {} ALEX. Total staked: {} ALEX.",
                            post_fee_amount,
                            updated.amount
                        )
                    );
                    updated
                }
                None =>
                    Stake {
                        amount: post_fee_amount,
                        time: current_time,
                        reward_icp: 0,
                    },
            };

            stakes_map.insert(caller, updated_stake);
            Ok(())
        }
    )?;

    Ok("Staked Successfully!".to_string())
}

#[allow(non_snake_case)]
#[update(guard = "not_anon")]
async fn un_stake_all_ALEX(from_subaccount: Option<[u8; 32]>) -> Result<String, ExecutionError> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller).map_err(|e| ExecutionError::Unauthorized(e.to_string()))?;
    register_info_log(caller, "un_stake_all_ALEX", "Unstaking initiated.");
    let mut alex_fee = ALEX_FEE.with(|fee| *fee.borrow());

    let current_stake = STAKES.with(|stakes| {
        let stakes_map = stakes.borrow();
        stakes_map.get(&caller)
    }).ok_or_else(||
        ExecutionError::new_with_log(
            caller,
            "un_stake_all_ALEX",
            ExecutionError::StateError("No stake found for caller".to_string())
        )
    )?;

    if alex_fee == 0 {
        let fee: u64 = get_alex_fee().await?;
        update_ALEX_fee(fee)?;
        alex_fee = fee;
    }

    let staked_amount = current_stake.amount;

    // Verify caller balance
    if staked_amount <= alex_fee {
        // AUDIT comaparing with alex fee to ensure smooth operations
        return Err(
            ExecutionError::new_with_log(
                caller,
                "un_stake_all_ALEX",
                ExecutionError::InsufficientBalance {
                    required: alex_fee, //Minimum amount
                    available: staked_amount,
                    details: DEFAULT_INSUFFICIENT_CANISTER_BALANCE_ERROR.to_string(),
                    token: "ALEX".to_string(),
                }
            )
        );
    }

    let post_fee_amount: u64 = staked_amount.checked_sub(alex_fee).ok_or_else(||
        ExecutionError::new_with_log(caller, "un_stake_all_ALEX", ExecutionError::Underflow {
            operation: DEFAULT_UNDERFLOW_ERROR.to_string(),
            details: format!("staked_amount: {} with alex_fee: {}", staked_amount, alex_fee),
        })
    )?;

    // Withdraw the token
    withdraw_token(post_fee_amount, from_subaccount).await.map_err(|e|
        ExecutionError::new_with_log(caller, "un_stake_all_ALEX", ExecutionError::TransferFailed {
            source: "Canister".to_string(),
            dest: caller.to_string(),
            token: "ALEX".to_string(),
            amount: post_fee_amount,
            reason: DEFAULT_TRANSFER_FAILED_ERROR.to_string(),
            details: e.to_string(),
        })
    )?;
    register_info_log(
        caller,
        "un_stake_all_ALEX",
        &format!("Successfully withdrawn {} ALEX to {}.", post_fee_amount, caller)
    );

    // Update the stake amount
    let new_amount = current_stake.amount.checked_sub(staked_amount).ok_or_else(||
        ExecutionError::new_with_log(caller, "un_stake_all_ALEX", ExecutionError::Underflow {
            operation: DEFAULT_UNDERFLOW_ERROR.to_string(),
            details: format!(
                "current_stake.amount: {} with staked_amount: {}",
                current_stake.amount,
                staked_amount
            ),
        })
    )?;
    // Update the stake
    STAKES.with(|stakes| {
        let mut stakes_map = stakes.borrow_mut();
        stakes_map.insert(caller, Stake {
            amount: new_amount,
            time: ic_cdk::api::time(),
            reward_icp: current_stake.reward_icp, // Keep the same reward_icp value
        });
    });
    register_info_log(caller, "un_stake_all_ALEX", &format!("Successfully unstaked!"));
    Ok("Successfully unstaked!".to_string())
}
//Guard ensure call is only by canister.
pub async fn distribute_reward() -> Result<String, ExecutionError> {
    register_info_log(caller(), "distribute_reward", "distribute_reward initiated.");
    let intervals = get_distribution_interval();
    let staking_percentage = STAKING_REWARD_PERCENTAGE;
    let mut total_icp_available: u64 = 0;

    match fetch_canister_icp_balance().await {
        Ok(bal) => {
            total_icp_available = bal;
        }
        Err(e) => {
            return Err(e);
        }
    }

    let total_unclaimed_icp_reward: u64 = get_total_unclaimed_icp_reward();
    let total_archived_bal: u64 = get_total_archived_balance();

    let unclaimed_icps: u64 = total_unclaimed_icp_reward
        .checked_add(total_archived_bal)
        .ok_or_else(||
            ExecutionError::new_with_log(
                caller(),
                "distribute_reward",
                ExecutionError::AdditionOverflow {
                    operation: DEFAULT_ADDITION_OVERFLOW_ERROR.to_string(),
                    details: format!(
                        "total_unclaimed_icp_reward: {} with total_archived_bal: {}",
                        total_unclaimed_icp_reward,
                        total_archived_bal
                    ),
                }
            )
        )?;

    if total_icp_available == 0 || total_icp_available < unclaimed_icps {
        return Err(
            ExecutionError::new_with_log(
                caller(),
                "distribute_reward",
                ExecutionError::InsufficientCanisterBalance {
                    required: 1, // required greater than 0
                    available: total_icp_available,
                    details: DEFAULT_INSUFFICIENT_CANISTER_BALANCE_ERROR.to_string(),
                }
            )
        );
    }
    let mut total_icp_allocated: u128 = total_icp_available
        .checked_sub((unclaimed_icps as u128).try_into().unwrap())
        .ok_or_else(||
            ExecutionError::new_with_log(caller(), "distribute_reward", ExecutionError::Underflow {
                operation: DEFAULT_UNDERFLOW_ERROR.to_string(),
                details: format!(
                    "total_icp_available: {} with unclaimed_icps: {}",
                    total_icp_available,
                    unclaimed_icps
                ),
            })
        )?
        .into();
    total_icp_allocated = total_icp_allocated.checked_mul(staking_percentage as u128).ok_or_else(||
        ExecutionError::new_with_log(
            caller(),
            "distribute_reward",
            ExecutionError::MultiplicationOverflow {
                operation: DEFAULT_MULTIPLICATION_OVERFLOW_ERROR.to_string(),
                details: format!(
                    "total_icp_allocated: {} with staking_percentage: {}",
                    total_icp_allocated,
                    staking_percentage
                ),
            }
        )
    )?;

    total_icp_allocated = total_icp_allocated.checked_div(10000).ok_or_else(||
        ExecutionError::new_with_log(caller(), "distribute_reward", ExecutionError::DivisionFailed {
            operation: "ICP allocation calculation".to_string(),
            details: "Please verify the amount is valid and non-zero".to_string(),
        })
    )?;

    if total_icp_allocated < 1_000_000 {
        return Err(
            ExecutionError::new_with_log(
                caller(),
                "distribute_reward",
                ExecutionError::InsufficientBalanceRewardDistribution {
                    available: total_icp_allocated,
                    details: DEFAULT_INSUFFICIENT_BALANCE_REWARD_DISTRIBUTION_ERROR.to_string(),
                }
            )
        );
    }

    let total_staked_alex = get_total_alex_staked().await? as u128;

    if total_staked_alex == 0 {
        return Err(
            ExecutionError::new_with_log(
                caller(),
                "distribute_reward",
                ExecutionError::RewardDistributionError {
                    reason: "No ALEX staked, cannot distribute rewards".to_string(),
                }
            )
        );
    }
    let mut icp_reward_per_alex = total_icp_allocated
        .checked_mul(SCALING_FACTOR)
        .ok_or_else(||
            ExecutionError::new_with_log(
                caller(),
                "distribute_reward",
                ExecutionError::MultiplicationOverflow {
                    operation: DEFAULT_MULTIPLICATION_OVERFLOW_ERROR.to_string(),
                    details: format!(
                        "total_icp_allocated: {} with SCALING_FACTOR: {}",
                        total_icp_allocated,
                        SCALING_FACTOR
                    ),
                }
            )
        )?
        .checked_div(total_staked_alex)
        .ok_or_else(||
            ExecutionError::new_with_log(
                caller(),
                "distribute_reward",
                ExecutionError::DivisionFailed {
                    operation: DEFAULT_DIVISION_ERROR.to_string(),
                    details: format!(
                        "total_icp_allocated * SCALING_FACTOR: {} divided by total_staked_alex: {}",
                        total_icp_allocated * SCALING_FACTOR,
                        total_staked_alex
                    ),
                }
            )
        )?;

    let mut total_icp_reward: u128 = 0;
    STAKES.with(
        |stakes| -> Result<(), ExecutionError> {
            let mut stakes_map = stakes.borrow_mut();

            let keys: Vec<Principal> = stakes_map
                .iter()
                .map(|(principal, _)| principal.clone())
                .collect();

            for principal in keys {
                // Retrieve.
                if let Some(mut stake) = stakes_map.get(&principal) {
                    let reward = (stake.amount as u128)
                        .checked_mul(icp_reward_per_alex)
                        .ok_or_else(||
                            ExecutionError::new_with_log(
                                caller(),
                                "distribute_reward",
                                ExecutionError::MultiplicationOverflow {
                                    operation: DEFAULT_MULTIPLICATION_OVERFLOW_ERROR.to_string(),
                                    details: format!(
                                        "stake.amount: {} with icp_reward_per_alex: {}",
                                        stake.amount,
                                        icp_reward_per_alex
                                    ),
                                }
                            )
                        )?
                        .checked_div(SCALING_FACTOR)
                        .ok_or_else(||
                            ExecutionError::new_with_log(
                                caller(),
                                "distribute_reward",
                                ExecutionError::DivisionFailed {
                                    operation: DEFAULT_DIVISION_ERROR.to_string(),
                                    details: format!(
                                        "stake.amount*icp_reward_per_alex: {} with SCALING_FACTOR: {}",
                                        (stake.amount as u128) * icp_reward_per_alex,
                                        SCALING_FACTOR
                                    ),
                                }
                            )
                        )?;

                    total_icp_reward = total_icp_reward.checked_add(reward).ok_or_else(||
                        ExecutionError::new_with_log(
                            caller(),
                            "distribute_reward",
                            ExecutionError::AdditionOverflow {
                                operation: DEFAULT_ADDITION_OVERFLOW_ERROR.to_string(),
                                details: format!(
                                    "total_icp_reward: {} with total_icp_reward: {}",
                                    total_icp_reward,
                                    total_icp_reward
                                ),
                            }
                        )
                    )?;

                    stake.reward_icp = stake.reward_icp.checked_add(reward as u64).ok_or_else(||
                        ExecutionError::new_with_log(
                            caller(),
                            "distribute_reward",
                            ExecutionError::AdditionOverflow {
                                operation: DEFAULT_ADDITION_OVERFLOW_ERROR.to_string(),
                                details: format!(
                                    "stake.reward_icp: {} with reward: {}",
                                    stake.reward_icp,
                                    reward
                                ),
                            }
                        )
                    )?;

                    // Reinsert the updated stake back into the map.
                    stakes_map.insert(principal, stake);
                }
            }

            Ok(())
        }
    )?;

    let index = intervals % MAX_DAYS;

    APY.with(|apy| {
        let mut apy_map = apy.borrow_mut();
        let mut daily_values = apy_map.get(&index).unwrap_or_default();
        daily_values.values.insert(index, icp_reward_per_alex);
        apy_map.insert(index, daily_values);
    });

    add_to_unclaimed_amount(total_icp_reward as u64)?;

    add_to_distribution_intervals(1)?;
    register_info_log(caller(), "distribute_reward", "Successfully distributed reward. Completed.");

    Ok("Success".to_string())
}

#[update(guard = "not_anon")]
async fn claim_icp_reward(from_subaccount: Option<[u8; 32]>) -> Result<String, ExecutionError> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller).map_err(|e| ExecutionError::Unauthorized(e.to_string()))?;
    register_info_log(caller, "claim_icp_reward", "claim_icp_reward initiated.");

    let caller_stake_reward: Option<Stake> = get_stake(caller);
    match caller_stake_reward {
        Some(stake) => {
            if stake.reward_icp <= 1000_000 {
                return Err(
                    ExecutionError::new_with_log(
                        caller,
                        "claim_icp_reward",
                        ExecutionError::MinimumRequired {
                            required: 1000_000,
                            provided: stake.reward_icp,
                            token: "ICP".to_string(),
                            details: DEFAULT_MINIMUM_REQUIRED_ERROR.to_string(),
                        }
                    )
                );
            }
            let mut total_icp_available: u64 = 0;

            match fetch_canister_icp_balance().await {
                Ok(bal) => {
                    total_icp_available = bal;
                }
                Err(e) => {
                    return Err(e);
                }
            }

            if stake.reward_icp > total_icp_available {
                return Err(
                    ExecutionError::new_with_log(
                        caller,
                        "claim_icp_reward",
                        ExecutionError::InsufficientCanisterBalance {
                            required: stake.reward_icp,
                            available: total_icp_available,
                            details: DEFAULT_INSUFFICIENT_CANISTER_BALANCE_ERROR.to_string(),
                        }
                    )
                );
            }
            let amount_after_fee = stake.reward_icp.checked_sub(ICP_TRANSFER_FEE).ok_or_else(||
                ExecutionError::new_with_log(caller, "claim_icp_reward", ExecutionError::Underflow {
                    operation: DEFAULT_UNDERFLOW_ERROR.to_string(),
                    details: format!(
                        "stake.reward_icp: {} with ICP_TRANSFER_FEE: {}",
                        stake.reward_icp,
                        ICP_TRANSFER_FEE
                    ),
                })
            )?;
            send_icp(caller, amount_after_fee, from_subaccount).await.map_err(|e|
                ExecutionError::new_with_log(
                    caller,
                    "claim_icp_reward",
                    ExecutionError::TransferFailed {
                        source: "canister".to_string(),
                        dest: caller.to_string(),
                        token: "ICP".to_string(),
                        amount: amount_after_fee,
                        details: e.to_string(),
                        reason: DEFAULT_TRANSFER_FAILED_ERROR.to_string(),
                    }
                )
            )?;
            register_info_log(
                caller,
                "claim_icp_reward",
                &format!("Successfully sent {} ICP (e8s) to {}", amount_after_fee, caller)
            );
            sub_to_unclaimed_amount(stake.reward_icp)?;

            STAKES.with(|stakes| {
                let mut stakes_map = stakes.borrow_mut();

                // Get the current stake for the caller, or insert a new one if it doesn't exist.
                let mut current_stake = stakes_map.get(&caller).unwrap_or(Stake {
                    amount: 0,
                    time: ic_cdk::api::time(),
                    reward_icp: 0,
                });

                current_stake.reward_icp = 0;

                // Reinsert the updated stake back into the map.
                stakes_map.insert(caller, current_stake);
            });
            register_info_log(caller, "claim_icp_reward", "Claim process completed successfully.");
            Ok("Success".to_string())
        }
        None => {
            // User doesn't have a stake
            return Err(
                ExecutionError::new_with_log(
                    caller,
                    "claim_icp_reward",
                    ExecutionError::StateError("No staking record found for caller".to_string())
                )
            );
        }
    }
}

pub async fn get_icp_rate_in_cents() -> Result<u64, ExecutionError> {
    register_info_log(caller(), "get_icp_rate_in_cents", "get_icp_rate_in_cents initiated.");

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

    let call_result: Result<
        Vec<u8>,
        (ic_cdk::api::call::RejectionCode, String)
    > = ic_cdk::api::call::call_raw(
        xrc_canister_id,
        "get_exchange_rate",
        &candid::encode_args((request,)).unwrap(),
        BURN_CYCLE_FEE // payment fee
    ).await;

    match call_result {
        Ok(response_bytes) =>
            match candid::decode_one::<XRCResponse>(&response_bytes) {
                Ok(response) => {
                    match response {
                        XRCResponse::Ok(exchange_rate) => {
                            let divisor: u64 = (10_u64).pow(
                                exchange_rate.metadata.decimals.checked_sub(2).ok_or_else(||
                                    ExecutionError::new_with_log(
                                        caller(),
                                        "get_icp_rate_in_cents",
                                        ExecutionError::Underflow {
                                            operation: DEFAULT_UNDERFLOW_ERROR.to_string(),
                                            details: format!(
                                                "exchange_rate.metadata.decimals: {} with ICP_TRANSFER_FEE: {}",
                                                exchange_rate.metadata.decimals,
                                                ICP_TRANSFER_FEE
                                            ),
                                        }
                                    )
                                )?
                            );
                            let mut price_in_cents = exchange_rate.rate
                                .checked_div(divisor)
                                .ok_or_else(||
                                    ExecutionError::new_with_log(
                                        caller(),
                                        "get_icp_rate_in_cents",
                                        ExecutionError::DivisionFailed {
                                            operation: DEFAULT_DIVISION_ERROR.to_string(),
                                            details: format!(
                                                "exchange_rate.rate: {} with divisor: {}",
                                                exchange_rate.rate,
                                                divisor
                                            ),
                                        }
                                    )
                                )?;
                            if price_in_cents < 400 {
                                price_in_cents = 400;
                            }
                            let time = ic_cdk::api
                                ::time()
                                .checked_div(1_000_000_000)
                                .ok_or_else(||
                                    ExecutionError::new_with_log(
                                        caller(),
                                        "get_icp_rate_in_cents",
                                        ExecutionError::DivisionFailed {
                                            operation: DEFAULT_DIVISION_ERROR.to_string(),
                                            details: format!(
                                                "time: {} with divisor: {}",
                                                ic_cdk::api::time(),
                                                1_000_000_000
                                            ),
                                        }
                                    )
                                )?;
                            // Update the closure to handle potential errors
                            update_current_LBRY_ratio(price_in_cents, time)?;
                            register_info_log(
                                caller(),
                                "get_icp_rate_in_cents",
                                &format!("get_icp_rate_in_cents process completed successfully.Got {} ICP price in cents", price_in_cents)
                            );

                            Ok(price_in_cents)
                        }
                        XRCResponse::Err(err) =>
                            Err(
                                ExecutionError::new_with_log(
                                    caller(),
                                    "get_icp_rate_in_cents",
                                    ExecutionError::StateError("Error in XRC response".to_string())
                                )
                            ),
                    }
                }
                Err(_e) =>
                    Err(
                        ExecutionError::new_with_log(
                            caller(),
                            "get_icp_rate_in_cents",
                            ExecutionError::StateError("Error in decoding XRC response".to_string())
                        )
                    ),
            }
        Err((_rejection_code, msg)) =>
            Err(
                ExecutionError::new_with_log(
                    caller(),
                    "get_icp_rate_in_cents",
                    ExecutionError::StateError("Error call rejected".to_string())
                )
            ),
    }
}

#[update(guard = "not_anon")]
async fn redeem(from_subaccount: Option<[u8; 32]>) -> Result<String, ExecutionError> {
    let caller = ic_cdk::caller();
    let _guard = CallerGuard::new(caller).map_err(|e| ExecutionError::Unauthorized(e.to_string()))?;
    register_info_log(caller, "redeem", "Redeem initiated.");

    let caller_archive_profile: Option<ArchiveBalance> = get_user_archive_balance(caller);
    match caller_archive_profile {
        Some(trx) => {
            if trx.icp <= 0 {
                return Err(
                    ExecutionError::new_with_log(
                        caller,
                        "redeem",
                        ExecutionError::InsufficientBalance {
                            required: 1, //Minimum amount
                            available: trx.icp,
                            token: "ICP".to_string(),
                            details: DEFAULT_INSUFFICIENT_BALANCE_ERROR.to_string(),
                        }
                    )
                );
            }
            let mut total_icp_available: u64 = 0;

            match fetch_canister_icp_balance().await {
                Ok(bal) => {
                    total_icp_available = bal;
                }
                Err(e) => {
                    return Err(e);
                }
            }

            if trx.icp > total_icp_available {
                return Err(
                    ExecutionError::new_with_log(
                        caller,
                        "redeem",
                        ExecutionError::InsufficientCanisterBalance {
                            required: trx.icp,
                            available: total_icp_available,
                            details: DEFAULT_INSUFFICIENT_CANISTER_BALANCE_ERROR.to_string(),
                        }
                    )
                );
            }
            send_icp(caller, trx.icp, from_subaccount).await.map_err(|e|
                ExecutionError::new_with_log(caller, "redeem", ExecutionError::TransferFailed {
                    source: "canister".to_string(),
                    dest: caller.to_string(),
                    token: "ICP".to_string(),
                    amount: trx.icp,
                    details: e.to_string(),
                    reason: DEFAULT_TRANSFER_FAILED_ERROR.to_string(),
                })
            )?;
            register_info_log(
                caller,
                "claim_icp_reward",
                &format!("Successfully sent {} ICP (e8s) exculisve of fee to {}", trx.icp, caller)
            );
            sub_to_total_archived_balance(trx.icp)?;

            // make balance to 0
            ARCHIVED_TRANSACTION_LOG.with(
                |trxs| -> Result<(), ExecutionError> {
                    let mut trxs = trxs.borrow_mut();

                    let mut user_archive = trxs.get(&caller).unwrap_or(ArchiveBalance { icp: 0 });
                    user_archive.icp = 0;

                    trxs.insert(caller, user_archive);

                    Ok(())
                }
            )?;

            Ok("Success".to_string())
        }
        None => {
            return Err(
                ExecutionError::new_with_log(
                    caller,
                    "redeem",
                    ExecutionError::StateError("No Reedem record found for caller".to_string())
                )
            );
        }
    }
}

async fn withdraw_token(
    amount: u64,
    from_subaccount: Option<[u8; 32]>
) -> Result<BlockIndex, TransferFromError> {
    let caller: Principal = caller();
    let canister_id: Principal = ic_cdk::api::id();
    let alex_fee = ALEX_FEE.with(|fee| *fee.borrow());

    let amount: Nat = Nat::from(amount);
    if amount <= Nat::from(0 as u8) {
        return Err(TransferFromError::GenericError {
            message: format!("Minimum {} e8s required!", 1),
            error_code: Nat::from(1 as u8),
        });
    }
    let transfer_from_args: TransferFromArgs = TransferFromArgs {
        from: canister_id.into(),
        memo: None,
        amount,
        spender_subaccount: None,
        fee: Some(Nat::from(alex_fee)),
        to: Account {
            owner: caller,
            subaccount: from_subaccount,
        },
        created_at_time: None,
    };

    let (result,) = ic_cdk
        ::call::<(TransferFromArgs,), (Result<BlockIndex, TransferFromError>,)>(
            Principal::from_text(ALEX_CANISTER_ID).expect("Could not decode the principal."),
            "icrc2_transfer_from",
            (transfer_from_args,)
        ).await
        .map_err(|_| TransferFromError::GenericError {
            message: "Call failed".to_string(),
            error_code: Nat::from(0 as u32),
        })?;

    result
}

async fn deposit_token(
    amount: u64,
    from_subaccount: Option<[u8; 32]>
) -> Result<BlockIndex, TransferFromError> {
    let caller: Principal = caller();
    let canister_id: Principal = ic_cdk::api::id();
    let alex_fee = ALEX_FEE.with(|fee| *fee.borrow());
    let amount = Nat::from(amount);
    if amount < Nat::from(0 as u8) {
        return Err(TransferFromError::GenericError {
            message: format!("Minimum {} e8s required!", alex_fee + 1),
            error_code: Nat::from(1 as u8),
        });
    }
    let transfer_from_args: TransferFromArgs = TransferFromArgs {
        from: Account {
            owner: caller,
            subaccount: from_subaccount,
        },
        memo: None,
        amount,
        spender_subaccount: None,
        fee: Some(Nat::from(alex_fee)),
        to: canister_id.into(),
        created_at_time: None,
    };

    let (result,) = ic_cdk
        ::call::<(TransferFromArgs,), (Result<BlockIndex, TransferFromError>,)>(
            Principal::from_text(ALEX_CANISTER_ID).expect("Could not decode the principal."),
            "icrc2_transfer_from",
            (transfer_from_args,)
        ).await
        .map_err(|_| TransferFromError::GenericError {
            message: "Call failed".to_string(),
            error_code: Nat::from(0 as u32),
        })?;

    result
}

async fn burn_token(
    amount: u64,
    from_subaccount: Option<[u8; 32]>
) -> Result<BlockIndex, TransferFromError> {
    let canister_id: Principal = ic_cdk::api::id();

    let big_int_amount: BigUint = BigUint::from(amount);
    let amount: Nat = Nat(big_int_amount);

    let transfer_from_args = TransferFromArgs {
        from: Account {
            owner: ic_cdk::caller(),
            subaccount: from_subaccount,
        },
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
    let (result,) = ic_cdk
        ::call::<(TransferFromArgs,), (Result<BlockIndex, TransferFromError>,)>(
            // 2. Convert a textual representation of a Principal into an actual `Principal` object. The principal is the one we specified in `dfx.json`.
            //    `expect` will panic if the conversion fails, ensuring the code does not proceed with an invalid principal.
            Principal::from_text(LBRY_CANISTER_ID).expect("Could not decode the principal."),
            // 3. Specify the method name on the target canister to be called, in this case, "icrc1_transfer".
            "icrc2_transfer_from",
            // 4. Provide the arguments for the call in a tuple, here `transfer_args` is encapsulated as a single-element tuple.
            (transfer_from_args,)
        ).await
        .map_err(|_| TransferFromError::GenericError {
            message: "Call failed".to_string(),
            error_code: Nat::from(0 as u32),
        })?;

    result // Return the inner Result<BlockIndex, TransferFromError>
}
