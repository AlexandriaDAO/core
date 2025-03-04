use crate::guard::*;
use crate::error::ExecutionError;
use crate::register_info_log;
use crate::storage::*;
use crate::update_log;
use crate::ALEX_CANISTER_ID;
use crate::DEFAULT_ADDITION_OVERFLOW_ERROR;
use crate::DEFAULT_DIVISION_ERROR;
use crate::DEFAULT_MINT_FAILED;
use crate::DEFAULT_MULTIPLICATION_OVERFLOW_ERROR;
use crate::DEFAULT_UNDERFLOW_ERROR;
use crate::MAX_ALEX;
use crate::{
    add_to_total_LBRY_burned,
    fetch_total_minted_ALEX,
    get_current_threshold_index,
    get_principal,
    get_total_LBRY_burn,
    get_two_random_nfts,
    update_to_current_threshold,
};
use candid::Principal;
use ic_ledger_types::Subaccount;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{ BlockIndex, TransferArg, TransferError };

#[ic_cdk::update(guard = "is_allowed")]
pub async fn mint_ALEX(
    lbry_burn: u64,
    actual_caller: Principal,
    to_subaccount: Option<Subaccount>
) -> Result<String, ExecutionError> {
    let mut random_users: (Principal, Principal);
    let mut minted_alex: u64 = 0;
    let mut phase_mint_alex: u64 = 0;
    let mut total_burned_lbry: u64 = get_total_LBRY_burn();
    register_info_log(
        actual_caller,
        "mint_ALEX",
        &format!("Processing ALEX minting aginst {} LBRY ", lbry_burn)
    );
    if
        total_burned_lbry.checked_add(lbry_burn).ok_or_else(|| {
            ExecutionError::new_with_log(
                actual_caller,
                "mint_ALEX",
                ExecutionError::AdditionOverflow {
                    operation: DEFAULT_ADDITION_OVERFLOW_ERROR.to_string(),
                    details: format!(
                        "total_burned_lbry: {} with lbry_burn: {}",
                        total_burned_lbry,
                        lbry_burn
                    ),
                }
            )
        })? > LBRY_THRESHOLDS[LBRY_THRESHOLDS.len() - 1]
    {
        return Err(
            ExecutionError::new_with_log(
                actual_caller,
                "mint_ALEX",
                ExecutionError::MaxMintAlexReached {
                    reason: "Max ALEX reached,minting stopped !".to_string(),
                }
            )
        );
    }

    let mut current_threshold_index: u32 = get_current_threshold_index();
    let tentative_total: u64 = total_burned_lbry.checked_add(lbry_burn).ok_or_else(|| {
        ExecutionError::new_with_log(actual_caller, "mint_ALEX", ExecutionError::AdditionOverflow {
            operation: DEFAULT_ADDITION_OVERFLOW_ERROR.to_string(),
            details: format!(
                "total_burned_lbry: {} with lbry_burn: {}",
                total_burned_lbry,
                lbry_burn
            ),
        })
    })?;

    if tentative_total > LBRY_THRESHOLDS[current_threshold_index as usize] {
        let mut lbry_processed: u64 = 0;

        while tentative_total > LBRY_THRESHOLDS[current_threshold_index as usize] {
            let lbry_mint_alex_with_current_threshold: u64 = if
                total_burned_lbry < LBRY_THRESHOLDS[current_threshold_index as usize]
            {
                LBRY_THRESHOLDS[current_threshold_index as usize] - total_burned_lbry
            } else {
                lbry_burn.checked_sub(lbry_processed).ok_or_else(|| {
                    ExecutionError::new_with_log(
                        actual_caller,
                        "mint_ALEX",
                        ExecutionError::Underflow {
                            operation: DEFAULT_UNDERFLOW_ERROR.to_string(),
                            details: format!(
                                "lbry_burn: {} with lbry_processed: {}",
                                lbry_burn,
                                lbry_processed
                            ),
                        }
                    )
                })?
            };

            let mut slot_mint = ALEX_PER_THRESHOLD[current_threshold_index as usize].checked_mul(
                lbry_mint_alex_with_current_threshold
            ).ok_or_else(||
                ExecutionError::new_with_log(
                    actual_caller,
                    "mint_ALEX",
                    ExecutionError::MultiplicationOverflow {
                        operation: DEFAULT_MULTIPLICATION_OVERFLOW_ERROR.to_string(),
                        details: format!(
                            "ALEX_PER_THRESHOLD[current_threshold_index]: {} with lbry_mint_alex_with_current_threshold: {}",
                            ALEX_PER_THRESHOLD[current_threshold_index as usize],
                            lbry_mint_alex_with_current_threshold
                        ),
                    }
                )
            )?;

            slot_mint = slot_mint.checked_mul(10000).ok_or_else(|| {
                ExecutionError::new_with_log(
                    actual_caller,
                    "mint_ALEX",
                    ExecutionError::MultiplicationOverflow {
                        operation: DEFAULT_MULTIPLICATION_OVERFLOW_ERROR.to_string(),
                        details: format!("slot_mint: {} with {}", slot_mint, 10000),
                    }
                )
            })?;

            phase_mint_alex = phase_mint_alex.checked_add(slot_mint).ok_or_else(|| {
                ExecutionError::new_with_log(
                    actual_caller,
                    "mint_ALEX",
                    ExecutionError::AdditionOverflow {
                        operation: DEFAULT_ADDITION_OVERFLOW_ERROR.to_string(),
                        details: format!(
                            "slot_mint: {} with phase_mint_alex: {}",
                            slot_mint,
                            phase_mint_alex
                        ),
                    }
                )
            })?;
            lbry_processed = lbry_processed
                .checked_add(lbry_mint_alex_with_current_threshold)
                .ok_or_else(|| {
                    ExecutionError::new_with_log(
                        actual_caller,
                        "mint_ALEX",
                        ExecutionError::AdditionOverflow {
                            operation: DEFAULT_ADDITION_OVERFLOW_ERROR.to_string(),
                            details: format!(
                                "lbry_processed: {} with lbry_mint_alex_with_current_threshold: {}",
                                lbry_processed,
                                lbry_mint_alex_with_current_threshold
                            ),
                        }
                    )
                })?;
            total_burned_lbry = total_burned_lbry
                .checked_add(lbry_mint_alex_with_current_threshold)
                .ok_or_else(||
                    ExecutionError::new_with_log(
                        actual_caller,
                        "mint_ALEX",
                        ExecutionError::AdditionOverflow {
                            operation: DEFAULT_ADDITION_OVERFLOW_ERROR.to_string(),
                            details: format!(
                                "total_burned_lbry: {} with lbry_mint_alex_with_current_threshold: {}",
                                total_burned_lbry,
                                lbry_mint_alex_with_current_threshold
                            ),
                        }
                    )
                )?;
            current_threshold_index += 1;
            if current_threshold_index > (LBRY_THRESHOLDS.len() as u32) - 1 {
                current_threshold_index = (LBRY_THRESHOLDS.len() as u32) - 1;
            }
        }

        if lbry_burn > lbry_processed {
            let lbry_mint_alex_with_current_threshold: u64 = lbry_burn
                .checked_sub(lbry_processed)
                .ok_or_else(|| {
                    ExecutionError::new_with_log(
                        actual_caller,
                        "mint_ALEX",
                        ExecutionError::Underflow {
                            operation: DEFAULT_UNDERFLOW_ERROR.to_string(),
                            details: format!(
                                "lbry_burn: {} with lbry_processed: {}",
                                lbry_burn,
                                lbry_processed
                            ),
                        }
                    )
                })?;

            let mut slot_mint = ALEX_PER_THRESHOLD[current_threshold_index as usize].checked_mul(
                lbry_mint_alex_with_current_threshold
            ).ok_or_else(||
                ExecutionError::new_with_log(
                    actual_caller,
                    "mint_ALEX",
                    ExecutionError::MultiplicationOverflow {
                        operation: DEFAULT_MULTIPLICATION_OVERFLOW_ERROR.to_string(),
                        details: format!(
                            "ALEX_PER_THRESHOLD[current_threshold_index]: {} with lbry_mint_alex_with_current_threshold:{}",
                            ALEX_PER_THRESHOLD[current_threshold_index as usize],
                            lbry_mint_alex_with_current_threshold
                        ),
                    }
                )
            )?;
            slot_mint = slot_mint.checked_mul(10000).ok_or_else(|| {
                ExecutionError::new_with_log(
                    actual_caller,
                    "mint_ALEX",
                    ExecutionError::MultiplicationOverflow {
                        operation: DEFAULT_MULTIPLICATION_OVERFLOW_ERROR.to_string(),
                        details: format!("slot_mint: {} with {}", slot_mint, 10000),
                    }
                )
            })?;

            phase_mint_alex = phase_mint_alex.checked_add(slot_mint).ok_or_else(|| {
                ExecutionError::new_with_log(
                    actual_caller,
                    "mint_ALEX",
                    ExecutionError::AdditionOverflow {
                        operation: DEFAULT_ADDITION_OVERFLOW_ERROR.to_string(),
                        details: format!(
                            "phase_mint_alex: {} with slot_mint: {}",
                            phase_mint_alex,
                            slot_mint
                        ),
                    }
                )
            })?;

            lbry_processed.checked_add(lbry_mint_alex_with_current_threshold).ok_or_else(|| {
                ExecutionError::new_with_log(
                    actual_caller,
                    "mint_ALEX",
                    ExecutionError::AdditionOverflow {
                        operation: DEFAULT_ADDITION_OVERFLOW_ERROR.to_string(),
                        details: format!(
                            "lbry_processed: {} with lbry_mint_alex_with_current_threshold: {}",
                            lbry_processed,
                            lbry_mint_alex_with_current_threshold
                        ),
                    }
                )
            })?;
        }
    } else {
        phase_mint_alex = ALEX_PER_THRESHOLD[current_threshold_index as usize].checked_mul(
            lbry_burn
        ).ok_or_else(|| {
            ExecutionError::new_with_log(
                actual_caller,
                "mint_ALEX",
                ExecutionError::MultiplicationOverflow {
                    operation: DEFAULT_MULTIPLICATION_OVERFLOW_ERROR.to_string(),
                    details: format!(
                        "phase_mint_alex: {} with lbry_burn:{}",
                        phase_mint_alex,
                        lbry_burn
                    ),
                }
            )
        })?;
        phase_mint_alex = phase_mint_alex.checked_mul(10000).ok_or_else(|| {
            ExecutionError::new_with_log(
                actual_caller,
                "mint_ALEX",
                ExecutionError::MultiplicationOverflow {
                    operation: DEFAULT_MULTIPLICATION_OVERFLOW_ERROR.to_string(),
                    details: format!("phase_mint_alex: {} with {}", phase_mint_alex, 10000),
                }
            )
        })?;
    }

    // Check for maximum ALEX per transaction (50 ALEX = 500_000 after multiplication by 10000)
    if phase_mint_alex > 500_000_0000 {
        return Err(
            ExecutionError::new_with_log(
                actual_caller,
                "mint_ALEX",
                ExecutionError::MaxAlexPerTrnxReached {
                    reason: format!(
                        "This would mint {} ALEX which exceeds the maximum of 50 ALEX per transaction",
                        (phase_mint_alex as f64) / 10000.0
                    ),
                }
            )
        );
    }

    let mut total_alex_minted = 0;

    match fetch_total_minted_ALEX().await {
        Ok(result) => {
            total_alex_minted = result;
        }
        Err(e) => {
            return Err(
                ExecutionError::new_with_log(
                    actual_caller,
                    "mint_ALEX",
                    ExecutionError::CanisterCallFailed {
                        canister: "ALEX".to_string(),
                        method: "mint".to_string(),
                        details: e,
                    }
                )
            );
        }
    }
    let remaining_alex = MAX_ALEX.checked_sub(total_alex_minted).ok_or_else(|| {
        ExecutionError::new_with_log(actual_caller, "mint_ALEX", ExecutionError::Underflow {
            operation: DEFAULT_UNDERFLOW_ERROR.to_string(),
            details: format!(
                "MAX_ALEX: {} with total_alex_minted: {}",
                MAX_ALEX,
                total_alex_minted
            ),
        })
    })?;
    let alex_to_mint = phase_mint_alex
        .checked_mul(3)
        .ok_or_else(|| {
            ExecutionError::new_with_log(
                actual_caller,
                "mint_ALEX",
                ExecutionError::MultiplicationOverflow {
                    operation: DEFAULT_MULTIPLICATION_OVERFLOW_ERROR.to_string(),
                    details: format!("phase_mint_alex: {} with {}", phase_mint_alex, 3),
                }
            )
        })?
        .min(remaining_alex);

    if alex_to_mint == 0 {
        return Err(
            ExecutionError::new_with_log(
                actual_caller,
                "mint_ALEX",
                ExecutionError::NoMoreAlexCanbeMinted {
                    reason: format!("No more ALEX can be minted"),
                }
            )
        );
    }

    let alex_per_recipient = alex_to_mint.checked_div(3).ok_or_else(|| {
        ExecutionError::new_with_log(actual_caller, "mint_ALEX", ExecutionError::DivisionFailed {
            operation: DEFAULT_DIVISION_ERROR.to_string(),
            details: format!("alex_to_mint: {} with  {}", alex_to_mint, 3),
        })
    })?;
    let fetched_random_principals = get_two_random_nfts().await;
    match fetched_random_principals {
        Ok(((principal1, subaccount1), (principal2, subaccount2))) => {
            random_users = (principal1, principal2);

            let subaccount1_arr: Option<[u8; 32]> = if subaccount1.len() == 32 {
                let mut arr = [0u8; 32];
                arr.copy_from_slice(&subaccount1);
                Some(arr)
            } else {
                None
            };

            let subaccount2_arr: Option<[u8; 32]> = if subaccount2.len() == 32 {
                let mut arr = [0u8; 32];
                arr.copy_from_slice(&subaccount2);
                Some(arr)
            } else {
                None
            };

            match
                mint_ALEX_internal(
                    alex_per_recipient,
                    actual_caller,
                    to_subaccount.map(|s| s.0)
                ).await
            {
                Ok(_) => {
                    register_info_log(
                        actual_caller,
                        "mint_ALEX",
                        &format!("Sucessfully minted {}(e8s) ALEX to  {}  ", alex_per_recipient,actual_caller)
                    );
                    minted_alex = minted_alex.checked_add(alex_per_recipient).ok_or_else(|| {
                        ExecutionError::new_with_log(
                            actual_caller,
                            "mint_ALEX",
                            ExecutionError::AdditionOverflow {
                                operation: DEFAULT_ADDITION_OVERFLOW_ERROR.to_string(),
                                details: format!(
                                    "minted_alex: {} with alex_per_recipient: {}",
                                    minted_alex,
                                    alex_per_recipient
                                ),
                            }
                        )
                    })?;
                }
                Err(e) => {
                    return Err(
                        ExecutionError::new_with_log(
                            actual_caller,
                            "mint_ALEX",
                            ExecutionError::MintFailed {
                                token: "ALEX".to_string(),
                                amount: alex_per_recipient,
                                reason: "ALEX ".to_string() + DEFAULT_MINT_FAILED,
                                details: e.to_string(),
                            }
                        )
                    );
                }
            }

            match mint_ALEX_internal(alex_per_recipient, random_users.0, subaccount1_arr).await {
                Ok(_) => {
                    register_info_log(
                        actual_caller,
                        "mint_ALEX",
                        &format!("Sucessfully minted {} (e8s) ALEX to  {}  ", alex_per_recipient,random_users.0)
                    );
                    minted_alex = minted_alex.checked_add(alex_per_recipient).ok_or_else(|| {
                        ExecutionError::new_with_log(
                            actual_caller,
                            "mint_ALEX",
                            ExecutionError::AdditionOverflow {
                                operation: DEFAULT_ADDITION_OVERFLOW_ERROR.to_string(),
                                details: format!(
                                    "minted_alex: {} with alex_per_recipient: {}",
                                    minted_alex,
                                    alex_per_recipient
                                ),
                            }
                        )
                    })?;
                }
                Err(_e) =>
                    update_log(
                        &format!(
                            "Something went wrong while minting to random user 1. Principal: {}",
                            random_users.0
                        )
                    ),
            }

            match mint_ALEX_internal(alex_per_recipient, random_users.1, subaccount2_arr).await {
                Ok(_) => {
                    register_info_log(
                        actual_caller,
                        "mint_ALEX",
                        &format!("Sucessfully minted {} (e8s) ALEX  to  {}  ", alex_per_recipient,random_users.1)
                    );
                    minted_alex = minted_alex.checked_add(alex_per_recipient).ok_or_else(|| {
                        ExecutionError::new_with_log(
                            actual_caller,
                            "mint_ALEX",
                            ExecutionError::AdditionOverflow {
                                operation: DEFAULT_ADDITION_OVERFLOW_ERROR.to_string(),
                                details: format!(
                                    "minted_alex: {} with alex_per_recipient: {}",
                                    minted_alex,
                                    alex_per_recipient
                                ),
                            }
                        )
                    })?;
                }
                Err(_e) =>
                    update_log(
                        &format!(
                            "Something went wrong while minting to random user 2. Principal: {}",
                            random_users.1
                        )
                    ),
            }
        }
        Err(e) => {
            return Err(
                ExecutionError::new_with_log(
                    actual_caller,
                    "mint_ALEX",
                    ExecutionError::CanisterCallFailed {
                        canister: "icrc7_scion".to_string(),
                        method: "get_two_random_nfts".to_string(),
                        details: "Failed to fetch random users".to_string(),
                    }
                )
            )?;
        }
    }

    update_to_current_threshold(current_threshold_index);
    add_to_total_LBRY_burned(lbry_burn)?;
    Ok("Minted ALEX ".to_string() + &minted_alex.to_string())
}

async fn mint_ALEX_internal(
    minted_alex: u64,
    destination: Principal,
    to_subaccount: Option<[u8; 32]>
) -> Result<BlockIndex, String> {
    let transfer_args: TransferArg = TransferArg {
        amount: minted_alex.into(),
        from_subaccount: None,
        fee: None,
        to: Account {
            owner: destination,
            subaccount: to_subaccount,
        },
        created_at_time: None,
        memo: None,
    };
    ic_cdk
        ::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
            get_principal(ALEX_CANISTER_ID),
            "icrc1_transfer",
            (transfer_args,)
        ).await
        .map_err(|e| format!("failed to call ledger: {:?}", e))?
        .0.map_err(|e| format!("ledger transfer error {:?}", e))
}
