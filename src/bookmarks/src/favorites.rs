// TODO:

// The other thing is deciding how to claim:
// - UCG should be distributed in real time for these actions, so no need to use claimable bookmarks.
// - Claimable bookmarks will be used to distribute ICP to token holder, so at the end of the 24 hours, all the non-zero claimable bookmarks will be queried,
//    and factored into the ICP distribution of that day, and then reset. So every favorite action of that day grants a share of that day's ICP dispersment to some book owner.

use candid::{CandidType, Deserialize, Nat, Principal};
use std::collections::HashMap;
use ic_cdk::api::caller;
use num_bigint::BigUint;

use ic_ledger_types::{BlockIndex, Subaccount};

use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};

use crate::bookmarks::{BookMark, get_bm, BM};
use ic_cdk::{update, query};


#[derive(CandidType, Deserialize)]
pub struct UserFavorites {
    pub caller: Principal,
    pub favorite_ids: Vec<u64>,
}

thread_local! {
    static USER_FAVORITES: std::cell::RefCell<HashMap<Principal, UserFavorites>> = std::cell::RefCell::new(HashMap::new());
}


#[update]
pub async fn init_favorite(post_id: u64) -> Result<BlockIndex, String> {
  let caller = caller();
  ic_cdk::println!("Deducting LBRY");
  burn_lbry(caller).await?;
  ic_cdk::println!("1 LBRY burned! Now favoriting the post.");
  favorite(post_id);
  Ok(44)
}

#[ic_cdk::update]
async fn burn_lbry(caller: Principal) -> Result<BlockIndex, String> {
    ic_cdk::println!("Inside burn_lbry function");

    let amount: Nat = Nat::from(1000000u64);
    let big_int_amount: BigUint = BigUint::from(amount);
    let amount: Nat = Nat(big_int_amount);
    ic_cdk::println!("Amount: {:?}", amount);

    let account: Account = Account {
        owner: get_swap_canister_principal(),
        subaccount: Some(get_swap_canister_subaccount().0),
    };
    ic_cdk::println!("Swap canister account: {:?}", account);

    let nat_fee: Nat = Nat::from(10000u64);
    let big_int_fee: BigUint = BigUint::from(nat_fee);
    let fee: Nat = Nat(big_int_fee);
    ic_cdk::println!("Fee: {:?}", fee);

    let caller_subaccount = principal_to_subaccount(&caller).0;
    ic_cdk::println!("Caller subaccount: {:?}", caller_subaccount);

    let transfer_args: TransferArg = TransferArg {
        memo: None,
        amount: amount,
        from_subaccount: Some(caller_subaccount),
        fee: Some(fee),
        to: account,
        created_at_time: None,
    };
    ic_cdk::println!("Transfer arguments: {:?}", transfer_args);

    let ledger_canister_id = Principal::from_text("hdtfn-naaaa-aaaam-aciva-cai")
        .expect("Could not decode the principal.");
    ic_cdk::println!("Ledger canister ID: {:?}", ledger_canister_id);

    let result = ic_cdk::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
        ledger_canister_id,
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
  
  #[update]
  pub fn favorite(post_id: u64) {
    let caller = caller();
    USER_FAVORITES.with(|favorites| {
      let mut favorites = favorites.borrow_mut();
      let user_favorites = favorites.entry(caller).or_insert(UserFavorites {
        caller,
        favorite_ids: Vec::new(),
      });
      
      if !user_favorites.favorite_ids.contains(&post_id) {
        user_favorites.favorite_ids.push(post_id);
        
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

#[update]
pub fn remove_favorite(post_id: u64) {
  let caller = caller();
  USER_FAVORITES.with(|favorites| {
        let mut favorites = favorites.borrow_mut();
        if let Some(user_favorites) = favorites.get_mut(&caller) {
          if let Some(index) = user_favorites.favorite_ids.iter().position(|&id| id == post_id) {
            user_favorites.favorite_ids.remove(index);
            
            BM.with(|bm| {
              let mut bm = bm.borrow_mut();
              if let Some(mut bookmark) = bm.remove(&post_id) {
                        bookmark.accrued_bookmarks = bookmark.accrued_bookmarks.saturating_sub(1);
                        bookmark.claimable_bookmarks = bookmark.claimable_bookmarks.saturating_sub(1);
                        bm.insert(post_id, bookmark);
                      }
                    });
                  }
                }
              });
  }

  #[query]
  pub fn get_user_favorites() -> Vec<Option<BookMark>> {
    let caller = caller();
    USER_FAVORITES.with(|favorites| {
      let favorites = favorites.borrow();
      if let Some(user_favorites) = favorites.get(&caller) {
        user_favorites.favorite_ids.iter().map(|&post_id| get_bm(post_id)).collect()
      } else {
        Vec::new()
      }
    })
  }
  
  #[query]
  pub fn query_bookmarks_by_title(title: String) -> Vec<Option<BookMark>> {
  let caller = caller();
  USER_FAVORITES.with(|favorites| {
    let favorites = favorites.borrow();
    if let Some(user_favorites) = favorites.get(&caller) {
      user_favorites.favorite_ids.iter()
      .map(|&post_id| get_bm(post_id))
      .filter(|bookmark| {
        if let Some(bookmark) = bookmark {
                    bookmark.title.to_lowercase().contains(&title.to_lowercase())
                  } else {
                        false
                      }
                })
                .collect()
              } else {
                Vec::new()
              }
            })
          }


pub fn principal_to_account(principal_id: &Principal) -> Account {
  let mut subaccount = [0; 32];
  let principal_id = principal_id.as_slice();
  subaccount[0] = principal_id.len().try_into().unwrap();
  subaccount[1..1 + principal_id.len()].copy_from_slice(principal_id);

  Account {
      owner: Principal::from_slice(&subaccount[1..1 + principal_id.len()]),
      subaccount: Some(subaccount),
  }
}
          
pub fn principal_to_subaccount(principal_id: &Principal) -> Subaccount {
  let mut subaccount = [0; std::mem::size_of::<Subaccount>()];
  let principal_id = principal_id.as_slice();
  subaccount[0] = principal_id.len().try_into().unwrap();
  subaccount[1..1 + principal_id.len()].copy_from_slice(principal_id);

  Subaccount(subaccount)
}

fn get_swap_canister_principal() -> Principal {
  Principal::from_text("ie5gv-y6hbb-ll73p-q66aj-4oyzt-tbcuh-odt6h-xkpl7-bwssd-lgzgw-5qe")
      .expect("Could not decode the principal.")
}

fn get_swap_canister_subaccount() -> Subaccount {
  principal_to_subaccount(&get_swap_canister_principal())
}