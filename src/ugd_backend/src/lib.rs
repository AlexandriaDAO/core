mod source_cards;
pub use source_cards::{save_sc, bookmark_sc, delete_sc, get_sc, get_bookmarks};

mod weaviate;
pub use weaviate::get_weaviate_query;

use ic_cdk_macros::{query};


#[query]
pub fn whoami(name: String) -> String {
    format!("Logged in with Principal: {}!", name)
}




// Satilites now introduced as a package from juno.
// So instead of a collection key being the name of the juno account, it could be the principal of the uploader. 
// In this way each uploader has their own collection. That's the plan at least, for now.




































// // Now I have to serialize the books in the frontend, and pass it here as a u8 vector.

// // Proposed methodology for how you can store ebook assets using a BTreeMap.
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
