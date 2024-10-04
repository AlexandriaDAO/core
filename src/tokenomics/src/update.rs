use crate::get_principal;
use crate::guard::*;
use crate::storage::*;
use crate::ALEX_CANISTER_ID;
use crate::LIBRARIAN;
use crate::MAX_ALEX;
use crate::USER;
use candid::Principal;
use std::cell::RefCell;
use icrc_ledger_types::icrc1::transfer::{BlockIndex, TransferArg, TransferError};


#[ic_cdk::update(guard = "is_allowed")]
pub async fn mint_ALEX(lbry_burn: u64, actual_caller: Principal) -> Result<String, String> {
    let mut minted_alex: u64 = 0;
    let mut phase_mint_alex: u64 = 0;
    let mut total_burned_lbry: u64 =
        TOTAL_LBRY_BURNED.with(|lbry: &RefCell<u64>| lbry.borrow().clone());

    if total_burned_lbry
        .checked_add(lbry_burn)
        .ok_or("Arithmetic overflow occurred in total_burned_lbry.")?
        > LBRY_THRESHOLDS[LBRY_THRESHOLDS.len() - 1]
    {
        return Err("Max ALEX reached,minting stopped !".to_string());
    }

    let mut current_threshold: u32 = CURRENT_THRESHOLD
        .with(|current_threshold: &RefCell<u32>| current_threshold.borrow().clone());

    let tentative_total: u64 = total_burned_lbry
        .checked_add(lbry_burn)
        .ok_or("Arithmetic overflow occurred in tentative_total")?;

    if tentative_total > LBRY_THRESHOLDS[current_threshold as usize] {
        let mut lbry_processed: u64 = 0;

        while tentative_total > LBRY_THRESHOLDS[current_threshold as usize] {
            let mut lbry_mint_alex_with_current_threshold: u64 =
                LBRY_THRESHOLDS[current_threshold as usize];

            lbry_mint_alex_with_current_threshold = lbry_mint_alex_with_current_threshold
                .checked_sub(total_burned_lbry)
                .ok_or("Arithmetic underflow occurred in lbry_mint_alex_with_current_threshold")?;

            let mut slot_mint = ALEX_PER_THRESHOLD[current_threshold as usize]
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

            current_threshold += 1;
            if current_threshold > (LBRY_THRESHOLDS.len() as u32) - 1 {
                current_threshold = (LBRY_THRESHOLDS.len() as u32) - 1;
            }
        }

        if lbry_burn > lbry_processed {
            let lbry_mint_alex_with_current_threshold: u64 = lbry_burn
                .checked_sub(lbry_processed)
                .ok_or("Arithmetic underflow occurred in lbry_burn")?;

            let mut slot_mint = ALEX_PER_THRESHOLD[current_threshold as usize]
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
        phase_mint_alex = ALEX_PER_THRESHOLD[current_threshold as usize]
            .checked_mul(lbry_burn)
            .ok_or("Arithmetic overflow occurred in phase_mint_alex")?;
        phase_mint_alex = phase_mint_alex
            .checked_mul(10000)
            .ok_or("Arithmetic overflow occurred in phase_mint_alex.")?;
    }

    let total_alex_minted = TOTAL_ALEX_MINTED.with(|total| total.borrow().clone());
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

    //Minting
    match mint_ALEX_internal(alex_per_recipient, actual_caller).await {
        Ok(_) => {
            minted_alex = minted_alex
                .checked_add(alex_per_recipient)
                .ok_or("Arithmetic overflow occurred in minted_alex")?;
            ic_cdk::println!("Successful");
        }

        Err(_) => {
            return Err("Something went wrong".to_string());
        }
    } //mint to caller

    match mint_ALEX_internal(alex_per_recipient,get_principal(LIBRARIAN),).await
    {
        Ok(_) => {
            minted_alex = minted_alex
                .checked_add(alex_per_recipient)
                .ok_or("Arithmetic overflow occurred in minted_alex")?;
            ic_cdk::println!("Successful mint to librarian");
        }
        Err(_) => ic_cdk::println!("Something went wrong, while minting to librarian."),
    } //mint 1 unit to librarian

    match mint_ALEX_internal(alex_per_recipient,get_principal(USER),).await
    {
        Ok(_) => {
            minted_alex = minted_alex
                .checked_add(alex_per_recipient)
                .ok_or("Arithmetic overflow occurred in minted_alex")?;
            ic_cdk::println!("Successful mint to user");
        }
        Err(_) => ic_cdk::println!("Something went wrong, while minting to user."),
    } //mint 1 unit to user

    TOTAL_ALEX_MINTED.with(|mint| -> Result<(), String> {
        let mut mint = mint.borrow_mut();
        *mint = mint
            .checked_add(minted_alex)
            .ok_or("Arithmetic overflow occurred in TOTAL_ALEX_MINTED")?;
        Ok(())
    })?;

    CURRENT_THRESHOLD.with(|threshold| {
        let mut threshold = threshold.borrow_mut();
        *threshold = current_threshold;
    });

    TOTAL_LBRY_BURNED.with(|total_burned: &RefCell<u64>| -> Result<(), String> {
        let mut total_burned = total_burned.borrow_mut();
        *total_burned = total_burned
            .checked_add(lbry_burn)
            .ok_or("Arithmetic underflow occurred in TOTAL_LBRY_BURNED")?;
        Ok(())
    })?;

    Ok("Minted ALEX ".to_string() + &minted_alex.to_string())
}

async fn mint_ALEX_internal(minted_alex: u64, destinaion: Principal) -> Result<BlockIndex, String> {
    let transfer_args: TransferArg = TransferArg {
        amount: minted_alex.into(),
        from_subaccount: None,
        fee: None,
        to: destinaion.into(),
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