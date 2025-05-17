use candid::{CandidType, Deserialize};
use std::collections::HashSet;
use crate::storage::{Item, ItemContent, SHELVES, NFT_SHELVES, ShelfId, StringVec, SHELF_METADATA};
use crate::storage::common_types::{MAX_NFT_ID_LENGTH, MAX_ITEMS_PER_SHELF, MAX_MARKDOWN_LENGTH, MAX_APPEARS_IN_COUNT, SHELF_ITEM_STEP_SIZE};
use crate::guard::not_anon;
use crate::update::utils::{verify_nft_ownership};

// --- Constants ---
const MAX_NFT_REFERENCES: usize = 500; // Limit for NFT_SHELVES tracking

/// Input structure for adding a new item to a shelf
#[derive(CandidType, Deserialize, Clone)]
pub struct AddItemInput {
    /// The content of the new item (NFT, Shelf, or other type)
    pub content: ItemContent,
    /// The reference item to position relative to (if None, will be placed at the end)
    pub reference_item_id: Option<u32>,
    /// Whether to place before (true) or after (false) the reference item
    pub before: bool,
}

/// Adds a single item to an existing shelf
/// 
/// Atomically updates parent shelf (content and metadata), 
/// nested shelf metadata (if adding a shelf), and NFT_SHELVES (if adding an NFT).
/// Panics on failure during the commit phase to ensure atomicity.
#[ic_cdk::update(guard = "not_anon")]
pub async fn add_item_to_shelf(shelf_id: String, input: AddItemInput) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let now = ic_cdk::api::time();

    // --- Read & Validate Phase ---

    // 1. Fetch parent shelf metadata and check edit permissions
    let mut parent_metadata = SHELF_METADATA.with(|m| m.borrow().get(&shelf_id))
        .ok_or_else(|| format!("Parent shelf metadata '{}' not found", shelf_id))?;

    if parent_metadata.owner != caller && !parent_metadata.public_editing {
        return Err("Unauthorized: You don't have edit permissions for this shelf".to_string());
    }
    
    // 2. Fetch parent shelf content
    let mut parent_content = SHELVES.with(|s| s.borrow().get(&shelf_id))
        .ok_or_else(|| format!("Parent shelf content '{}' not found", shelf_id))?;

    // 3. Validate MAX_ITEMS_PER_SHELF
    if parent_content.item_positions.len() >= MAX_ITEMS_PER_SHELF {
        return Err(format!("Maximum item limit reached ({}) for shelf {}", MAX_ITEMS_PER_SHELF, shelf_id));
    }

    // 4. Validate input.content and prepare related data for commit
    let mut prepared_nested_metadata: Option<(ShelfId, crate::storage::ShelfMetadata)> = None;
    let mut prepared_nft_shelves_update: Option<(String, StringVec)> = None;

    match &input.content {
        ItemContent::Nft(ref nft_id) => {
            if nft_id.chars().any(|c| !c.is_digit(10)) {
                return Err("Invalid NFT ID: Contains non-digit characters.".to_string());
            }
            if nft_id.len() > MAX_NFT_ID_LENGTH { // Using constant from common_types
                return Err(format!("NFT ID exceeds maximum length of {} characters", MAX_NFT_ID_LENGTH));
            }
            let is_owner = verify_nft_ownership(nft_id, caller).await?;
            if !is_owner {
                return Err("Unauthorized: You can only add NFTs that you own".to_string());
            }
            // Prepare NFT_SHELVES update
            NFT_SHELVES.with(|nft_shelves_map_ref| {
                let map = nft_shelves_map_ref.borrow(); // Read only for now. No borrow_mut needed here.
                let mut shelves_for_nft = map.get(nft_id).unwrap_or_default();
                if !shelves_for_nft.0.contains(&shelf_id) {
                    if shelves_for_nft.0.len() < MAX_NFT_REFERENCES {
                        shelves_for_nft.0.push(shelf_id.clone());
                        prepared_nft_shelves_update = Some((nft_id.to_string(), shelves_for_nft));
                    } else {
                        ic_cdk::println!("NFT {} reference limit ({}) reached for shelf {}. Not adding shelf to NFT_SHELVES.", nft_id, MAX_NFT_REFERENCES, shelf_id);
                        // Not an error, just a log, as per original logic.
                    }
                }
            });
        }
        ItemContent::Shelf(ref nested_shelf_id) => {
            if nested_shelf_id == &shelf_id {
                return Err("Circular reference: A shelf cannot contain itself".to_string());
            }
            let mut nested_meta = SHELF_METADATA.with(|m| m.borrow().get(nested_shelf_id))
                .ok_or_else(|| format!("Shelf to be added ('{}') does not exist", nested_shelf_id))?;
            
            let nested_shelf_content = SHELVES.with(|s| s.borrow().get(nested_shelf_id))
                .ok_or_else(|| format!("Content for shelf to be added ('{}') not found", nested_shelf_id))?;
            
            if nested_shelf_content.items.values().any(|item| 
                matches!(&item.content, ItemContent::Shelf(id_in_nested) if id_in_nested == &shelf_id)
            ) {
                return Err(format!(
                    "Circular reference detected: Shelf '{}' already contains shelf '{}'",
                    nested_shelf_id, shelf_id
                ));
            }

            // Prepare appears_in update for nested shelf
            if !nested_meta.appears_in.contains(&shelf_id) {
                if nested_meta.appears_in.len() >= MAX_APPEARS_IN_COUNT {
                    nested_meta.appears_in.remove(0); // Remove the oldest
                }
                nested_meta.appears_in.push(shelf_id.clone());
                nested_meta.updated_at = now;
                prepared_nested_metadata = Some((nested_shelf_id.clone(), nested_meta));
            }
        }
        ItemContent::Markdown(markdown) => {
            if markdown.len() > MAX_MARKDOWN_LENGTH {
                 return Err(format!("Markdown content exceeds maximum length of {} characters", MAX_MARKDOWN_LENGTH));
            }
        }
    }

    // --- Prepare Phase (Parent Shelf) ---
    let new_item_id = parent_content.items.keys()
        .max()
        .map_or(1, |max_id| max_id + 1);

    let new_item = Item {
        id: new_item_id,
        content: input.content.clone(),
    };

    // Clone parent_content for modification
    let mut prepared_parent_content = parent_content.clone();
    prepared_parent_content.items.insert(new_item_id, new_item);
    let new_position = prepared_parent_content.item_positions.calculate_position(
        input.reference_item_id.as_ref(),
        input.before,
        SHELF_ITEM_STEP_SIZE
    )?;
    prepared_parent_content.item_positions.insert(new_item_id, new_position);

    // Clone parent_metadata for modification
    let mut prepared_parent_metadata = parent_metadata.clone();
    prepared_parent_metadata.updated_at = now;

    // --- Commit Phase ---
    // All inserts into StableBTreeMaps will panic on encoding errors or OOM, ensuring atomicity.

    SHELVES.with(|s| {
        s.borrow_mut().insert(shelf_id.clone(), prepared_parent_content);
    });

    SHELF_METADATA.with(|m| {
        m.borrow_mut().insert(shelf_id.clone(), prepared_parent_metadata);
    });

    if let Some((id, meta)) = prepared_nested_metadata {
        SHELF_METADATA.with(|m| {
            m.borrow_mut().insert(id, meta);
        });
    }

    if let Some((id, string_vec)) = prepared_nft_shelves_update {
        NFT_SHELVES.with(|n| {
            n.borrow_mut().insert(id, string_vec);
        });
    }

    Ok(())
}

