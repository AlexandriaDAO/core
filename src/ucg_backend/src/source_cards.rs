use candid::{CandidType, Deserialize, Encode, Decode};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::{borrow::Cow, cell::RefCell};
use std::sync::atomic::{AtomicUsize, Ordering};
use ic_cdk::{query, update};

type Memory = VirtualMemory<DefaultMemoryImpl>;

const MAX_SC_SIZE: u32 = 50000;

#[derive(CandidType, Deserialize)]
pub struct SourceCard {
    pub post_id: u64,
    pub user_query: String,
    pub author: String,
    pub title: String,
    pub heading: String,
    pub content: String,
    pub summary: String,
    pub bookmarked: bool,
}

static SC_COUNTER: AtomicUsize = AtomicUsize::new(1);

// Because sourcecards is a custom type, we must specify how it is stored and retrieved.
impl Storable for SourceCard {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_SC_SIZE,
        is_fixed_size: false,
    };
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static SC: RefCell<StableBTreeMap<u64, SourceCard, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );
}


#[update]
pub fn save_sc(user_query: String, author: String, title: String, heading: String, content: String, summary: String) -> u64 {
    let post_id = SC_COUNTER.fetch_add(1, Ordering::SeqCst) as u64;
    let card = SourceCard {
        post_id,
        user_query,
        author,
        title,
        heading,
        content,
        summary,
        bookmarked: false,
    };

    SC.with(|cards| cards.borrow_mut().insert(post_id, card));

    post_id
}

#[update]
pub fn bookmark_sc(post_id: u64) {
    SC.with(|sc| {
        let mut sc = sc.borrow_mut();
        if let Some(mut c) = sc.remove(&post_id) {
            c.bookmarked = !c.bookmarked;
            sc.insert(post_id, c);
        }
    });
}

#[update]
pub fn delete_sc(post_id: u64) {
    SC.with(|sc| {
        let mut sc = sc.borrow_mut();
        sc.remove(&post_id);
    });
}

#[query]
pub fn get_sc(post_id: u64) -> Option<SourceCard> { 
    SC.with(|sc| sc.borrow().get(&post_id))
}

#[query]
pub fn get_bookmarks() -> Vec<Option<SourceCard>> {
  SC.with(|sc| {
      sc.borrow()
          .iter()
          .filter(|(_key, card)| card.bookmarked)
          .map(|(key, _card)| get_sc(key))
          .collect()
  })
}
