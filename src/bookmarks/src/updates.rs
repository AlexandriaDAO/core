// NOTE: deploy.txt in project root has some helpful commands for testing/deploying this canister.

// TODO:

// The other thing is deciding how to claim:
// - UCG should be distributed in real time for these actions, so no need to use claimable bookmarks.
// - Claimable bookmarks will be used to distribute ICP to token holder, so at the end of the 24 hours, all the non-zero claimable bookmarks will be queried,
//    and factored into the ICP distribution of that day, and then reset. So every favorite action of that day grants a share of that day's ICP dispersment to some book owner.


// Efficiency improvements todo
// Favorites and bm shouldn't have to look up if the user's list exists each time. We should have a separate function that populates an empty array in all bTrees when a user signs up.
// Cloning overhead in the favorites, especially when the favorite_ids vector gets really big.


use super::utils::{principal_to_subaccount, get_swap_canister_principal, get_swap_canister_subaccount, hash_principal};
use crate::queries::*;

use std::sync::atomic::{AtomicUsize, Ordering};

use candid::{Nat, Principal};
use ic_ledger_types::BlockIndex;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};

use ic_cdk::api::caller;
use ic_cdk::update;

static BM_COUNTER: AtomicUsize = AtomicUsize::new(1);

#[update]
pub async fn init_bookmark(ugbn: u64, author: String, title: String, content: String, cfi: String) -> Result<BlockIndex, String> {
  let caller = caller();
  let amount: u64 = 1000000;
  ic_cdk::println!("Deducting LBRY");
  burn_lbry(caller, amount).await?; // Amount is passed first as u64 because candid doesn't recognize it as Nat, and it must be Nat in transferargs.
  ic_cdk::println!("1 LBRY burned! Now saving the post.");
  save_bm(ugbn, author, title, content, cfi);
  Ok(44)
}

#[update]
pub async fn init_favorite(post_id: u64) -> Result<BlockIndex, String> {
  let caller = caller();
  let amount: u64 = 2000000;
  ic_cdk::println!("Deducting LBRY");
  burn_lbry(caller, amount).await?;
  ic_cdk::println!("2 LBRY burned! Now favoriting the post.");
  favorite(post_id);
  Ok(44)
}

#[ic_cdk::update]
async fn burn_lbry(caller: Principal, amount: u64) -> Result<BlockIndex, String> {
    let account: Account = Account {
        owner: get_swap_canister_principal(), // This assumes the swap canister wallet is the LBRY mint/burn address.
        subaccount: Some(get_swap_canister_subaccount().0),
    };
    ic_cdk::println!("Swap canister account: {:?}", account);

    let caller_subaccount = principal_to_subaccount(&caller).0;
    ic_cdk::println!("Caller subaccount: {:?}", caller_subaccount);

    let fee: u64 = 10000;

    let transfer_args: TransferArg = TransferArg {
        memo: None,
        amount: Nat::from(amount),
        from_subaccount: Some(caller_subaccount),
        fee: Some(Nat::from(fee)),
        to: account,
        created_at_time: None,
    };
    ic_cdk::println!("Transfer arguments: {:?}", transfer_args);

    let icrc_canister_id = Principal::from_text("hdtfn-naaaa-aaaam-aciva-cai")
        .expect("Could not decode the principal.");
    ic_cdk::println!("ICRC Token Canister ID: {:?}", icrc_canister_id);

    let result = ic_cdk::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
        icrc_canister_id,
        "icrc1_transfer",
        (transfer_args,),
    )
    .await;

    ic_cdk::println!("Transfer result: {:?}", result);

    match result {
        Ok(res) => res.0.map_err(|e| format!("ledger transfer error: {:?}", e)),
        Err(e) => Err(format!("Failed to call ledger: {:?}", e)),
    }
}
  
// This is a public function so I can test without LBRY burn. It will be private.
#[update]
pub fn save_bm(ugbn: u64, author: String, title: String, content: String, cfi: String) -> u64 {
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












