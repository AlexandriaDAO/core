use crate::storage::*;
use candid::{Nat, Principal};
use ic_cdk::init;
use num_traits::pow;
use crate::guard::*;

use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{BlockIndex, TransferArg, TransferError};
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};

#[ic_cdk::update(guard = "is_allowed")]
pub async fn mint_ALEX(lbry_burn: f64, actual_caller: Principal,author:Principal) -> Result<String, String> {
    let mut minted_alex: f64 = 0.0;
    let mut current_threshold = CURRENT_THRESHOLD.with(|current_threshold| {
        let current_threshold: std::sync::MutexGuard<u32> = current_threshold.lock().unwrap();
        *current_threshold
    });
    let total_burned_lbry = TOTAL_LBRY_BURNED.with(|total_burned_lbry| {
        let total_burned_lbry: std::sync::MutexGuard<f64> = total_burned_lbry.lock().unwrap();
        *total_burned_lbry
    });
    if total_burned_lbry + lbry_burn > (LBRY_THRESHOLDS[current_threshold as usize]) {
        let mint_alex_with_current_threshold =
            (LBRY_THRESHOLDS[current_threshold as usize]) - total_burned_lbry;
        let mint_alex_with_incremented_threshold = lbry_burn - mint_alex_with_current_threshold;
        //minting phase 1
        if mint_alex_with_current_threshold > 0.0 {
            let phase1_mint_alex =
                (ALEX_PER_THRESHOLD[current_threshold as usize]) * mint_alex_with_current_threshold;
            mint_ALEX_internal(phase1_mint_alex/2.0, actual_caller).await?; //mint to actual_caller 
            mint_ALEX_internal(phase1_mint_alex/2.0, author).await?; //mint to author 

            minted_alex = phase1_mint_alex;
        }
        current_threshold += 1;
        if current_threshold > (LBRY_THRESHOLDS.len() as u32) - 1 {
            current_threshold = (LBRY_THRESHOLDS.len() as u32) - 1;
        }
        //minting phase 2
        let phase2_mint_alex =
            (ALEX_PER_THRESHOLD[current_threshold as usize]) * mint_alex_with_incremented_threshold;
        mint_ALEX_internal(phase2_mint_alex/2.0, actual_caller).await?;
        mint_ALEX_internal(phase2_mint_alex/2.0, author).await?;


        minted_alex = minted_alex + phase2_mint_alex;
    } else {
        minted_alex = ALEX_PER_THRESHOLD[current_threshold as usize] * lbry_burn;
        mint_ALEX_internal(minted_alex/2.0, actual_caller).await?; //mint to actual_caller 
        mint_ALEX_internal(minted_alex/2.0, author).await?; //mint to author 
    }

    ic_cdk::println!(
        "current threshold index is {} minted {}",
        current_threshold,
        minted_alex
    );
    TOTAL_ALEX_MINTED.with(|mint| {
        let mut mint: std::sync::MutexGuard<f64> = mint.lock().unwrap();
        *mint += minted_alex as f64;
        ic_cdk::println!("Total ALEX minted is {}", *mint)
    });
    CURRENT_THRESHOLD.with(|threshold| {
        let mut threshold = threshold.lock().unwrap();
        *threshold = current_threshold;
    });
    TOTAL_LBRY_BURNED.with(|total_burned: &std::sync::Arc<std::sync::Mutex<f64>>| {
        let mut total_burned = total_burned.lock().unwrap();
        *total_burned += lbry_burn;
        ic_cdk::println!("Total LBRY burned is  {}", *total_burned);
    });

    Ok("Ok the value is ".to_string() + &minted_alex.to_string())
}

#[ic_cdk::update]
async fn mint_ALEX_internal(minted_alex: f64, destinaion: Principal) -> Result<BlockIndex, String> {
    ic_cdk::println!("minting to {}==>{}",minted_alex,destinaion.to_string());
    let amount = Nat::from((minted_alex * pow(10.0, 8)) as u64);
    let transfer_args: TransferArg = TransferArg {
        amount,
        //transfer tokens from the default subaccount of the canister
        from_subaccount: None,
        fee: None,
        to: destinaion.into(),
        created_at_time: None,
        memo: None,
    };
    ic_cdk::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
        Principal::from_text("7hcrm-4iaaa-aaaak-akuka-cai")
            .expect("Could not decode the principal."),
        "icrc1_transfer",
        (transfer_args,),
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    .0
    .map_err(|e| format!("ledger transfer error {:?}", e))
}

#[ic_cdk::update]
async fn burn_lbry(burn_amount: f64, actual_caller: Principal) -> Result<BlockIndex, String> {
    let canister_id: Principal = ic_cdk::api::id(); //assume current current canister is minter
    let amount = Nat::from((burn_amount * pow(10.0, 8)) as u64);

    let transfer_from_args: TransferFromArgs = TransferFromArgs {
        // the account we want to transfer tokens from (in this case we assume the caller approved the canister to spend funds on their behalf)
        from: Account::from(actual_caller),
        memo: None,
        // the amount we want to burn
        amount,
        spender_subaccount: None,
        fee: None,
        to: canister_id.into(),
        created_at_time: None,
    };
    let icrc_canister_id = Principal::from_text("hdtfn-naaaa-aaaam-aciva-cai")
        .expect("Could not decode the principal.");
    ic_cdk::println!("ICRC Token Canister ID: {:?}", icrc_canister_id);

    ic_cdk::call::<(TransferFromArgs,), (Result<BlockIndex, TransferFromError>,)>(
        icrc_canister_id,
        "icrc2_transfer_from",
        (transfer_from_args,),
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    .0
    .map_err(|e: TransferFromError| format!("ledger transfer error {:?}", e))
}


#[ic_cdk::update(guard = "is_admin")]
fn add_caller(principal: Principal) -> Result<String, String> {
    ALLOWED_CALLERS.with(|callers| callers.borrow_mut().insert(principal));
    Ok(("Success").to_string())
}

#[ic_cdk::update(guard = "is_admin")]
fn remove_caller(principal: Principal) -> Result<String, String> {
    ALLOWED_CALLERS.with(|callers| {
        if callers.borrow_mut().remove(&principal) {
            Ok("Success".to_string())
        } else {
            Err("Principal not found in the allowed callers".to_string())
        }
    })
}
#[init]
fn init() {
    ALLOWED_CALLERS.with(|users| users.borrow_mut().insert(Principal::from_text("br5f7-7uaaa-aaaaa-qaaca-cai")
    .expect("Could not decode the principal.")));
}