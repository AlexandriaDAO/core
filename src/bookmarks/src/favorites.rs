// TODO:

// The get the token burn working. Right now the call is failing because I haven't set up the right arguments/types to icrc1_transfer call.

// The problem right now is if someone removes and adds the favorite again, it's an easy bot attack.

// The next step is using the caller principal so I can get the LBRY burn transaction inside the favorite button.

// The other thing is deciding how to claim:
// - UCG should be distributed in real time for these actions, so no need to use claimable bookmarks.
// - Claimable bookmarks will be used to distribute ICP to token holder, so at the end of the 24 hours, all the non-zero claimable bookmarks will be queried,
//    and factored into the ICP distribution of that day, and then reset. So every favorite action of that day grants a share of that day's ICP dispersment to some book owner.



// Note: Stable structures was not used here because principal type was not in the crate. I think we're okay without it though?

use candid::{CandidType, Deserialize, Principal};
use std::collections::HashMap;
use ic_cdk::api::{call::CallResult, caller};

use crate::bookmarks::{BookMark, get_bm, BM};

const MINTING_ADDRESS: &str = "ie5gv-y6hbb-ll73p-q66aj-4oyzt-tbcuh-odt6h-xkpl7-bwssd-lgzgw-5qe";

#[derive(CandidType, Deserialize)]
pub struct UserFavorites {
    pub user_principal: Principal,
    pub favorite_ids: Vec<u64>,
}

thread_local! {
    static USER_FAVORITES: std::cell::RefCell<HashMap<Principal, UserFavorites>> = std::cell::RefCell::new(HashMap::new());
}

// OG no token burn reqiured for favoriting.

#[ic_cdk_macros::update]
pub fn favorite(post_id: u64) {
    let user_principal = caller();
    USER_FAVORITES.with(|favorites| {
        let mut favorites = favorites.borrow_mut();
        let user_favorites = favorites.entry(user_principal).or_insert(UserFavorites {
            user_principal,
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

#[ic_cdk_macros::update]
pub fn remove_favorite(post_id: u64) {
    let user_principal = caller();
    USER_FAVORITES.with(|favorites| {
        let mut favorites = favorites.borrow_mut();
        if let Some(user_favorites) = favorites.get_mut(&user_principal) {
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

#[ic_cdk_macros::query]
pub fn get_user_favorites() -> Vec<Option<BookMark>> {
    let user_principal = caller();
    USER_FAVORITES.with(|favorites| {
        let favorites = favorites.borrow();
        if let Some(user_favorites) = favorites.get(&user_principal) {
            user_favorites.favorite_ids.iter().map(|&post_id| get_bm(post_id)).collect()
        } else {
            Vec::new()
        }
    })
}

#[ic_cdk_macros::query]
pub fn query_bookmarks_by_title(title: String) -> Vec<Option<BookMark>> {
    let user_principal = caller();
    USER_FAVORITES.with(|favorites| {
        let favorites = favorites.borrow();
        if let Some(user_favorites) = favorites.get(&user_principal) {
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




















// #[derive(CandidType, Deserialize)]
// pub struct TransferArgs {
//     to: TransferDestination,
//     from: Principal,
//     fee: Option<candid::Nat>,
//     memo: Option<Vec<u8>>,
//     from_subaccount: Option<Vec<u8>>,
//     created_at_time: Option<u64>,
//     amount: candid::Nat,
// }

// #[derive(CandidType, Deserialize)]
// pub struct TransferDestination {
//     owner: Principal,
//     subaccount: Option<Vec<u8>>,
// }

// #[ic_cdk_macros::update]
// pub async fn favorite(post_id: u64) -> CallResult<()> {
//     let user_principal = caller();
//     ic_cdk::print(format!("User principal: {}", user_principal));

//     let transfer_args = TransferArgs {
//       to: TransferDestination {
//           owner: Principal::from_text(MINTING_ADDRESS).unwrap(),
//           subaccount: None,
//       },
//       from: user_principal,
//       fee: None,
//       memo: None,
//       from_subaccount: None,
//       created_at_time: None,
//       amount: candid::Nat::from(1_000_000),
//     };

//     let transfer_result = ic_cdk::api::call::call_raw(
//         Principal::from_text("hdtfn-naaaa-aaaam-aciva-cai").unwrap(),
//         "icrc1_transfer",
//         &candid::encode_args((&transfer_args,)).unwrap(),
//         0,
//     )
//     .await;

//     match transfer_result {
//         Ok(result) => {
//             let result_tuple: (candid::Nat,) = candid::decode_one(&result).unwrap();
//             ic_cdk::print(format!(
//                 "Token transfer successful with result: {:?}",
//                 result_tuple.0
//             ));

//             USER_FAVORITES.with(|favorites| {
//                 let mut favorites = favorites.borrow_mut();
//                 let user_favorites = favorites.entry(user_principal).or_insert(UserFavorites {
//                     user_principal,
//                     favorite_ids: Vec::new(),
//                 });

//                 if !user_favorites.favorite_ids.contains(&post_id) {
//                     user_favorites.favorite_ids.push(post_id);

//                     BM.with(|bm| {
//                         let mut bm = bm.borrow_mut();
//                         if let Some(mut bookmark) = bm.remove(&post_id) {
//                             bookmark.accrued_bookmarks += 1;
//                             bookmark.claimable_bookmarks += 1;
//                             bm.insert(post_id, bookmark);
//                         }
//                     });
//                 }
//             });

//             Ok(())
//         }
//         Err((code, message)) => {
//             ic_cdk::print(format!(
//                 "Token transfer failed with code: {:?}, message: {}",
//                 code, message
//             ));
//             Err((code, message))
//         }
//     }
// }



