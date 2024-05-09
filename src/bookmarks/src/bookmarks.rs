// TODO
// Require deduction of a bookmark (payment in ICP) to call it.
// Attribute that bookmark credit deduction to the principal of the book owner.

use candid::{CandidType, Deserialize, Encode, Decode, Principal};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::{borrow::Cow, cell::RefCell};
use std::sync::atomic::{AtomicUsize, Ordering};
use ic_cdk::api::caller;
use ic_cdk_macros::{update, query};

type Memory = VirtualMemory<DefaultMemoryImpl>;

const MAX_BM_SIZE: u32 = 50000;

#[derive(CandidType, Deserialize, Clone)]
pub struct BookMark {
    pub post_id: u64,
    pub ugbn: u64,
    pub author: String,
    pub title: String,
    pub content: String,
    pub cfi: String,
    pub owner: String,
    pub accrued_bookmarks: u64,
    pub claimable_bookmarks: u64,
}

static BM_COUNTER: AtomicUsize = AtomicUsize::new(1);

// Because bookmarks is a custom type, we must specify how it is stored and retrieved.
impl Storable for BookMark {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_BM_SIZE,
        is_fixed_size: false,
    };
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    pub static BM: RefCell<StableBTreeMap<u64, BookMark, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );
}

#[query]
pub fn whoami() -> Principal {
    let principal_from_caller: Principal = caller();
    principal_from_caller
}

#[update]
pub fn save_bm(ugbn: u64, author: String, title: String, content: String, cfi: String) -> u64 {
    let post_id = BM_COUNTER.fetch_add(1, Ordering::SeqCst) as u64;
    let owner = whoami().to_string();
    let card = BookMark {
        post_id,
        ugbn,
        author,
        title,
        content,
        cfi,
        owner,
        accrued_bookmarks: 0,
        claimable_bookmarks: 0,
    };

    BM.with(|cards| cards.borrow_mut().insert(post_id, card));

    post_id
}


#[update]
pub fn delete_bm(post_id: u64) {
  BM.with(|bm| {
        let mut bm = bm.borrow_mut();
        bm.remove(&post_id);
    });
  }

#[query]
pub fn get_bm(post_id: u64) -> Option<BookMark> { 
  BM.with(|bm| bm.borrow().get(&post_id))
}

#[query]
pub fn get_bm_by_title(title: String) -> Vec<BookMark> {
    BM.with(|bm| {
        let bm = bm.borrow();
        bm.iter()
            .map(|(_, bookmark)| bookmark.clone())
            .filter(|bookmark| bookmark.title == title)
            .collect()
    })
}

#[query]
pub fn get_bm_by_author(author: String) -> Vec<BookMark> {
  BM.with(|bm| {
    let bm = bm.borrow();
    bm.iter()
      .map(|(_, bookmark)| bookmark.clone())
      .filter(|bookmark| bookmark.author == author)
      .collect()
  })
}