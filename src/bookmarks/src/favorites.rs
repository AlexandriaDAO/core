// TODO:

// The get the token burn working. Right now the call is failing because I haven't set up the right arguments/types to icrc1_transfer call.

// The problem right now is if someone removes and adds the favorite again, it's an easy bot attack.

// The next step is using the caller principal so I can get the LBRY burn transaction inside the favorite button.

// The other thing is deciding how to claim:
// - UCG should be distributed in real time for these actions, so no need to use claimable bookmarks.
// - Claimable bookmarks will be used to distribute ICP to token holder, so at the end of the 24 hours, all the non-zero claimable bookmarks will be queried,
//    and factored into the ICP distribution of that day, and then reset. So every favorite action of that day grants a share of that day's ICP dispersment to some book owner.












use candid::{CandidType, Deserialize, Nat, Principal};
use std::collections::HashMap;
use ic_cdk::api::{call::CallResult, caller};

use ic_ledger_types::{AccountIdentifier, BlockIndex, Memo, Subaccount, Tokens};

use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{NumTokens, TransferArg, TransferError};

use crate::bookmarks::{BookMark, get_bm, BM};
use ic_cdk::{update, query};

const MINTING_ADDRESS: &str = "ie5gv-y6hbb-ll73p-q66aj-4oyzt-tbcuh-odt6h-xkpl7-bwssd-lgzgw-5qe";

#[derive(CandidType, Deserialize)]
pub struct UserFavorites {
    pub caller: Principal,
    pub favorite_ids: Vec<u64>,
}

thread_local! {
    static USER_FAVORITES: std::cell::RefCell<HashMap<Principal, UserFavorites>> = std::cell::RefCell::new(HashMap::new());
}

pub fn principal_to_subaccount(principal_id: &Principal) -> Subaccount {
  let mut subaccount = [0; std::mem::size_of::<Subaccount>()];
  let principal_id = principal_id.as_slice();
  subaccount[0] = principal_id.len().try_into().unwrap();
  subaccount[1..1 + principal_id.len()].copy_from_slice(principal_id);

  Subaccount(subaccount)
}

#[update]
pub async fn init_favorite(post_id: u64) -> Result<BlockIndex, String> {
  let caller = caller();
  let canister_id: Principal = ic_cdk::api::id();
  let account = AccountIdentifier::new(&canister_id, &principal_to_subaccount(&caller));

  let transfer_args = TransferArgs {
    amount: Tokens::from_e8s(1000000),
    to_account: AccountIdentifier::from_hex("a681f259857047fd82f69b9f2eb7aa080e981b3ef349672d6e9a9e3b78e1324a").unwrap(),
};

  ic_cdk::println!("Caller sub-account for deducting LBRY is {}", account);
  burn_lbry(transfer_args).await?;
  ic_cdk::println!("1 LBRY burned! Now favoriting the post.");
  favorite(post_id).await?;
  Ok(44)
}

#[derive(CandidType, Deserialize, Serialize)]
pub struct TransferArgs {
    amount: NumTokens,
    to_account: Account,
}

#[ic_cdk::update]
async fn burn_lbry(args: TransferArgs) -> Result<BlockIndex, String> {
  let transfer_args: TransferArg = TransferArg {
    memo: None,
    amount: args.amount,
    from_subaccount: Some(principal_to_subaccount(&caller)),
    fee: Tokens::from_e8s(10000),
    to: args.to_account,
    created_at_time: None,
  };

  ic_cdk::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
   Principal::from_text("mxzaz-hqaaa-aaaar-qaada-cai")
      .expect("Could not decode the principal."),

      "icrc1_transfer",

      (transfer_args,),
    )
    .await
    .map_err(|e| format!("Failed to call ledger: {:?}", e))?
    .0
    .map_err(|e| format!("ledger transfer error: {:?}", e))  
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













