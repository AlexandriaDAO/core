// NOTE: deploy.txt in project root has some helpful commands for testing/deploying this canister.

// TODO:

// The other thing is deciding how to claim:
// - UCG should be distributed in real time for these actions, so no need to use claimable bookmarks.
// - Claimable bookmarks will be used to distribute ICP to token holder, so at the end of the 24 hours, all the non-zero claimable bookmarks will be queried,
//    and factored into the ICP distribution of that day, and then reset. So every favorite action of that day grants a share of that day's ICP dispersment to some book owner.

use super::utils::hash_principal;
use crate::storage::*;

use std::sync::atomic::{AtomicUsize, Ordering};

use candid::{Nat, Principal};
// use ic_ledger_types::BlockIndex;
// use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};
use icrc_ledger_types::icrc1::{account::Account, transfer::BlockIndex};
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};

use ic_cdk::api::caller;
use ic_cdk::update;

static BM_COUNTER: AtomicUsize = AtomicUsize::new(1);

use num_bigint::BigUint;


#[update]
pub async fn init_bm(ugbn: u64, author: String, title: String, content: String, cfi: String) -> Result<String, String> {
  let caller = caller();
  let amount: u64 = 1000000;
  ic_cdk::println!("Deducting LBRY");
  burn_lbry(caller, amount).await?; // Amount is passed first as u64 because candid doesn't recognize it as Nat, and it must be Nat in transferargs.
  ic_cdk::println!("1 LBRY burned! Now saving the post.");
  save_bm(ugbn, author, title, content, cfi).await;
  Ok("Success!".to_string())
}

#[update]
pub async fn init_favorite(post_id: u64) -> Result<String, String> {
  let caller = caller();
  let amount: u64 = 2000000;
  ic_cdk::println!("Deducting LBRY");
  burn_lbry(caller, amount).await?;
  ic_cdk::println!("2 LBRY burned! Now favoriting the post.");
  favorite(post_id);
  Ok("Success!".to_string())
}

#[ic_cdk::update]
async fn burn_lbry(caller: Principal, amount: u64) -> Result<BlockIndex, String> {
    //No need of subaccount
    ic_cdk::println!("Caller id is {}", caller);

    let canister_id: Principal = ic_cdk::api::id();
    ic_cdk::println!("Canister id is {}", canister_id);

    // let fee: u64 = 10000;
    let big_int_amount: BigUint = BigUint::from(amount);
    let amount: Nat = Nat(big_int_amount);

    let transfer_from_args = TransferFromArgs {
        // the account we want to transfer tokens from (in this case we assume the caller approved the canister to spend funds on their behalf)
        from: Account::from(ic_cdk::caller()),
        memo: None,
        // the amount we want to transfer
        amount: amount,
        spender_subaccount: None,
        fee: None,
        // the account we want to transfer tokens to
        to: canister_id.into(),
        created_at_time: None,
    };

    ic_cdk::println!("Transfer arguments: {:?}", transfer_from_args);

    let icrc_canister_id = Principal::from_text("c5kvi-uuaaa-aaaaa-qaaia-cai")
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
    .map_err(|e| format!("ledger transfer error {:?}", e))

}
  
  
// This is a public function so I can test without LBRY burn. It will be private.
#[update]
 pub async fn save_bm(ugbn: u64, author: String, title: String, content: String, cfi: String) -> u64 {
  let post_id = BM_COUNTER.fetch_add(1, Ordering::SeqCst) as u64;
  let owner_hash = hash_principal(caller());
  
  // Stop anything that requires excessive storage.
  assert!(ugbn.to_string().len() <= 20);
  assert!(author.len() <= 200);
  assert!(title.len() <= 250);
  assert!(content.len() <= 4000);
  assert!(cfi.len() <= 500);
  
  let card = BookMark {
    post_id,
    ugbn,
    author,
    title,
    content,
    cfi,
    owner_hash,
    accrued_bookmarks: 0,
    claimable_bookmarks: 0,
  };
    
  BM.with(|cards| cards.borrow_mut().insert(post_id, card));

  // Add the post_id to the UGBN BTree
  UGBN.with(|ugbn_map| {
    let mut ugbn_map = ugbn_map.borrow_mut();
    if let Some(ugbn_entry) = ugbn_map.get(&ugbn) {
        // If the UGBN entry exists, insert post_id at the beginning of the list.
        let mut updated_ugbn = ugbn_entry.clone();
        updated_ugbn.ugbn.insert(0, post_id);
        ugbn_map.insert(ugbn, updated_ugbn);
    } else {
        // If the UGBN entry doesn't exist, create a new entry with the post_id
        let new_ugbn_entry = UGBN {
            ugbn: vec![post_id],
        };
        ugbn_map.insert(ugbn, new_ugbn_entry);
    }
  });

  // Add the post_id to the USER_SAVES BTree
  USER_SAVES.with(|user_saves| {
    let mut user_saves = user_saves.borrow_mut();
    if let Some(user_entry) = user_saves.get(&owner_hash) {
        // If the user entry exists, insert post_id at the beginning of the list.
        let mut updated_user_saves = user_entry.clone();
        updated_user_saves.post_id.insert(0, post_id);
        user_saves.insert(owner_hash, updated_user_saves);
    } else {
        // If the user entry doesn't exist, create a new entry with the post_id
        let new_user_entry = UserSaves {
            post_id: vec![post_id],
        };
        user_saves.insert(owner_hash, new_user_entry);
    }
  });
  
  mint_token_ucg().await;
  post_id
}
  
