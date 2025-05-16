use ic_stable_structures::StableBTreeMap;
use std::cell::RefCell;

// Imports from parent storage module
use super::{MEMORY_MANAGER, Memory, MemoryId};

// Import common types from sibling module
use super::common_types::ShelfId;

// Imports from sibling storage module for SHELVES access
use super::shelf_storage::SHELVES; // For refresh_random_shelf_candidates

// Imports for random number generation
use rand_chacha::ChaCha20Rng;
use rand_core::SeedableRng;
use rand::Rng;

// Memory ID
pub(crate) const RANDOM_SHELF_CANDIDATES_MEM_ID: MemoryId = MemoryId::new(18);

thread_local! {
    // K: u32 (index), V: ShelfId
    pub static RANDOM_SHELF_CANDIDATES: RefCell<StableBTreeMap<u32, ShelfId, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(RANDOM_SHELF_CANDIDATES_MEM_ID)))
    );
}

// --- Function to refresh random shelf candidates ---
#[allow(dead_code)]
pub fn refresh_random_shelf_candidates() {
    const K_CANDIDATES: usize = 1000;
    let mut candidate_ids_reservoir: Vec<ShelfId> = Vec::with_capacity(K_CANDIDATES);
    let mut shelves_processed_count: u64 = 0;

    SHELVES.with(|shelves_map_ref| { // Accessing SHELVES from shelf_storage
        let shelves_map = shelves_map_ref.borrow();
        let total_shelves_in_map = shelves_map.len();

        if total_shelves_in_map == 0 {
            ic_cdk::println!("No shelves available to select candidates for random feed.");
            RANDOM_SHELF_CANDIDATES.with(|candidates_map_ref| {
                let mut map = candidates_map_ref.borrow_mut();
                let keys_to_remove: Vec<u32> = map.iter().map(|(k, _)| k).collect();
                for k in keys_to_remove { map.remove(&k); }
            });
            return;
        }

        let mut rng_seed = [0u8; 32];
        let time_bytes = ic_cdk::api::time().to_le_bytes();
        for i in 0..32 {
            rng_seed[i] = time_bytes.get(i).cloned().unwrap_or_else(|| (i as u8).wrapping_add(0xAA));
        }
        let mut prng = ChaCha20Rng::from_seed(rng_seed);

        // Iterate over SHELVES content. Since SHELVES stores ShelfContent, we need to get ShelfId from ShelfMetadata if needed.
        // However, the original code iterated `shelves_map.iter()` where shelves_map was `SHELVES` (ShelfId -> ShelfContent).
        // So, the key of SHELVES is already ShelfId.
        for (shelf_id, _shelf_content) in shelves_map.iter() { 
            shelves_processed_count += 1;
            if candidate_ids_reservoir.len() < K_CANDIDATES {
                candidate_ids_reservoir.push(shelf_id.clone());
            } else {
                let j = prng.gen_range(0..shelves_processed_count);
                if (j as usize) < K_CANDIDATES {
                    candidate_ids_reservoir[j as usize] = shelf_id.clone();
                }
            }
        }
    });

    RANDOM_SHELF_CANDIDATES.with(|candidates_map_ref| {
        let mut candidates_map = candidates_map_ref.borrow_mut();
        let keys_to_remove: Vec<u32> = candidates_map.iter().map(|(k, _)| k).collect();
        for k in keys_to_remove { candidates_map.remove(&k); }

        for (idx, shelf_id) in candidate_ids_reservoir.into_iter().enumerate() {
            candidates_map.insert(idx as u32, shelf_id);
        }
    });
    ic_cdk::println!(
        "Refreshed random shelf candidates. Processed {} shelves, selected {} candidates for the pool.",
        shelves_processed_count,
        RANDOM_SHELF_CANDIDATES.with(|c| c.borrow().len())
    );
} 