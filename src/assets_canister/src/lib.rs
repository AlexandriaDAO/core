// use candid::{CandidType, Deserialize};
// // use ic_cdk::api::stable::{stable_size, stable_restore};
// use ic_cdk::{query, update};
// use std::collections::HashMap;
// use std::cell::RefCell;

// #[derive(CandidType, Deserialize, Clone)]
// struct Asset {
//     content_type: String,
//     data: Vec<u8>,
//     owner: String,
// }

// thread_local! {
//     static ASSETS: RefCell<HashMap<u64, Asset>> = RefCell::new(HashMap::new());
//     static NEXT_ID: RefCell<u64> = RefCell::new(0);
// }

// #[update]
// fn store_asset_chunk(content_type: String, data_chunk: Vec<u8>) -> u64 {
//     let caller = ic_cdk::caller().to_string();
//     let asset = Asset {
//         content_type,
//         data: data_chunk,
//         owner: caller,
//     };

//     let id = NEXT_ID.with(|next_id| {
//         let current = *next_id.borrow();
//         *next_id.borrow_mut() = current + 1;
//         current
//     });

//     ASSETS.with(|assets| {
//         assets.borrow_mut().insert(id, asset);
//     });

//     id
// }

// #[query]
// fn get_asset(id: u64) -> Option<Asset> {
//     ASSETS.with(|assets| {
//         assets.borrow().get(&id).cloned()
//     })
// }

// #[query]
// fn get_asset_ids() -> Vec<u64> {
//     ASSETS.with(|assets| {
//         assets.borrow().keys().cloned().collect()
//     })
// }

// #[query]
// fn get_owner(id: u64) -> Option<String> {
//     ASSETS.with(|assets| {
//         assets.borrow().get(&id).map(|asset| asset.owner.clone())
//     })
// }
// ic_cdk::export_candid!();

// // Pre-upgrade hook to store the state in stable memory
// // #[pre_upgrade]
// // fn pre_upgrade() {
// //     let assets = ASSETS.with(|assets| assets.borrow().clone());
// //     let next_id = NEXT_ID.with(|next_id| *next_id.borrow());

// //     let state = (assets, next_id);
// //     //stable_save((state,)).unwrap();
// // }

// // Post-upgrade hook to restore the state from stable memory
// // #[post_upgrade]
// // fn post_upgrade() {
// //     let (state,): ((HashMap<u64, Asset>, u64),) = stable_restore().unwrap();
// //     let (assets, next_id) = state;

// //     ASSETS.with(|a| *a.borrow_mut() = assets);
// //     NEXT_ID.with(|n| *n.borrow_mut() = next_id);
// // }

use std::{cell::RefCell, collections::HashMap};

use candid::CandidType;
use ic_cdk::{query, update};
use serde::Deserialize;
#[derive(CandidType, Deserialize, Clone)]
struct Asset {
    content_type: String,
    data: Vec<u8>,        // Can still store the full image data if needed
    chunks: Vec<Vec<u8>>, // This will store the chunks separately
    owner: String,
}

thread_local! {
    static ASSETS: RefCell<HashMap<u64, Asset>> = RefCell::new(HashMap::new());
    static NEXT_ID: RefCell<u64> = RefCell::new(0);
}

// #[update]
// fn store_asset(content_type: String, data: Vec<u8>) -> u64 {
//     let caller = ic_cdk::caller().to_string();
//     let asset = Asset {
//         content_type,
//         chunks: vec![data], // Store the first chunk
//         owner: caller,
//     };

//     let id = NEXT_ID.with(|next_id| {
//         let current = *next_id.borrow();
//         *next_id.borrow_mut() = current + 1;
//         current
//     });

//     ASSETS.with(|assets| {
//         assets.borrow_mut().insert(id, asset);
//     });

//     id
// }

#[update]
fn store_asset_chunk(chunk: Vec<u8>, asset_id: Option<u64>) -> u64 {
    let caller = ic_cdk::caller().to_string();

    // If no asset ID is provided, create a new one
    let asset_id = match asset_id {
        Some(id) => id, // Use the provided asset ID
        None => NEXT_ID.with(|next_id| {
            let current = *next_id.borrow();
            *next_id.borrow_mut() = current + 1;
            current
        }), // Generate a new ID if not provided
    };

    // Retrieve the asset or create a new one if it doesn't exist
    ASSETS.with(|assets| {
        let mut assets = assets.borrow_mut();
        let asset = assets.entry(asset_id).or_insert(Asset {
            content_type: "image/jpeg".to_string(),
            data: Vec::new(),
            chunks: Vec::new(),
            owner: caller,
        });

        // Append the chunk to the asset's chunks
        asset.chunks.push(chunk);
    });

    asset_id
}

#[update]
fn add_asset_chunk(asset_id: u64, chunk: Vec<u8>) {
    ASSETS.with(|assets| {
        if let Some(asset) = assets.borrow_mut().get_mut(&asset_id) {
            asset.chunks.push(chunk); // Add the chunk to the asset
        }
    });
}

#[query]
fn get_asset(id: u64) -> Option<Asset> {
    ASSETS.with(|assets| assets.borrow().get(&id).cloned())
}

#[query]
fn get_asset_ids() -> Vec<u64> {
    ASSETS.with(|assets| assets.borrow().keys().cloned().collect())
}

#[query]
fn get_owner(id: u64) -> Option<String> {
    ASSETS.with(|assets| assets.borrow().get(&id).map(|asset| asset.owner.clone()))
}

ic_cdk::export_candid!();
