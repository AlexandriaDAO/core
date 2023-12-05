// // OG -- Since re-integrated in lib.rs



// use candid::{CandidType, Deserialize, Encode, Decode};
// use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
// use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
// use std::{borrow::Cow, cell::RefCell};
// use std::sync::atomic::AtomicUsize;

// type Memory = VirtualMemory<DefaultMemoryImpl>;

// const MAX_SOURCE_CARD_SIZE: u32 = 10000;

// #[derive(CandidType, Deserialize)]
// pub struct SourceCard {
//     pub post_id: u64,
//     pub user_query: String,
//     pub title: String,
//     pub heading: String,
//     pub content: String,
// }

// pub static POST_ID_COUNTER: AtomicUsize = AtomicUsize::new(1);

// // defines how sourcecards can be stored and retrieved.
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

// // Best pattern for isolated storage. MEMORY_MANAGER for memory subsystem encapsulation up to 255
// thread_local! {
//     pub static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
//         RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

//     // pub static USERS: RefCell<StableBTreeMap<UserId, User, DefaultMemoryImpl>> =
//     //     RefCell::new(StableBTreeMap::init(DefaultMemoryImpl::default(0)));

//     pub static SOURCE_CARDS: RefCell<StableBTreeMap<u64, SourceCard, Memory>> = RefCell::new(
//         StableBTreeMap::init(
//             MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
//         )
//     );

//     // Initialize a `StableBTreeMap` with `MemoryId(0)`. The goal is to use map a bookmarked number value to source cards.
//     pub static SOURCE_MAP: RefCell<StableBTreeMap<u128, u128, Memory>> = RefCell::new(
//         StableBTreeMap::init(
//             MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))),
//         )
//     )
// }