// This is a public function so I can test without LBRY burn. It will be private.
#[update]
pub fn favorite(post_id: u64) {
    let caller = caller();
    USER_FAVORITES.with(|favorites| {
        let mut favorites = favorites.borrow_mut();

        let user_favorites = match favorites.get(&caller) {
            Some(user_favorites) => user_favorites.clone(),
            None => UserFavorites {
                favorite_ids: Vec::new(),
            },
        };

        if !user_favorites.favorite_ids.contains(&post_id) {
            let mut updated_user_favorites = user_favorites.clone();
            updated_user_favorites.favorite_ids.insert(0, post_id);
            favorites.insert(caller, updated_user_favorites);

            BM.with(|bm| {
                let mut bm = bm.borrow_mut();
                if let Some(mut bookmark) = bm.remove(&post_id) {
                    bookmark.accrued_bookmarks += 1;
                    bookmark.claimable_bookmarks += 1;
                    bm.insert(post_id, bookmark);
                }
            });
        }
    });
}

#[ic_cdk::update]
pub async fn mint_token_ucg() -> Result<String, String> {
    let total_ucg: f64 = TOTAL_UCG_MINTED.with(|mint| {
        let mint = mint.lock().unwrap();
        *mint
    });
    let mut minted_ucg = 0.0;
    let mut current_threshold = CURRENT_THRESHOLD.with(|current_threshold| {
        let current_threshold = current_threshold.lock().unwrap();
        *current_threshold
    });
    let total_burned_lbry = TOTAL_LBRY_BURNED.with(|total_burned_lbry| {
        let total_burned_lbry = total_burned_lbry.lock().unwrap();
        *total_burned_lbry
    });
    if total_burned_lbry + 1.0 > THRESHOLDS[current_threshold as usize] {
        current_threshold += 1;
    }
    if current_threshold > (THRESHOLDS.len() as u32 - 1) {
        current_threshold = THRESHOLDS.len() as u32 - 1
    }
    minted_ucg = UCG_PER_THRESHOLD[current_threshold as usize];
    
    // minting 
    let big_int_amount: BigUint = BigUint::from(minted_ucg as u64);
    let amount: Nat = Nat(big_int_amount);

    let transfer_args: TransferArg = TransferArg {
        // can be used to distinguish between transactions
        // the amount we want to transfer
        amount,
        // we want to transfer tokens from the default subaccount of the canister
        from_subaccount: None,
        // if not specified, the default fee for the canister is used
        fee: None,
        // the account we want to transfer tokens to
        to: caller().into(),
        // a timestamp indicating when the transaction was created by the caller; if it is not specified by the caller then this is set to the current ICP time
        created_at_time: None,
        memo: None,
    };

    // 1. Asynchronously call another canister function using `ic_cdk::call`.
    ic_cdk::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
        // 2. Convert a textual representation of a Principal into an actual `Principal` object. The principal is the one we specified in `dfx.json`.
        //    `expect` will panic if the conversion fails, ensuring the code does not proceed with an invalid principal.
        Principal::from_text("cbopz-duaaa-aaaaa-qaaka-cai")
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
    .map_err(|e| format!("ledger transfer error {:?}", e));
    
    ic_cdk::println!(
        "current threshold index is {} minted {}",
        current_threshold,
        minted_ucg
    );
    TOTAL_UCG_MINTED.with(|mint| {
        let mut mint: std::sync::MutexGuard<f64> = mint.lock().unwrap();
        *mint += minted_ucg;
        ic_cdk::println!("Total UCG minted is {}", *mint)
    });
    CURRENT_THRESHOLD.with(|threshold| {
        let mut threshold = threshold.lock().unwrap();
        *threshold = current_threshold;
    });
    TOTAL_LBRY_BURNED.with(|total_burned| {
        let mut total_burned = total_burned.lock().unwrap();
        *total_burned += 1.0;
        ic_cdk::println!("Total LBRY burned is  {}", *total_burned,);
    });
    
    Ok("Ok the value is ".to_string() + &(minted_ucg).to_string())
}












