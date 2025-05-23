use candid::{CandidType, Decode, Deserialize, Encode};
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell; // Required for MAP.with, etc.
use std::collections::HashMap; // Using HashMap for intermediate aggregation

// Imports from parent storage module
use super::{MEMORY_MANAGER, Memory, MemoryId};

// Imports from other parts of the crate or sibling modules
use crate::storage::shelf_storage::{SHELF_DATA, ShelfData, ItemContent, get_shelf_data_count};
use crate::storage::common_types::ShelfId;

// No common types needed directly from common_types.rs for StringVec itself

// --- StringVec for NFT shelves ---
#[derive(CandidType, Deserialize, Clone, Debug, Default)]
pub struct StringVec(pub Vec<String>); // Stores ShelfIds associated with an NFT ID

impl Storable for StringVec {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(self).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self { Decode!(bytes.as_ref(), Self).unwrap() }
    const BOUND: Bound = Bound::Unbounded;
}

// Constants
// pub const MAX_NFT_ID_LENGTH: usize = 100; // Max length for NFT IDs (key in NFT_SHELVES)

// Memory ID
pub(crate) const NFT_SHELVES_MEM_ID: MemoryId = MemoryId::new(2);

thread_local! {
    // K: nft_id (String), V: StringVec (list of ShelfIds)
    pub static NFT_SHELVES: RefCell<StableBTreeMap<String, StringVec, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(NFT_SHELVES_MEM_ID)))
    );
} 

// --- Admin functions for reconciliation ---

/// Admin function to rebuild a batch of the NFT_SHELVES map from SHELF_DATA.
/// This should be callable by an authorized principal (e.g., canister controller).
///
/// Args:
/// - `offset`: The starting index for shelves to process from SHELF_DATA.
/// - `limit`: The maximum number of shelves to process in this batch.
/// - `clear_nft_shelves_first`: If true and offset is 0, NFT_SHELVES will be cleared.
///
/// Returns: Result<(u64, u64), String>
/// - Ok((processed_shelves_count, total_shelves_in_data)) if successful.
/// - Err(String) on failure.
pub fn rebuild_nft_shelves_batch_admin(offset: u64, limit: u64, clear_nft_shelves_first: bool) -> Result<(u64, u64), String> {
    let mut processed_shelves_count = 0u64;
    let total_shelves_in_data = get_shelf_data_count(); // Using the function from shelf_storage

    if offset >= total_shelves_in_data && total_shelves_in_data > 0 {
        return Err("Offset is out of bounds.".to_string());
    }
    if limit == 0 {
        return Err("Limit must be greater than 0.".to_string());
    }

    if offset == 0 && clear_nft_shelves_first {
        NFT_SHELVES.with(|ns_ref| 
            *ns_ref.borrow_mut() = StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(NFT_SHELVES_MEM_ID)))
        );
        ic_cdk::println!("NFT_SHELVES cleared for rebuild.");
    }

    let shelf_data_to_process: Vec<(ShelfId, ShelfData)> = SHELF_DATA.with(|sd_ref| {
        sd_ref.borrow()
            .iter()
            .skip(offset as usize)
            .take(limit as usize)
            .map(|(id, data)| (id.clone(), data.clone())) // Clone to work with owned data
            .collect()
    });

    if shelf_data_to_process.is_empty() && total_shelves_in_data > 0 && offset < total_shelves_in_data {
        ic_cdk::println!(
            "Warning: rebuild_nft_shelves_batch_admin - No shelf entries fetched for offset {}, limit {}. Total shelves: {}.",
            offset, limit, total_shelves_in_data
        );
        return Ok((0, total_shelves_in_data));
    } else if shelf_data_to_process.is_empty() && total_shelves_in_data == 0 {
        ic_cdk::println!("No shelves in SHELF_DATA to process for NFT_SHELVES.");
        return Ok((0, total_shelves_in_data));
    }

    // Aggregate NFT findings from the current batch
    // Key: NftId (String), Value: Vec<ShelfId>
    let mut batch_nft_map: HashMap<String, Vec<ShelfId>> = HashMap::new();

    for (shelf_id, shelf_data) in shelf_data_to_process {
        for item in shelf_data.content.items.values() {
            if let ItemContent::Nft(nft_id_str) = &item.content {
                batch_nft_map
                    .entry(nft_id_str.clone())
                    .or_default()
                    .push(shelf_id.clone());
            }
        }
        processed_shelves_count += 1;
    }

    // Update NFT_SHELVES with the aggregated findings from this batch
    // This is an additive approach if clear_nft_shelves_first was false or offset > 0.
    // If a full rebuild is intended, clear_nft_shelves_first should be true for the first call (offset=0).
    NFT_SHELVES.with(|ns_ref| {
        let mut nft_shelves_map = ns_ref.borrow_mut();
        for (nft_id, new_shelf_ids) in batch_nft_map {
            let mut current_shelf_ids = nft_shelves_map.get(&nft_id).map_or_else(Vec::new, |sv| sv.0.clone());
            current_shelf_ids.extend(new_shelf_ids);
            current_shelf_ids.sort(); // Optional: keep them sorted
            current_shelf_ids.dedup(); // Remove duplicates that might arise from multiple batches or existing data
            nft_shelves_map.insert(nft_id, StringVec(current_shelf_ids));
        }
    });

    ic_cdk::println!(
        "Rebuilt NFT_SHELVES batch: {} shelves processed. Offset: {}, Limit: {}. Total shelves in data: {}.",
        processed_shelves_count, offset, limit, total_shelves_in_data
    );
    Ok((processed_shelves_count, total_shelves_in_data))
} 