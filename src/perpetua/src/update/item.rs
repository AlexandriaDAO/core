use candid::{CandidType, Deserialize};
use std::collections::HashSet;
use crate::storage::{Item, ItemContent, SHELVES, NFT_SHELVES, ShelfId, SHELF_ITEM_STEP_SIZE, SHELF_METADATA, MAX_ITEMS_PER_SHELF, MAX_NFT_ID_LENGTH, MAX_MARKDOWN_LENGTH, MAX_APPEARS_IN_COUNT};
use crate::guard::not_anon;
use crate::auth::{get_shelf_parts_for_edit_mut };
use crate::update::utils::{verify_nft_ownership};

// --- Constants ---
// const MAX_USER_SHELVES: usize = 1000; // Defined in shelf.rs if needed there
const MAX_NFT_REFERENCES: usize = 1000; // Limit for NFT_SHELVES tracking

/// Input structure for adding a new item to a shelf
#[derive(CandidType, Deserialize, Clone)] // Added Clone
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
/// This provides a specific API for adding one item without
/// needing to replace the entire item list. The new item
/// can be positioned relative to existing items.
#[ic_cdk::update(guard = "not_anon")]
pub async fn add_item_to_shelf(shelf_id: String, input: AddItemInput) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // --- Pre-checks (outside the main SHELVES lock) ---

    // 1. Check edit permissions for the parent shelf first using metadata
    // This doesn't use the _mut auth helper yet, as we might bail early.
    let parent_metadata = SHELF_METADATA.with(|m| m.borrow().get(&shelf_id).map(|meta| meta.clone()))
        .ok_or_else(|| format!("Parent shelf metadata '{}' not found", shelf_id))?;

    if parent_metadata.owner != caller && !parent_metadata.public_editing {
        return Err("Unauthorized: You don't have edit permissions for this shelf".to_string());
    }
    
    // 2. Validate NFT ownership if applicable (async)
    if let ItemContent::Nft(ref nft_id) = input.content {
        // Basic NFT ID validation (moved from Shelf::insert_item)
        if nft_id.chars().any(|c| !c.is_digit(10)) {
            return Err("Invalid NFT ID: Contains non-digit characters.".to_string());
        }
        if nft_id.len() > MAX_NFT_ID_LENGTH {
            return Err(format!("NFT ID exceeds maximum length of {} characters", MAX_NFT_ID_LENGTH));
        }
        let is_owner = verify_nft_ownership(nft_id, caller).await?;
        if !is_owner {
            return Err("Unauthorized: You can only add NFTs that you own".to_string());
        }
    }
    
    // 3. Validate shelf existence and prevent self-references if adding a shelf
    if let ItemContent::Shelf(ref nested_shelf_id) = input.content {
        if nested_shelf_id == &shelf_id {
            return Err("Circular reference: A shelf cannot contain itself".to_string());
        }
        // Check existence from SHELF_METADATA
        let nested_exists = SHELF_METADATA.with(|m| m.borrow().contains_key(nested_shelf_id));
        if !nested_exists {
             return Err(format!("Shelf to be added ('{}') does not exist", nested_shelf_id));
        }

        // Deeper circular reference check (simplified, might need full graph traversal for complex cases)
        let nested_shelf_content = SHELVES.with(|s| s.borrow().get(nested_shelf_id).map(|c| c.clone()))
            .ok_or_else(|| format!("Content for shelf to be added ('{}') not found", nested_shelf_id))?;
        
        if nested_shelf_content.items.values().any(|item| 
            matches!(&item.content, ItemContent::Shelf(id_in_nested) if id_in_nested == &shelf_id)
        ) {
            return Err(format!(
                "Circular reference detected: Shelf '{}' already contains shelf '{}'",
                nested_shelf_id, shelf_id
            ));
        }
    }

    // Markdown length validation (moved from Shelf::insert_item)
    if let ItemContent::Markdown(markdown) = &input.content {
        if markdown.len() > MAX_MARKDOWN_LENGTH {
             return Err(format!("Markdown content exceeds maximum length of {} characters", MAX_MARKDOWN_LENGTH));
        }
    }

    // --- Main Operation using auth helper ---
    get_shelf_parts_for_edit_mut(&shelf_id, &caller, |parent_meta, parent_content| {
        // parent_meta.updated_at will be set by the auth helper

        if parent_content.item_positions.len() >= MAX_ITEMS_PER_SHELF {
            return Err(format!("Maximum item limit reached ({}) for shelf {}", MAX_ITEMS_PER_SHELF, parent_meta.shelf_id));
        }

        let new_id = parent_content.items.keys()
            .max()
            .map_or(1, |max_id| max_id + 1);

        let new_item = Item {
            id: new_id,
            content: input.content.clone(), // Clone input content
        };

        // Insert into ShelfContent.items
        parent_content.items.insert(new_id, new_item);

        // Calculate and insert position into ShelfContent.item_positions
        let new_position = parent_content.item_positions.calculate_position(
            input.reference_item_id.as_ref(),
            input.before,
            SHELF_ITEM_STEP_SIZE
        )?;
        parent_content.item_positions.insert(new_id, new_position);

        Ok(())
    })?;

    // --- Post-Update Side Effects (Outside main lock of parent shelf) ---

    // Update appears_in for nested shelf if a shelf was added
    if let ItemContent::Shelf(ref nested_shelf_id_added) = input.content {
        // We need to fetch, modify, and save the *nested* shelf's metadata
        SHELF_METADATA.with(|metadata_map_ref| {
            let mut metadata_map = metadata_map_ref.borrow_mut();
            if let Some(mut nested_meta) = metadata_map.get(nested_shelf_id_added).map(|m| m.clone()) {
                if !nested_meta.appears_in.contains(&shelf_id) {
                    if nested_meta.appears_in.len() >= MAX_APPEARS_IN_COUNT {
                        // Potentially remove the oldest if limit is strict, or handle as error
                        // For now, let's assume we can just add if not full, or error if strict
                        if nested_meta.appears_in.len() >= MAX_APPEARS_IN_COUNT {
                            // Remove the oldest one to make space
                            nested_meta.appears_in.remove(0);
                        }
                    }
                    nested_meta.appears_in.push(shelf_id.clone());
                    nested_meta.updated_at = ic_cdk::api::time(); // Update nested shelf timestamp
                    metadata_map.insert(nested_shelf_id_added.clone(), nested_meta);
                }
            } else {
                // This would be an inconsistency, as we checked existence before.
                ic_cdk::println!("ERROR: Nested shelf metadata '{}' not found during appears_in update.", nested_shelf_id_added);
            }
        });
    }

    // Update NFT_SHELVES tracking
    if let ItemContent::Nft(ref nft_id) = input.content {
        NFT_SHELVES.with(|nft_shelves_map_ref| {
            let mut nft_map = nft_shelves_map_ref.borrow_mut();
            let mut shelves_for_nft = nft_map.get(nft_id).unwrap_or_default();
            if !shelves_for_nft.0.contains(&shelf_id) {
                if shelves_for_nft.0.len() < MAX_NFT_REFERENCES {
                    shelves_for_nft.0.push(shelf_id.clone());
                    nft_map.insert(nft_id.to_string(), shelves_for_nft);
                } else {
                    ic_cdk::println!("NFT {} reference limit ({}) reached. Not adding shelf {}.", nft_id, MAX_NFT_REFERENCES, shelf_id);
                }
            }
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
    let mut removed_item_content: Option<ItemContent> = None;

    // --- Main Operation using auth helper ---
    get_shelf_parts_for_edit_mut(&shelf_id, &caller, |parent_meta, parent_content| {
        // parent_meta.updated_at will be set by the auth helper

        if !parent_content.items.contains_key(&item_id) {
            return Err(format!("Item {} not found in shelf {}", item_id, parent_meta.shelf_id));
        }

        // Store content for side-effects, then remove
        removed_item_content = parent_content.items.get(&item_id).map(|item| item.content.clone());
        
        let item_removed_from_map = parent_content.items.remove(&item_id).is_some();
        let item_removed_from_pos = parent_content.item_positions.remove(&item_id).is_some();

        if !item_removed_from_map && !item_removed_from_pos {
            // Should have been caught by contains_key check above
            return Err(format!("Item {} not found for removal in shelf {}", item_id, parent_meta.shelf_id));
        } else if item_removed_from_map != item_removed_from_pos {
            // Log inconsistency but proceed if at least one part was removed
            ic_cdk::println!("WARN: Inconsistent removal for item {} in shelf {}. Map: {}, Pos: {}", 
                             item_id, parent_meta.shelf_id, item_removed_from_map, item_removed_from_pos);
        }
        Ok(())
    })?;

    // --- Post-Update Side Effects (Outside main lock of parent shelf) ---
    if let Some(content) = removed_item_content {
        // Handle appears_in for nested shelf
        if let ItemContent::Shelf(ref nested_shelf_id_removed) = content {
            SHELF_METADATA.with(|metadata_map_ref| {
                let mut metadata_map = metadata_map_ref.borrow_mut();
                if let Some(mut nested_meta) = metadata_map.get(nested_shelf_id_removed).map(|m| m.clone()) {
                    let initial_len = nested_meta.appears_in.len();
                    nested_meta.appears_in.retain(|id| id != &shelf_id);
                    if nested_meta.appears_in.len() != initial_len { // Only update if changed
                        nested_meta.updated_at = ic_cdk::api::time();
                        metadata_map.insert(nested_shelf_id_removed.clone(), nested_meta);
                    }
                }
            });
        }

        // Handle NFT_SHELVES tracking update
        if let ItemContent::Nft(ref nft_id) = content {
            NFT_SHELVES.with(|nft_shelves_map_ref| {
                let mut nft_map = nft_shelves_map_ref.borrow_mut();
                if let Some(mut shelves_for_nft) = nft_map.get(nft_id).map(|sv| sv.clone()) { 
                    let initial_len = shelves_for_nft.0.len();
                    shelves_for_nft.0.retain(|id| id != &shelf_id);
                    if shelves_for_nft.0.is_empty() {
                        nft_map.remove(nft_id);
                    } else if shelves_for_nft.0.len() != initial_len { // Only update if changed
                        nft_map.insert(nft_id.to_string(), shelves_for_nft);
                    }
                }
            });
        }
    }

    Ok(())
}

/// Sets the absolute order of items within a shelf.
///
/// This replaces the existing item order with the one provided.
/// All item IDs in the input list must exist within the shelf.
#[ic_cdk::update(guard = "not_anon")]
pub fn set_item_order(shelf_id: ShelfId, ordered_item_ids: Vec<u32>) -> Result<(), String> {
    let caller = ic_cdk::caller();

    get_shelf_parts_for_edit_mut(&shelf_id, &caller, |parent_meta, parent_content| {
        // parent_meta.updated_at will be set by the auth helper

        // 1. Validation: Check if all provided IDs exist in the shelf's *items* map
        let existing_item_ids_in_content: HashSet<u32> = parent_content.items.keys().cloned().collect();
        let input_item_ids_set: HashSet<u32> = ordered_item_ids.iter().cloned().collect();

        if input_item_ids_set.len() != ordered_item_ids.len() {
            return Err("Duplicate item IDs provided in the order list.".to_string());
        }

        // Check for missing IDs (IDs in shelf content but not in input)
        let missing_ids: Vec<u32> = existing_item_ids_in_content.difference(&input_item_ids_set).cloned().collect();
        if !missing_ids.is_empty() {
            return Err(format!(
                "Input order is incomplete for shelf {}. Missing item IDs from content: {:?}",
                parent_meta.shelf_id, missing_ids
            ));
        }

        // Check for extra IDs (IDs in input but not in shelf's items map)
        let extra_ids: Vec<u32> = input_item_ids_set.difference(&existing_item_ids_in_content).cloned().collect();
        if !extra_ids.is_empty() {
            return Err(format!(
                "Input order for shelf {} contains invalid item IDs not found in content: {:?}",
                parent_meta.shelf_id, extra_ids
            ));
        }

        // 2. Clear existing positions in ShelfContent.item_positions
        parent_content.item_positions.clear();

        // 3. Calculate and set new positions based on the provided order
        for (index, item_id) in ordered_item_ids.iter().enumerate() {
            let position = (index as f64 + 1.0) * SHELF_ITEM_STEP_SIZE; 
            parent_content.item_positions.insert(*item_id, position);
        }
        Ok(())
    })
} 