// TODO

/*
Storage Structs:
  - Favorites - post_id vec
  - UGBN - post_id vec
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

  get_ugbn : get all for a particular book.
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
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::{borrow::Cow, cell::RefCell};

type Memory = VirtualMemory<DefaultMemoryImpl>;
use std::sync::Arc;
use std::sync::Mutex;
pub const THRESHOLDS: [f64; 23] = [
    100.0,
    200.0,
    400.0,
    1000.0,
    2000.0,
    4000.0,
    8000.0,
    16000.0,
    32000.0,
    64000.0,
    128000.0,
    256000.0,
    512000.0,
    1024000.0,
    2048000.0,
    4096000.0,
    8192000.0,
    16384000.0,
    32768000.0,
    65536000.0,
    131072000.0,
    262144000.0,
    524288000.0,
];
pub const UCG_PER_THRESHOLD: [f64; 23] = [
    1000.0, 500.0, 250.0, 125.0, 63.0, 32.0, 16.0, 7.0, 4.0, 2.0, 1.0, 0.5, 0.25, 0.13, 0.06, 0.03,
    0.015, 0.01, 0.0075, 0.005, 0.003, 0.002, 0.0015,
];
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
pub struct UserSaves {
    pub post_id: Vec<u64>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct UserFavorites {
    pub favorite_ids: Vec<u64>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct UGBN {
    pub ugbn: Vec<u64>,
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

    // K: UGBN | V: PostIDs
    pub static UGBN: RefCell<StableBTreeMap<u64, UGBN, Memory>> = RefCell::new(
      StableBTreeMap::init(
          MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6))),
      )
    );

      //Tokenomics
     pub static TOTAL_LBRY_BURNED: Arc<Mutex<f64>> = Arc::new(Mutex::new(0.00));
     pub static CURRENT_THRESHOLD: Arc<Mutex<u32>> = Arc::new(Mutex::new(0));
     pub static TOTAL_UCG_MINTED: Arc<Mutex<f64>> = Arc::new(Mutex::new(0.00));

    // Later we'll do categories.
    // Also do peoples folders.
}
