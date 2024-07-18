// TODO

/*
Storage Structs:
  - Favorites - post_id vec
  - LBN - post_id vec
  - Owner_hash - post_id vec
  - folders???
  - categories - K: 0-99 | Val: post_ids

  - Function to get ones own favorites.
  - Function to get ones favorites in a particular folder.

  - Query from a list of books, up to 10 of each.
  - Query all from one book.

Update Calls:
  bm()
  favorite()

  remove_bm : remove from your own list
  remove_favorite : remove from your own list

  add_folder : create a named folder.
  index_bm : add a post_id to the folder.

  Function that allows you to merge your bookmark accounts by adding the bms of your principal to the lists to a folder.

Query Calls:
  get_bms() - Private function, get all from post_ids

  get_user_bms : get your own.
  get_user_favorites : get your own.

  get_anothers_bms : using the principal only, they can get a user's full collection.

  get_lbn : get all for a particular book.
  get_category : get all for a particular category

Advanced Query Calls:
  nested filtering, e.g., only my bms in a certain category, etc. But these we'll probably do manually with iter().




  - Query your own, with caller.
  - Query a list, so you can get other people's bookmarks.

- Users should be able to group their bookmarks & favorites into different folders.
  - Users can have up to 20 different folders. Each of their favorites maps to one or more of them.

  Hard ones:
  - Accrued_bookmarks
    - Query the most-liked posts in a given category.

*/

use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_cdk::caller;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::{borrow::Cow, cell::RefCell};

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Deserialize, Clone)]
pub struct BookMark {
    pub post_id: u64,
    pub lbn: u64,
    pub author: String,
    pub title: String,
    pub content: String,
    pub cfi: String,
    pub owner_hash: u64,
    owner_principal: Option<Principal>,
    pub accrued_bookmarks: u64,
    pub claimable_bookmarks: u64,
}
impl BookMark {
    pub fn new(post_id: u64, lbn: u64, author: String, title: String, content: String, cfi: String, owner_hash: u64) -> Self {
        BookMark {
            post_id,
            lbn,
            author,
            title,
            content,
            cfi,
            owner_hash,
            owner_principal: Some(caller()), // Wrap with Some
            accrued_bookmarks: 0,
            claimable_bookmarks: 0,
        }
    }
}
impl BookMark {
    pub fn get_owner_principal(&self) -> Option<&Principal> {
        self.owner_principal.as_ref()
    }
}

#[derive(CandidType, Deserialize, Clone)]
pub struct UserSaves {
    pub post_id: Vec<u64>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct UserFavorites {
    pub favorite_ids: Vec<u64>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct LBN {
    pub lbn: Vec<u64>,
}

impl Storable for UserSaves {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
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

impl Storable for LBN {
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

    // K: PostIDs | V: Bookmark Data
    pub static BM: RefCell<StableBTreeMap<u64, BookMark, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );

    // K: Owner Hash | V: PostIDs
    pub static USER_SAVES: RefCell<StableBTreeMap<u64, UserSaves, Memory>> = RefCell::new(
      StableBTreeMap::init(
        MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))),
      )
    );

    // K: user principal | V: PostIDs of user's favorites.
    pub static USER_FAVORITES: RefCell<StableBTreeMap<Principal, UserFavorites, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4))),
        )
    );

    // K: LBN | V: PostIDs
    pub static LBN: RefCell<StableBTreeMap<u64, LBN, Memory>> = RefCell::new(
      StableBTreeMap::init(
          MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6))),
      )
    );


    // Later we'll do categories.
    // Also do peoples folders.
}