/// Removes a item from an existing shelf
/// 
/// Only users with edit permissions can remove items.
/// This also handles cleanup of any references if the item contained an NFT or nested Shelf.
#[ic_cdk::update(guard = "not_anon")]
pub async fn remove_item_from_shelf(shelf_id: ShelfId, item_id: u32) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let now = ic_cdk::api::time(); // Get time once for consistency

    // --- Read & Validate Phase ---
    let mut parent_metadata = SHELF_METADATA.with(|m| m.borrow().get(&shelf_id))
        .ok_or_else(|| format!("Parent shelf metadata '{}' not found for removal", shelf_id))?;

    if parent_metadata.owner != caller && !parent_metadata.public_editing {
        return Err("Unauthorized: You don't have edit permissions for this shelf".to_string());
    }

    let mut parent_content = SHELVES.with(|s| s.borrow().get(&shelf_id))
        .ok_or_else(|| format!("Parent shelf content '{}' not found for removal", shelf_id))?;
    
    let removed_item_content = parent_content.items.get(&item_id).map(|item| item.content.clone())
        .ok_or_else(|| format!("Item {} not found in shelf {}", item_id, shelf_id))?;

    // --- Prepare Phase ---
    let mut prepared_parent_content = parent_content.clone();
    let item_removed_from_map = prepared_parent_content.items.remove(&item_id).is_some();
    let item_removed_from_pos = prepared_parent_content.item_positions.remove(&item_id).is_some();

    if !item_removed_from_map && !item_removed_from_pos {
         // This should have been caught by the .ok_or_else above if item_id was totally absent.
         // This condition means it might be in one but not the other, or logic error.
        return Err(format!("Item {} could not be fully removed from shelf content {}", item_id, shelf_id));
    } else if item_removed_from_map != item_removed_from_pos {
        ic_cdk::println!("WARN: Inconsistent internal state for item {} in shelf {}. Map removal: {}, Pos removal: {}. Proceeding with removal.", 
                         item_id, shelf_id, item_removed_from_map, item_removed_from_pos);
    }
    
    let mut prepared_parent_metadata = parent_metadata.clone();
    prepared_parent_metadata.updated_at = now;

    let mut prepared_nested_metadata_update: Option<(ShelfId, crate::storage::ShelfMetadata)> = None;
    let mut prepared_nft_shelves_update: Option<(String, Option<StringVec>)> = None; // Option<StringVec> to signify removal of key if vec is empty

    match removed_item_content {
        ItemContent::Shelf(ref nested_shelf_id_removed) => {
            SHELF_METADATA.with(|metadata_map_ref| {
                if let Some(mut nested_meta) = metadata_map_ref.borrow().get(nested_shelf_id_removed).map(|m| m.clone()) {
                    let initial_len = nested_meta.appears_in.len();
                    nested_meta.appears_in.retain(|id| id != &shelf_id);
                    if nested_meta.appears_in.len() != initial_len {
                        nested_meta.updated_at = now;
                        prepared_nested_metadata_update = Some((nested_shelf_id_removed.clone(), nested_meta));
                    }
                }
            });
        }
        ItemContent::Nft(ref nft_id) => {
            NFT_SHELVES.with(|nft_shelves_map_ref| {
                if let Some(mut shelves_for_nft) = nft_shelves_map_ref.borrow().get(nft_id).map(|sv| sv.clone()) {
                    let initial_len = shelves_for_nft.0.len();
                    shelves_for_nft.0.retain(|id| id != &shelf_id);
                    if shelves_for_nft.0.is_empty() {
                        prepared_nft_shelves_update = Some((nft_id.to_string(), None)); // Signal removal of key
                    } else if shelves_for_nft.0.len() != initial_len {
                        prepared_nft_shelves_update = Some((nft_id.to_string(), Some(shelves_for_nft)));
                    }
                }
            });
        }
        _ => {} // Markdown or other types require no further cleanup
    }

    // --- Commit Phase ---
    SHELVES.with(|s| {
        s.borrow_mut().insert(shelf_id.clone(), prepared_parent_content);
    });
    SHELF_METADATA.with(|m| {
        m.borrow_mut().insert(shelf_id.clone(), prepared_parent_metadata);
    });

    if let Some((id, meta)) = prepared_nested_metadata_update {
        SHELF_METADATA.with(|m| {
            m.borrow_mut().insert(id, meta);
        });
    }

    if let Some((nft_id_key, string_vec_option)) = prepared_nft_shelves_update {
        NFT_SHELVES.with(|n_map| {
            let mut map = n_map.borrow_mut();
            match string_vec_option {
                Some(string_vec) => map.insert(nft_id_key, string_vec), // Insert updated vec
                None => map.remove(&nft_id_key),                      // Remove key if vec is empty
            };
        });
    }
    
    Ok(())
}

