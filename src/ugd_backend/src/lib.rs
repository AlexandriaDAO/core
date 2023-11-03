// // // quickstart example of StableBTreeMap, can be used in production storking k:v pairs.

// use ic_cdk_macros::{query, update};
// use ic_stable_structures::{StableBTreeMap};
// use serde::{Deserialize, Serialize};
// use std::cell::RefCell;
// mod memory;
// use memory::Memory;

// // The state of the canister.
// #[derive(Serialize, Deserialize)]
// struct State {
//     // An example `StableBTreeMap`. Data stored in `StableBTreeMap` doesn't need to
//     // be serialized/deserialized in upgrades, so we tell serde to skip it.
//     #[serde(skip, default = "init_stable_data")]
//     stable_data: StableBTreeMap<u128, u128, Memory>,
// }

// thread_local! {
//     static STATE: RefCell<State> = RefCell::new(State::default());
// }

// // Retrieves the value associated with the given key in the stable data if it exists.
// #[query]
// fn stable_get(key: u128) -> Option<u128> {
//     STATE.with(|s| s.borrow().stable_data.get(&key))
// }

// // Inserts an entry into the map and returns the previous value of the key from stable data
// // if it exists.
// #[update]
// fn stable_insert(key: u128, value: u128) -> Option<u128> {
//     STATE
//         .with(|s| s.borrow_mut().stable_data.insert(key, value))
// }

// fn init_stable_data() -> StableBTreeMap<u128, u128, Memory> {
//     StableBTreeMap::init(crate::memory::get_stable_btree_memory())
// }

// impl Default for State {
//     fn default() -> Self {
//         Self {
//             stable_data: init_stable_data(),
//         }
//     }
// }











// // Assets example, basiacally making text the key, and a vector the value (e.g., ebook title --> bianary file).
// // This will likely be used to store ebooks by the title name, maybe images too.
// use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
// use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
// use std::cell::RefCell;

// type Memory = VirtualMemory<DefaultMemoryImpl>;

// thread_local! {
//     // The memory manager is used for simulating multiple memories. Given a `MemoryId` it can
//     // return a memory that can be used by stable structures.
//     static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
//         RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

//     // Initialize a V2 BTreeMap that supports unbounded keys and values.
//     static ASSETS: RefCell<StableBTreeMap<String, Vec<u8>, Memory>> = RefCell::new(
//         StableBTreeMap::init(
//             MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
//         )
//     );
// }

// /// Retrieves the value associated with the given key if it exists.
// #[ic_cdk_macros::query]
// fn get(key: String) -> Option<Vec<u8>> {
//     ASSETS.with(|p| p.borrow().get(&key))
// }

// /// Inserts an asset's name and value in the map, returning the previous value.
// #[ic_cdk_macros::update]
// fn insert(key: String, value: Vec<u8>) -> Option<Vec<u8>> {
//     ASSETS.with(|p| p.borrow_mut().insert(key, value))
// }







// // Custom types example (User Profile)
// use candid::{CandidType, Decode, Deserialize, Encode};
// use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
// use ic_stable_structures::{
//     storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable,
// };
// use std::{borrow::Cow, cell::RefCell};

// type Memory = VirtualMemory<DefaultMemoryImpl>;

// const MAX_VALUE_SIZE: u32 = 100;

// #[derive(CandidType, Deserialize)]
// struct UserProfile {
//     age: u8,
//     name: String,
// }

// // For a type to be used in a `StableBTreeMap`, it needs to implement the `Storable`
// // trait, which specifies how the type can be serialized/deserialized.
// //
// // In this example, we're using candid to serialize/deserialize the struct, but you
// // can use anything as long as you're maintaining backward-compatibility. The
// // backward-compatibility allows you to change your struct over time (e.g. adding
// // new fields).
// //
// // The `Storable` trait is already implemented for several common types (e.g. u64),
// // so you can use those directly without implementing the `Storable` trait for them.
// impl Storable for UserProfile {
//     fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
//         Cow::Owned(Encode!(self).unwrap())
//     }

//     fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
//         Decode!(bytes.as_ref(), Self).unwrap()
//     }

//     const BOUND: Bound = Bound::Bounded {
//         max_size: MAX_VALUE_SIZE,
//         is_fixed_size: false,
//     };
// }

// thread_local! {
//     // The memory manager is used for simulating multiple memories. Given a `MemoryId` it can
//     // return a memory that can be used by stable structures.
//     static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
//         RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

//     static MAP: RefCell<StableBTreeMap<u64, UserProfile, Memory>> = RefCell::new(
//         StableBTreeMap::init(
//             MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
//         )
//     );
// }

// /// Retrieves the value associated with the given key if it exists.
// #[ic_cdk_macros::query]
// fn get(key: u64) -> Option<UserProfile> {
//     MAP.with(|p| p.borrow().get(&key))
// }

// #[ic_cdk_macros::update]
// fn insert(key: u64, value: UserProfile) -> Option<UserProfile> {
//     MAP.with(|p| p.borrow_mut().insert(key, value))
// }
































































// OG


pub mod book_card;
pub mod message_card;
pub mod author_card;
pub mod types;



// use serde::Deserialize;
extern crate serde;

#[derive(Clone, Debug, candid::CandidType, serde::Deserialize)]
pub struct MessageCard {
    pub user_query: String,
    pub message: String,
}

#[ic_cdk::query]
fn mc_front(user_query: String) -> Option<MessageCard> {
    Some(MessageCard {
        user_query,
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...".to_string(),
    })
}












// // Logical strucutre/ideas for later.

// use ic_cdk::export::candid::{CandidType};
// use ic_cdk::api::management_canister::http_request::{HttpHeader, HttpMethod, HttpResponse};
// use ic_cdk::export::candid::Nat;
// use ic_cdk_macros::*;
// use serde_json::json;

// #[derive(Clone, Debug, Default, CandidType)]
// pub struct SocialStats {
//     pub likes: u32,
//     pub stars: u32,
//     pub avg_rating: u32,
//     pub num_ratings: u32,
//     pub num_flags: u32,
//     pub bookmarks: u32,
// }

// #[derive(Clone, Debug, Default, CandidType)]
// pub struct BookCard {
//     pub title: String,
//     pub author: String,
//     pub heading: String,
//     pub summary: String,
//     pub content: String,
//     pub stats: SocialStats,
// }

// pub struct BookCardActor {
//     book_cards: Vec<BookCard>,
// }

// impl BookCardActor {
//     // Initialize with some default data
//     pub fn new() -> Self {
//         let default_card = BookCard {
//             title: String::from("Sample Title"),
//             author: String::from("Sample Author"),
//             heading: String::from("Sample Heading"),
//             summary: String::from("Sample Summary"),
//             content: String::from("Sample Content"),
//             stats: SocialStats::default(),
//         };

//         Self {
//             book_cards: vec![default_card.clone(), default_card.clone(), default_card],
//         }
//     }

//     #[query]
//     pub fn get_book_cards(&self) -> HttpResponse {
//         let body = serde_json::to_string(&self.book_cards).unwrap_or_else(|_| "Error converting to JSON".to_string());

//         HttpResponse {
//             status: Nat::from(200),
//             headers: vec![HttpHeader {
//                 name: "Content-Type".to_string(),
//                 value: "application/json".to_string(),
//             }],
//             body: body.as_bytes().to_vec(),
//         }
//     }
// }

// #[init]
// fn init() {
//     let actor = BookCardActor::new();
//     ic_cdk::storage::put(actor);
// }
