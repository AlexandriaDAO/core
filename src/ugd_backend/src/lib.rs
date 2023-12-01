// ToDo
// Author Name added - Very doable.
// General naming cleanup

// // Not urgent
// Persisted counter - idk
// Delete Card
// Learn VirtualMemory vs. MemoryManager

// mod weaviate;

// use candid::{CandidType, Deserialize, Encode, Decode};
// use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
// use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable}; // Added cell for counter.
// use std::{borrow::Cow, cell::RefCell};
// use std::sync::atomic::{AtomicUsize, Ordering};

// type Memory = VirtualMemory<DefaultMemoryImpl>;

// const MAX_SOURCE_CARD_SIZE: u32 = 50000;

// #[derive(CandidType, Deserialize)]
// struct SourceCard {
//     post_id: u64,
//     user_query: String,
//     title: String,
//     heading: String,
//     content: String,
// }

// // #[derive(CandidType, Deserialize)]
// // struct SourceStats {
// //     post_id: u64,
// //     bookmark: bool,
// // }



// static POST_ID_COUNTER: AtomicUsize = AtomicUsize::new(1);

// // Because sourcecards is a custom type, we must specify how it is stored and retrieved.
// impl Storable for SourceCard {
//     fn to_bytes(&self) -> Cow<[u8]> {
//         Cow::Owned(Encode!(self).unwrap())
//     }

//     fn from_bytes(bytes: Cow<[u8]>) -> Self {
//         Decode!(bytes.as_ref(), Self).unwrap()
//     }

//     const BOUND: Bound = Bound::Bounded {
//         max_size: MAX_SOURCE_CARD_SIZE,
//         is_fixed_size: false,
//     };
// }

// // impl Storable for SourceStats {
// //     fn to_bytes(&self) -> Cow<[u8]> {
// //         Cow::Owned(Encode!(self).unwrap())
// //     }

// //     fn from_bytes(bytes: Cow<[u8]>) -> Self {
// //         Decode!(bytes.as_ref(), Self).unwrap()
// //     }

// //     const BOUND: Bound = Bound::Bounded {
// //         max_size: MAX_SOURCE_CARD_SIZE,
// //         is_fixed_size: false,
// //     };
// // }



// // Best pattern for isolated storage. MEMORY_MANAGER for memory subsystem encapsulation up to 255
// thread_local! {
//     static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
//         RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

//     static SOURCE_CARDS: RefCell<StableBTreeMap<u64, SourceCard, Memory>> = RefCell::new(
//         StableBTreeMap::init(
//             MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
//         )
//     );

//     // static SOURCE_STATS: RefCell<StableBTreeMap<u64, SourceStats, Memory>> = RefCell::new(
//     //     StableBTreeMap::init(
//     //         MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))),
//     //     )
//     // );

// }


// #[ic_cdk_macros::update]
// pub fn save_source_card(user_query: String, title: String, heading: String, content: String) {
//     let post_id = POST_ID_COUNTER.fetch_add(1, Ordering::SeqCst) as u64;
//     let card = SourceCard {
//         post_id,
//         user_query,
//         title,
//         heading,
//         content,
//     };

//     // let stat = SourceStats {
//     //     post_id,
//     //     bookmark: false,
//     // };

//     SOURCE_CARDS.with(|cards| cards.borrow_mut().insert(post_id, card));
//     // SOURCE_STATS.with(|stats| stats.borrow_mut().insert(post_id, stat))
// }

// #[ic_cdk_macros::query]
// fn get_source_card(post_id: u64) -> Option<SourceCard> { 
//     SOURCE_CARDS.with(|cards| cards.borrow().get(&post_id))
//     // SOURCE_STATS.with(|stats| stats.borrow().get(&post_id))
// }





















mod weaviate;

use candid::{CandidType, Deserialize, Encode, Decode};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable}; // Added cell for counter.
use std::{borrow::Cow, cell::RefCell};
use std::sync::atomic::{AtomicUsize, Ordering};

type Memory = VirtualMemory<DefaultMemoryImpl>;

const MAX_SOURCE_CARD_SIZE: u32 = 50000;

#[derive(CandidType, Deserialize)]
struct SourceCard {
    post_id: u64,
    user_query: String,
    title: String,
    heading: String,
    content: String,
    bookmarked: bool,
}


static POST_ID_COUNTER: AtomicUsize = AtomicUsize::new(1);

// Because sourcecards is a custom type, we must specify how it is stored and retrieved.
impl Storable for SourceCard {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_SOURCE_CARD_SIZE,
        is_fixed_size: false,
    };
}



// Best pattern for isolated storage. MEMORY_MANAGER for memory subsystem encapsulation up to 255
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static SOURCE_CARDS: RefCell<StableBTreeMap<u64, SourceCard, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );

}


#[ic_cdk_macros::update]
pub fn save_source_card(user_query: String, title: String, heading: String, content: String) {
    let post_id = POST_ID_COUNTER.fetch_add(1, Ordering::SeqCst) as u64;
    let card = SourceCard {
        post_id,
        user_query,
        title,
        heading,
        content,
        bookmarked: false,
    };

    SOURCE_CARDS.with(|cards| cards.borrow_mut().insert(post_id, card));
}

#[ic_cdk_macros::update]
pub fn toggle_bookmark(post_id: u64) {
    SOURCE_CARDS.with(|cards| {
        let mut cards = cards.borrow_mut();
        if let Some(mut card) = cards.remove(&post_id) {
            card.bookmarked = !card.bookmarked;
            cards.insert(post_id, card);
        }
    });
}


#[ic_cdk_macros::query]
fn get_source_card(post_id: u64) -> Option<SourceCard> { 
    SOURCE_CARDS.with(|cards| cards.borrow().get(&post_id))
}