/// Sets the absolute order of items within a shelf.
///
/// This replaces the existing item order with the one provided.
/// All item IDs in the input list must exist within the shelf.
/// This function is refactored for atomicity. It reads, validates, prepares the change,
/// then commits. Panics on commit failure.
#[ic_cdk::update(guard = "not_anon")]
pub fn set_item_order(shelf_id: ShelfId, ordered_item_ids: Vec<u32>) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let now = ic_cdk::api::time();

    // --- Read & Validate Phase ---
    let mut parent_metadata = SHELF_METADATA.with(|m| m.borrow().get(&shelf_id))
        .ok_or_else(|| format!("Shelf metadata for set_item_order ('{}') not found", shelf_id))?;

    if parent_metadata.owner != caller && !parent_metadata.public_editing {
        // Use cloned metadata for auth check before mutable borrow or further processing
        let temp_meta_for_auth = parent_metadata.clone();
         if temp_meta_for_auth.owner != caller && !temp_meta_for_auth.public_editing {
            return Err("Unauthorized: You don't have edit permissions for this shelf".to_string());
        }
    }
    
    let mut parent_content = SHELVES.with(|s| s.borrow().get(&shelf_id))
        .ok_or_else(|| format!("Shelf content for set_item_order ('{}') not found", shelf_id))?;

    // Validation: Check if all provided IDs exist in the shelf's *items* map
    let existing_item_ids_in_content: HashSet<u32> = parent_content.items.keys().cloned().collect();
    let input_item_ids_set: HashSet<u32> = ordered_item_ids.iter().cloned().collect();

    if input_item_ids_set.len() != ordered_item_ids.len() {
        return Err("Duplicate item IDs provided in the order list.".to_string());
    }

    let missing_ids: Vec<u32> = existing_item_ids_in_content.difference(&input_item_ids_set).cloned().collect();
    if !missing_ids.is_empty() {
        return Err(format!(
            "Input order is incomplete for shelf {}. Missing item IDs from content: {:?}",
            shelf_id, missing_ids
        ));
    }

    let extra_ids: Vec<u32> = input_item_ids_set.difference(&existing_item_ids_in_content).cloned().collect();
    if !extra_ids.is_empty() {
        return Err(format!(
            "Input order for shelf {} contains invalid item IDs not found in content: {:?}",
            shelf_id, extra_ids
        ));
    }

    // --- Prepare Phase ---
    let mut prepared_parent_content = parent_content.clone();
    prepared_parent_content.item_positions.clear();
    for (index, item_id) in ordered_item_ids.iter().enumerate() {
        let position = (index as f64 + 1.0) * SHELF_ITEM_STEP_SIZE; 
        prepared_parent_content.item_positions.insert(*item_id, position);
    }

    let mut prepared_parent_metadata = parent_metadata.clone();
    prepared_parent_metadata.updated_at = now;
    
    // --- Commit Phase ---
    SHELVES.with(|s| {
        s.borrow_mut().insert(shelf_id.clone(), prepared_parent_content);
    });
    SHELF_METADATA.with(|m| {
        m.borrow_mut().insert(shelf_id.clone(), prepared_parent_metadata);
    });

    Ok(())
} 