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
    let mut current_threshold: u32 = CURRENT_THRESHOLD.with(|current_threshold| {
        let current_threshold: std::sync::MutexGuard<u32> = current_threshold.lock().unwrap();
        *current_threshold
    });
    let total_burned_lbry = TOTAL_LBRY_BURNED.with(|total_burned_lbry| {
        let total_burned_lbry: std::sync::MutexGuard<u64> = total_burned_lbry.lock().unwrap();
        *total_burned_lbry
    });
    let tentative_total: u64 = total_burned_lbry
        .checked_add(lbry_burn)
        .ok_or("Arithmetic overflow occurred in tentative_total calculation")?;
    if tentative_total > (LBRY_THRESHOLDS[current_threshold as usize]) {
        let mut mint_alex_with_current_threshold = (LBRY_THRESHOLDS[current_threshold as usize]
            .checked_mul(10000))
        .ok_or("Arithmetic overflow occurred in mint_alex_with_current_threshold.")?;
        mint_alex_with_current_threshold = mint_alex_with_current_threshold
            .checked_sub(total_burned_lbry)
            .ok_or("Arithmetic underflow occurred in mint_alex_with_current_threshold")?;

        let mint_alex_with_incremented_threshold = lbry_burn
            .checked_sub(mint_alex_with_current_threshold)
            .ok_or("Arithmetic underflow occurred in mint_alex_with_incremented_threshold")?;
        //minting phase 1
        if mint_alex_with_current_threshold > 0 {
            let mut phase1_mint_alex: u64 = (ALEX_PER_THRESHOLD[current_threshold as usize])
                .checked_mul(mint_alex_with_current_threshold)
                .ok_or("Arithmetic overflow occurred in phase1_mint_alex")?;

            phase1_mint_alex=phase1_mint_alex.checked_div(10000).ok_or("Division by 10000 failed in phase1_mint_alex. Please verify the amount is valid and non-zero")?;
            mint_ALEX_internal(phase1_mint_alex, actual_caller).await?; //mint to actual caller
            minted_alex = phase1_mint_alex;
        }
        current_threshold += 1;
        if current_threshold > (LBRY_THRESHOLDS.len() as u32) - 1 {
            current_threshold = (LBRY_THRESHOLDS.len() as u32) - 1;
        }
        //minting phase 2
        let mut phase2_mint_alex = (ALEX_PER_THRESHOLD[current_threshold as usize])
            .checked_mul(mint_alex_with_incremented_threshold)
            .ok_or("Arithmetic overflow occurred in phase2_mint_alex")?;
        phase2_mint_alex=phase2_mint_alex.checked_div(10000).ok_or("Division by 10000 failed in phase2_mint_alex. Please verify the amount is valid and non-zero")?;

        mint_ALEX_internal(phase2_mint_alex, actual_caller).await?; //mint to actual caller

        mint_ALEX_internal(
            ALEX_PER_THRESHOLD[current_threshold as usize],
            Principal::from_text(librarian).expect("Could not decode the librarian principal."),
        )
        .await?; //mint 1 unit to librarian

        mint_ALEX_internal(
            ALEX_PER_THRESHOLD[current_threshold as usize],
            Principal::from_text(user).expect("Could not decode the principal."),
        )
        .await?; //mint 1 unit to user

        minted_alex = minted_alex
            .checked_add(phase2_mint_alex)
            .ok_or("Arithmetic overflow occurred while adding phase2_mint_alex to minted_alex")?;

        // Increment the total minted ALEX tokens by the ALEX_PER_THRESHOLD amount multiplied by 2
        minted_alex = minted_alex
            .checked_add(
                ALEX_PER_THRESHOLD[current_threshold as usize]
                    .checked_mul(2)
                    .ok_or(
                        "Arithmetic overflow occurred while multiplying ALEX_PER_THRESHOLD by 2",
                    )?,
            )
            .ok_or(
                "Arithmetic overflow occurred while adding ALEX_PER_THRESHOLD * 2 to minted_alex",
            )?;
    } else {
        minted_alex = ALEX_PER_THRESHOLD[current_threshold as usize]
            .checked_mul(lbry_burn)
            .ok_or("Arithmetic overflow occurred in minted_alex")?;
        minted_alex=minted_alex.checked_div(10000).ok_or("Division by 10000 failed in phase2_mint_alex. Please verify the amount is valid and non-zero")?;

        mint_ALEX_internal(minted_alex, actual_caller).await?; //mint to caller 
        
        mint_ALEX_internal(
            ALEX_PER_THRESHOLD[current_threshold as usize],
            Principal::from_text(librarian).expect("Could not decode the librarian principal."),
        )
        .await?; //mint 1 unit to librarian

        mint_ALEX_internal(
            ALEX_PER_THRESHOLD[current_threshold as usize],
            Principal::from_text(user).expect("Could not decode the principal."),
        )
        .await?; //mint 1 unit to user

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
            .ok_or("Arithmetic overflow occurred in mint; TOTAL_ALEX_MINTED")?;
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

    Ok("Ok the value is ".to_string() + &minted_alex.to_string())
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

// #[ic_cdk::update(guard = "is_admin")]
// fn add_caller(principal: Principal) -> Result<String, String> {
//     ALLOWED_CALLERS.with(|callers| callers.borrow_mut().insert(principal));
//     Ok(("Success").to_string())
// }

// #[ic_cdk::update(guard = "is_admin")]
// fn remove_caller(principal: Principal) -> Result<String, String> {
//     ALLOWED_CALLERS.with(|callers| {
//         if callers.borrow_mut().remove(&principal) {
//             Ok("Success".to_string())
//         } else {
//             Err("Principal not found in the allowed callers".to_string())
//         }
//     })
// }
#[init]
fn init() {
    ALLOWED_CALLERS.with(|users| {
        users.borrow_mut().insert(
            Principal::from_text(icp_swap_canister_id).expect("Could not decode the principal."),
        )
    });
}
