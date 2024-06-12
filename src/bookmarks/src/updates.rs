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
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};
use icrc_ledger_types::icrc1::{account::Account, transfer::BlockIndex};
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};

use ic_cdk::api::caller;
use ic_cdk::update;

static BM_COUNTER: AtomicUsize = AtomicUsize::new(1);

use num_bigint::BigUint;

#[ic_cdk::update]
pub async fn init_bm(
    ugbn: u64,
    author: String,
    title: String,
    content: String,
    cfi: String,
) -> Result<String, String> {
    ic_cdk::println!("hi I am in init");

    match save_bm(ugbn, author, title, content, cfi).await {
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
    favorite(post_id).await;
    Ok("Success!".to_string())
}

// This is a public function so I can test without LBRY burn. It will be private.
#[update]
pub async fn save_bm(
    ugbn: u64,
    author: String,
    title: String,
    content: String,
    cfi: String,
) -> Result<u64, String> {
    let post_id = BM_COUNTER.fetch_add(1, Ordering::SeqCst) as u64;
    let owner_hash = hash_principal(caller());

    // Stop anything that requires excessive storage.
    assert!(ugbn.to_string().len() <= 20);
    assert!(author.len() <= 200);
    assert!(title.len() <= 250);
    assert!(content.len() <= 4000);
    assert!(cfi.len() <= 500);
    match mint_n_burn(1.0).await {
        Ok(success_msg) => ic_cdk::println!("{}", success_msg),
        Err(err_msg) => return Err(format!("Error during mint_n_burn: {}", err_msg)),
    }
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

    Ok(post_id)

}

// This is a public function so I can test without LBRY burn. It will be private.
#[update]
pub async fn favorite(post_id: u64) {
    let caller = caller();
    mint_n_burn(2.0).await;

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
pub async fn mint_n_burn(lbry_amount: f64) -> Result<String, String> {
    ic_cdk::println!("Ok here am I ?");
    // 1. Asynchronously call another canister function using `ic_cdk::call`.
    let result = ic_cdk::call::<(f64,Principal,), (Result<String, String>,)>(
        Principal::from_text("bkyz2-fmaaa-aaaaa-qaaaq-cai")
            .expect("Could not decode the principal."),
        "burn_n_mint",
        (lbry_amount,caller()),
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