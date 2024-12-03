use crate::guard::*;
use crate::storage::*;
use crate::update_log;
use crate::ALEX_CANISTER_ID;
use crate::MAX_ALEX;
use crate::{
    add_to_total_LBRY_burned, fetch_total_minted_ALEX, get_current_threshold_index, get_principal,
    get_total_LBRY_burn, get_two_random_users, update_to_current_threshold,
};
use candid::Principal;
use ic_ledger_types::Subaccount;
use icrc_ledger_types::icrc1::transfer::{BlockIndex, TransferArg, TransferError};
use icrc_ledger_types::icrc1::account::Account;

#[ic_cdk::update(guard = "is_allowed")]
pub async fn mint_ALEX(lbry_burn: u64, actual_caller: Principal, to_subaccount: Option<Subaccount>) -> Result<String, String> {
    let mut random_users: (Principal, Principal);
    let mut minted_alex: u64 = 0;
    let mut phase_mint_alex: u64 = 0;
    let mut total_burned_lbry: u64 = get_total_LBRY_burn();

    if total_burned_lbry
        .checked_add(lbry_burn)
        .ok_or("Arithmetic overflow occurred in total_burned_lbry.")?
        > LBRY_THRESHOLDS[LBRY_THRESHOLDS.len() - 1]
    {
        return Err("Max ALEX reached,minting stopped !".to_string());
    }

    let mut current_threshold_index: u32 = get_current_threshold_index();
    let tentative_total: u64 = total_burned_lbry
        .checked_add(lbry_burn)
        .ok_or("Arithmetic overflow occurred in tentative_total")?;

    if tentative_total > LBRY_THRESHOLDS[current_threshold_index as usize] {
        let mut lbry_processed: u64 = 0;

        while tentative_total > LBRY_THRESHOLDS[current_threshold_index as usize] {
            let mut lbry_mint_alex_with_current_threshold: u64 =
                LBRY_THRESHOLDS[current_threshold_index as usize];

            lbry_mint_alex_with_current_threshold = lbry_mint_alex_with_current_threshold
                .checked_sub(total_burned_lbry)
                .ok_or("Arithmetic underflow occurred in lbry_mint_alex_with_current_threshold")?;

            let mut slot_mint = ALEX_PER_THRESHOLD[current_threshold_index as usize]
                .checked_mul(lbry_mint_alex_with_current_threshold)
                .ok_or("Arithmetic overflow occurred in slot_mint.")?;

            slot_mint = slot_mint
                .checked_mul(10000)
                .ok_or("Arithmetic overflow occurred in slot_mint.")?;

            phase_mint_alex = phase_mint_alex
                .checked_add(slot_mint)
                .ok_or("Arithmetic overflow occurred in phase_mint_alex")?;
            lbry_processed = lbry_processed
                .checked_add(lbry_mint_alex_with_current_threshold)
                .ok_or("Arithmetic overflow occurred in lbry_processed")?;
            total_burned_lbry = total_burned_lbry
                .checked_add(lbry_mint_alex_with_current_threshold)
                .ok_or("Arithmetic overflow occurred in total_burned_lbry")?;

            current_threshold_index += 1;
            if current_threshold_index > (LBRY_THRESHOLDS.len() as u32) - 1 {
                current_threshold_index = (LBRY_THRESHOLDS.len() as u32) - 1;
            }
        }

        if lbry_burn > lbry_processed {
            let lbry_mint_alex_with_current_threshold: u64 = lbry_burn
                .checked_sub(lbry_processed)
                .ok_or("Arithmetic underflow occurred in lbry_burn")?;

            let mut slot_mint = ALEX_PER_THRESHOLD[current_threshold_index as usize]
                .checked_mul(lbry_mint_alex_with_current_threshold)
                .ok_or("Arithmetic overflow occurred in slot_mint.")?;

            slot_mint = slot_mint
                .checked_mul(10000)
                .ok_or("Arithmetic overflow occurred in slot_mint.")?;

            phase_mint_alex = phase_mint_alex
                .checked_add(slot_mint)
                .ok_or("Arithmetic overflow occurred in phase_mint_alex")?;

            lbry_processed
                .checked_add(lbry_mint_alex_with_current_threshold)
                .ok_or("Arithmetic overflow occurred in lbry_processed")?;
        }
    } else {
        phase_mint_alex = ALEX_PER_THRESHOLD[current_threshold_index as usize]
            .checked_mul(lbry_burn)
            .ok_or("Arithmetic overflow occurred in phase_mint_alex")?;
        phase_mint_alex = phase_mint_alex
            .checked_mul(10000)
            .ok_or("Arithmetic overflow occurred in phase_mint_alex.")?;
    }

    let total_alex_minted = fetch_total_minted_ALEX().await?;
    let remaining_alex = MAX_ALEX
        .checked_sub(total_alex_minted)
        .ok_or("Arithmetic underflow occurred when calculating remaining ALEX")?;

    let alex_to_mint = phase_mint_alex
        .checked_mul(3)
        .ok_or("Arithmetic overflow occurred when calculating alex_to_mint")?
        .min(remaining_alex);

    if alex_to_mint == 0 {
        return Err("No more ALEX can be minted".to_string());
    }

    let alex_per_recipient = alex_to_mint
        .checked_div(3)
        .ok_or("Arithmetic error occurred when calculating alex_per_recipient")?;
    let fetched_random_principals = get_two_random_users().await;
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

            // ic_cdk::println!(
            //     "Address1: {} (subaccount: {:?})\nAddress2: {} (subaccount: {:?})", 
            //     principal1, 
            //     subaccount1_arr, 
            //     principal2, 
            //     subaccount2_arr
            // );

            match mint_ALEX_internal(alex_per_recipient, actual_caller, to_subaccount.map(|s| s.0)).await {
                Ok(_) => {
                    minted_alex = minted_alex
                        .checked_add(alex_per_recipient)
                        .ok_or("Arithmetic overflow occurred in minted_alex")?;
                }
                Err(e) => {
                    return Err(format!("Something went wrong while minting to caller: {}", e));
                }
            }

            match mint_ALEX_internal(alex_per_recipient, random_users.0, subaccount1_arr).await {
                Ok(_) => {
                    minted_alex = minted_alex
                        .checked_add(alex_per_recipient)
                        .ok_or("Arithmetic overflow occurred in minted_alex")?;
                }
                Err(_e) => update_log(&format!(
                    "Something went wrong while minting to random user 1. Principal: {}",
                    random_users.0
                )),
            }

            match mint_ALEX_internal(alex_per_recipient, random_users.1, subaccount2_arr).await {
                Ok(_) => {
                    minted_alex = minted_alex
                        .checked_add(alex_per_recipient)
                        .ok_or("Arithmetic overflow occurred in minted_alex")?;
                }
                Err(_e) => update_log(&format!(
                    "Something went wrong while minting to random user 2. Principal: {}",
                    random_users.1
                )),
            }
        }
        Err(_) => {
            return Err("Failed to fetch random users".to_string());
        }
    }

    update_to_current_threshold(current_threshold_index)?;

    add_to_total_LBRY_burned(lbry_burn)?;

    Ok("Minted ALEX ".to_string() + &minted_alex.to_string())
}

async fn mint_ALEX_internal(minted_alex: u64, destination: Principal, to_subaccount: Option<[u8; 32]>) -> Result<BlockIndex, String> {
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
    ic_cdk::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
        get_principal(ALEX_CANISTER_ID),
        "icrc1_transfer",
        (transfer_args,),
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    .0
    .map_err(|e| format!("ledger transfer error {:?}", e))
}
