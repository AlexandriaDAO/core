// TODO

/* 
  Easy ones:
    - Favorited Map (existing already):
      - Function to get ones own favorites.
      - Function to get ones favorites in a particular folder.
    - Map for ugbn (done):
      - Query from a list of books, up to 10 of each.
      - Query all from one book.
    - Map for owner hash (done):
      - Query your own, with caller.
      - Query a list, so you can get other people's bookmarks.


  - Users should be able to group their bookmarks & favorites into different folders.
    - Users can have up to 20 different folders. Each of their favorites maps to one or more of them.


  Hard ones:
  - Accrued_bookmarks
    - Query the most-liked posts in a given category.

*/

use candid::{CandidType, Deserialize, Encode, Decode, Principal};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::{borrow::Cow, cell::RefCell};
use ic_cdk::{update, query};

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Deserialize, Clone)]
pub struct BookMark {
    pub post_id: u64,
    pub ugbn: u64,
    pub author: String,
    pub title: String,
    pub content: String,
    pub cfi: String,
    pub owner_hash: u64,
    pub accrued_bookmarks: u64,
    pub claimable_bookmarks: u64,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct UserFavorites {
  pub favorite_ids: Vec<u64>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct UGBN {
  pub ugbn: Vec<u64>
}

impl Storable for BookMark {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for UserFavorites {
  fn to_bytes(&self) -> Cow<[u8]> {
      Cow::Owned(Encode!(self).unwrap())
  }

  fn from_bytes(bytes: Cow<[u8]>) -> Self {
      Decode!(bytes.as_ref(), Self).unwrap()
  }

  const BOUND: Bound = Bound::Unbounded;
}

impl Storable for UGBN {
  fn to_bytes(&self) -> Cow<[u8]> {
      Cow::Owned(Encode!(self).unwrap())
  }

  fn from_bytes(bytes: Cow<[u8]>) -> Self {
      Decode!(bytes.as_ref(), Self).unwrap()
  }

  const BOUND: Bound = Bound::Unbounded;
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // K: owner_hash | V: PostIDs
    pub static BM: RefCell<StableBTreeMap<u64, BookMark, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );

    // K: user principal | V: PostIDs of user's favorites.
    pub static USER_FAVORITES: RefCell<StableBTreeMap<Principal, UserFavorites, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))),
        )
    );

    // K: UGBN | V: PostIDs
    pub static UGBN: RefCell<StableBTreeMap<u64, UGBN, Memory>> = RefCell::new(
      StableBTreeMap::init(
          MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4))),
      )
    );

    // Can we do categories, if there are multiple categories per post, and duplicate categories.?
}










#[update]
pub fn delete_bm(post_id: u64) {
  BM.with(|bm| {
        let mut bm = bm.borrow_mut();
        bm.remove(&post_id);
    });
  }

  
  #[query]
  pub fn get_bm(post_ids: Vec<u64>) -> Vec<Option<BookMark>> {
    assert!(post_ids.len() <= 25, "Maximum of 25 post IDs allowed");

    BM.with(|bm| {
      post_ids
      .iter()
      .map(|post_id| bm.borrow().get(post_id))
      .collect()
    })
  }




// A user can choose to make their profile visible by sharing their owner_hash value.


// // This is important so we don't ever reveal the user's principal, and in knowing the principal, a user verifies ownership.
// fn hash_principal(principal: Principal) -> u64 {
//     let hash = Sha256::digest(principal.as_slice());
//     let mut bytes = [0u8; 8];
//     bytes.copy_from_slice(&hash[..8]); // Turn the first 8 bytes into a u64.
//     u64::from_be_bytes(bytes)
// }




// // These are way to inefficient since they itterate on all values.
  // #[query]
  // pub fn get_user_favorites() -> Vec<Option<BookMark>> {
  //   let caller = caller();
  //   USER_FAVORITES.with(|favorites| {
  //     let favorites = favorites.borrow();
  //     if let Some(user_favorites) = favorites.get(&caller) {
  //       user_favorites.favorite_ids.iter().map(|&post_id| get_bm(post_id)).collect()
  //     } else {
  //       Vec::new()
  //     }
  //   })
  // }
  
  // #[query]
  // pub fn query_bookmarks_by_title(title: String) -> Vec<Option<BookMark>> {
  // let caller = caller();
  // USER_FAVORITES.with(|favorites| {
  //   let favorites = favorites.borrow();
  //   if let Some(user_favorites) = favorites.get(&caller) {
  //     user_favorites.favorite_ids.iter()
  //     .map(|&post_id| get_bm(post_id))
  //     .filter(|bookmark| {
  //       if let Some(bookmark) = bookmark {
  //                   bookmark.title.to_lowercase().contains(&title.to_lowercase())
  //                 } else {
  //                       false
  //                     }
  //               })
  //               .collect()
  //             } else {
  //               Vec::new()
  //             }
  //           })
  //         }