use crate::guard::*;
use crate::storage::*;
use candid::{Nat, Principal};

use ic_cdk::init;
use icrc_ledger_types::icrc1::transfer::{BlockIndex, TransferArg, TransferError};

const alex_canister_id: &str = "7hcrm-4iaaa-aaaak-akuka-cai";
const icp_swap_canister_id: &str = "5qx27-tyaaa-aaaal-qjafa-cai";
const librarian: &str = "xswc6-jimwj-wnqog-3gmkv-hglw4-aedfy-bqmr2-5uyut-cnbbg-4wvsk-bqe";
const user: &str = "bct62-kglfp-ljyff-3uhhx-yhc2v-pg3ms-xviiq-dorhc-5iibd-fopgs-gae";

#[ic_cdk::update(guard = "is_allowed")]
pub async fn mint_ALEX(lbry_burn: u64, actual_caller: Principal) -> Result<String, String> {
    let mut minted_alex: u64 = 0;
    let mut total_burned_lbry = TOTAL_LBRY_BURNED.with(|total_burned_lbry| {
        let total_burned_lbry: std::sync::MutexGuard<u64> = total_burned_lbry.lock().unwrap();
        *total_burned_lbry
    });
    if (total_burned_lbry + lbry_burn) > LBRY_THRESHOLDS[LBRY_THRESHOLDS.len() - 1] {
        return Err("Max ALEX reached,minting stopped !".to_string());
    }
    let mut current_threshold: u32 = CURRENT_THRESHOLD.with(|current_threshold| {
        let current_threshold: std::sync::MutexGuard<u32> = current_threshold.lock().unwrap();
        *current_threshold
    });
    let tentative_total: u64 = total_burned_lbry
        .checked_add(lbry_burn)
        .ok_or("Arithmetic overflow occurred in tentative_total")?;
    if tentative_total > (LBRY_THRESHOLDS[current_threshold as usize]) {
        let mut lbry_processed: u64 = 0;
        while tentative_total > (LBRY_THRESHOLDS[current_threshold as usize]) {
            ic_cdk::println!("Current threshold {}", current_threshold);
            ic_cdk::println!("Total burn LBRY is {}", total_burned_lbry);
            let mut lbry_mint_alex_with_current_threshold: u64 =
                LBRY_THRESHOLDS[current_threshold as usize];
            ic_cdk::println!(
                "lbry_mint_alex_with_current_threshold is {}",
                lbry_mint_alex_with_current_threshold
            );

            lbry_mint_alex_with_current_threshold = lbry_mint_alex_with_current_threshold
                .checked_sub(total_burned_lbry)
                .ok_or("Arithmetic underflow occurred in lbry_mint_alex_with_current_threshold")?;
           
            let mut phase_mint_alex: u64 = (ALEX_PER_THRESHOLD[current_threshold as usize])
                .checked_mul(lbry_mint_alex_with_current_threshold)
                .ok_or("Arithmetic overflow occurred in phase_mint_alex")?;

            phase_mint_alex = phase_mint_alex
                .checked_mul(10000)
                .ok_or("Arithmetic overflow occurred in phase_mint_alex.")?;

            mint_ALEX_internal(phase_mint_alex, actual_caller).await?; //mint to actual caller
            mint_ALEX_internal(
                phase_mint_alex,
                Principal::from_text(librarian).expect("Could not decode the librarian principal."),
            )
            .await?; //mint  to librarian
            mint_ALEX_internal(
                phase_mint_alex,
                Principal::from_text(user).expect("Could not decode the principal."),
            )
            .await?; //mint to user
            phase_mint_alex = phase_mint_alex
                .checked_mul(3)
                .ok_or("Arithmetic overflow occurred in phase_mint_alex")?;
            minted_alex = minted_alex
                .checked_add(phase_mint_alex)
                .ok_or("Arithmetic overflow occurred in minted_alex")?;
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
            let mut phase_mint_alex: u64 = (ALEX_PER_THRESHOLD[current_threshold as usize])
                .checked_mul(lbry_mint_alex_with_current_threshold)
                .ok_or("Arithmetic overflow occurred in phase_mint_alex")?;

            phase_mint_alex = phase_mint_alex
                .checked_mul(10000)
                .ok_or("Arithmetic overflow occurred in phase_mint_alex.")?;
            mint_ALEX_internal(phase_mint_alex, actual_caller).await?; //mint to actual caller
            mint_ALEX_internal(
                phase_mint_alex,
                Principal::from_text(librarian).expect("Could not decode the librarian principal."),
            )
            .await?; //mint  to librarian
            mint_ALEX_internal(
                phase_mint_alex,
                Principal::from_text(user).expect("Could not decode the principal."),
            )
            .await?; //mint to user
            phase_mint_alex = phase_mint_alex
                .checked_mul(3)
                .ok_or("Arithmetic overflow occurred in minted_alex")?;
            minted_alex = minted_alex
                .checked_add(phase_mint_alex)
                .ok_or("Arithmetic overflow occurred in minted_alex")?;
            lbry_processed
                .checked_add(lbry_mint_alex_with_current_threshold)
                .ok_or("Arithmetic overflow occurred in lbry_processed")?;
        }
    } else {
        let mut phase_mint_alex = ALEX_PER_THRESHOLD[current_threshold as usize]
            .checked_mul(lbry_burn)
            .ok_or("Arithmetic overflow occurred in phase_mint_alex")?;
        phase_mint_alex = phase_mint_alex
            .checked_mul(10000)
            .ok_or("Arithmetic overflow occurred in phase_mint_alex.")?;
        mint_ALEX_internal(phase_mint_alex, actual_caller).await?; //mint to caller

        mint_ALEX_internal(
            phase_mint_alex,
            Principal::from_text(librarian).expect("Could not decode the librarian principal."),
        )
        .await?; //mint 1 unit to librarian

        mint_ALEX_internal(
            phase_mint_alex,
            Principal::from_text(user).expect("Could not decode the principal."),
        )
        .await?; //mint 1 unit to user

        phase_mint_alex = phase_mint_alex
            .checked_mul(3)
            .ok_or("Arithmetic overflow occurred in phase_mint_alex")?;
        minted_alex = minted_alex
            .checked_add(phase_mint_alex)
            .ok_or("Arithmetic overflow occurred in minted_alex")?;
    }

    ic_cdk::println!(
        "current threshold index is {} minted {}",
        current_threshold,
        minted_alex
    );
    TOTAL_ALEX_MINTED.with(|mint| -> Result<(), String> {
        let mut mint: std::sync::MutexGuard<u64> = mint.lock().unwrap();
        *mint = mint
            .checked_add(minted_alex)
            .ok_or("Arithmetic overflow occurred in TOTAL_ALEX_MINTED")?;
        ic_cdk::println!("Total ALEX minted is {}", *mint);
        Ok(())
    })?;

    CURRENT_THRESHOLD.with(|threshold| {
        let mut threshold = threshold.lock().unwrap();
        *threshold = current_threshold;
    });
    TOTAL_LBRY_BURNED.with(
        |total_burned: &std::sync::Arc<std::sync::Mutex<u64>>| -> Result<(), String> {
            let mut total_burned = total_burned.lock().unwrap();
            *total_burned = total_burned
                .checked_add(lbry_burn)
                .ok_or("Arithmetic overflow occurred in total_burned")?;
            ic_cdk::println!("Total LBRY burned is  {}", *total_burned);
            Ok(())
        },
    )?;

    Ok("Minted ALEX ".to_string() + &minted_alex.to_string())
}

#[ic_cdk::update]
async fn mint_ALEX_internal(minted_alex: u64, destinaion: Principal) -> Result<BlockIndex, String> {
    ic_cdk::println!("minting to {}==>{}", minted_alex, destinaion.to_string());
    let transfer_args: TransferArg = TransferArg {
        amount: minted_alex.into(),
        //transfer tokens from the default subaccount of the canister
        from_subaccount: None,
        fee: None,
        to: destinaion.into(),
        created_at_time: None,
        memo: None,
    };
    ic_cdk::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
        Principal::from_text(alex_canister_id).expect("Could not decode the principal."),
        "icrc1_transfer",
        (transfer_args,),
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    .0
    .map_err(|e| format!("ledger transfer error {:?}", e))
}

#[init]
fn init() {
    ALLOWED_CALLERS.with(|users| {
        users.borrow_mut().insert(
            Principal::from_text(icp_swap_canister_id).expect("Could not decode the principal."),
        )
    });
}
