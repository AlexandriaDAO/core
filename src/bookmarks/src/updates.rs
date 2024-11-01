// NOTE: deploy.txt in project root has some helpful commands for testing/deploying this canister.

// TODO:

// The other thing is deciding how to claim:
// - ALEX should be distributed in real time for these actions, so no need to use claimable bookmarks.
// - Claimable bookmarks will be used to distribute ICP to token holder, so at the end of the 24 hours, all the non-zero claimable bookmarks will be queried,
//    and factored into the ICP distribution of that day, and then reset. So every favorite action of that day grants a share of that day's ICP dispersment to some book owner.

use super::utils::hash_principal;
use crate::storage::*;

use std::sync::atomic::{AtomicUsize, Ordering};

use candid::{Nat, Principal};
// use ic_ledger_types::BlockIndex;
// use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::{account::Account, transfer::BlockIndex};
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};
use ic_cdk::api::caller;
use ic_cdk::update;
use num_bigint::BigUint;
use num_traits::{pow};

static BM_COUNTER: AtomicUsize = AtomicUsize::new(1);
const DECIMALS: usize=8; 
const LBRY_CANISTER_ID: &str = "y33wz-myaaa-aaaap-qkmna-cai";
const TOKENOMICS_CANISTER_ID: &str = "5abki-kiaaa-aaaap-qkmsa-cai";

#[ic_cdk::update]
pub async fn init_bm(
    lbn: u64,
    author: String,
    title: String,
    content: String,
    cfi: String,
) -> Result<String, String> {
    match save_bm(lbn, author, title, content, cfi).await {
        Ok(post_id) => {
            ic_cdk::println!("Bookmark saved with post_id: {}", post_id);
            Ok("Success!".to_string())
        }
        Err(err_msg) => {
            ic_cdk::println!("Error saving bookmark: {}", err_msg);
            Err(format!("Error saving bookmark: {}", err_msg))
        }
    }
}

#[update]
pub async fn init_favorite(post_id: u64) -> Result<String, String> {
    favorite(post_id).await?;
    Ok("Success!".to_string())
}

// This is a public function so I can test without LBRY burn. It will be private.
#[update]
pub async fn save_bm(
    lbn: u64,
    author: String,
    title: String,
    content: String,
    cfi: String,
) -> Result<u64, String> {
    let post_id = BM_COUNTER.fetch_add(1, Ordering::SeqCst) as u64;
    let owner_hash = hash_principal(caller());

    // Stop anything that requires excessive storage.
    assert!(lbn.to_string().len() <= 20);
    assert!(author.len() <= 200);
    assert!(title.len() <= 250);
    assert!(content.len() <= 4000);
    assert!(cfi.len() <= 500);
    let default_nft_owner = match Principal::from_text(TOKENOMICS_CANISTER_ID) {
        Ok(p) => p,
        Err(e) => return Err(format!("Invalid principal: {}", e)),
    };
    match transfer_LBRY(1*pow(10,DECIMALS), default_nft_owner).await {
        Ok(success_msg) => ic_cdk::println!("{}", success_msg),
        Err(err_msg) => return Err(format!("Error during transfer_LBRY: {}", err_msg)),
    }
    let card = BookMark::new(post_id, lbn, author, title, content, cfi, owner_hash);

    BM.with(|cards| cards.borrow_mut().insert(post_id, card));

    // Add the post_id to the LBN BTree
    LBN.with(|lbn_map| {
        let mut lbn_map = lbn_map.borrow_mut();
        if let Some(lbn_entry) = lbn_map.get(&lbn) {
            // If the LBN entry exists, insert post_id at the beginning of the list.
            let mut updated_lbn = lbn_entry.clone();
            updated_lbn.lbn.insert(0, post_id);
            lbn_map.insert(lbn, updated_lbn);
        } else {
            // If the LBN entry doesn't exist, create a new entry with the post_id
            let new_lbn_entry: LBN = LBN {
                lbn: vec![post_id],
            };
            lbn_map.insert(lbn, new_lbn_entry);
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

    Ok(post_id)
}

// This is a public function so I can test without LBRY burn. It will be private.
#[update] 
pub async fn favorite(post_id: u64) -> Result<String, String>  {

    let caller: Principal = caller();
let favorite_owner_principal: Option<candid::Principal> = BM.with(|bm| {
        let mut bm = bm.borrow_mut();
        if let Some(bookmark) = bm.get(&post_id) {
            if let Some(owner_principal) = bookmark.get_owner_principal() {
                return Some(owner_principal.clone());
            } else {
                ic_cdk::println!("Owner principal is not set");
                return None;
            }
        }
        None
    });
    match favorite_owner_principal {
        Some(favorite_owner_principal) => {
            ic_cdk::println!("the owner principal {}.",favorite_owner_principal);
            // transfering 1 LBRY from caller to favorite owner 
            match transfer_LBRY(1*pow(10,DECIMALS), favorite_owner_principal).await {
                Ok(success_msg) =>  ic_cdk::println!("Success"),
                Err(err_msg) => return Err(format!("Error during transfer_LBRY: {}", err_msg)),
            }
        }
        None => {
            ic_cdk::println!("Favorite owner principal not found!");
            return Err("Favorite owner principal not found!".to_string());
        }
    }
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
    Ok("Success".to_string())
    
}

#[ic_cdk::update]
//  // Evan's old code from Adils tokenomics merge conflict
// pub async fn mint_n_burn(lbry_amount: f64) -> Result<String, String> {
//     ic_cdk::println!("Ok here am I ?");
//     // 1. Asynchronously call another canister function using `ic_cdk::call`.
//     let result = ic_cdk::call::<(f64,Principal,), (Result<String, String>,)>(
//         Principal::from_text("5abki-kiaaa-aaaap-qkmsa-cai")
//             .expect("Could not decode the principal."),
//         "burn_n_mint",
//         (lbry_amount,caller()),
//     )
//     .await
//     .map_err(|e| format!("failed to call ledger: {:?}", e));

// Adils new code from tokenomics branch (I'm confused).
async fn transfer_LBRY(amount: u64,destination:Principal) -> Result<BlockIndex, String> {
    let caller: Principal = caller();
    let big_int_amount: BigUint = BigUint::from(amount);
    let amount: Nat = Nat(big_int_amount);

    ic_cdk::println!("Transfering {} tokens from account {}", amount, caller);

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
        to: destination.into(),
        // a timestamp indicating when the transaction was created by the caller; if it is not specified by the caller then this is set to the current ICP time
        created_at_time: None,
    };

    // 1. Asynchronously call another canister function using `ic_cdk::call`.
    ic_cdk::call::<(TransferFromArgs,), (Result<BlockIndex, TransferFromError>,)>(
        // 2. Convert a textual representation of a Principal into an actual `Principal` object. The principal is the one we specified in `dfx.json`.
        //    `expect` will panic if the conversion fails, ensuring the code does not proceed with an invalid principal.
        Principal::from_text(LBRY_CANISTER_ID)
            .expect("Could not decode the principal."),
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