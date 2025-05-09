use candid::{CandidType, Deserialize};
use std::collections::HashSet;
use crate::storage::{Item, ItemContent, SHELVES, NFT_SHELVES, ShelfId, SHELF_ITEM_STEP_SIZE, Shelf};
use crate::guard::not_anon;
use crate::auth;
use crate::update::utils::{verify_nft_ownership, is_self_reference};

// --- Constants ---
const MAX_USER_SHELVES: usize = 1000;
const MAX_NFT_REFERENCES: usize = 1000; // Limit for NFT_SHELVES tracking

/// Input structure for adding a new item to a shelf
#[derive(CandidType, Deserialize)]
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

    // 1. Check edit permissions for the parent shelf first
    if !auth::can_edit_shelf(&shelf_id, &caller)? {
        return Err("Unauthorized: You don't have edit permissions for this shelf".to_string());
    }
    
    // 2. Validate NFT ownership if applicable (async)
    if let ItemContent::Nft(ref nft_id) = input.content {
        let is_owner = verify_nft_ownership(nft_id, caller).await?;
        if !is_owner {
            return Err("Unauthorized: You can only add NFTs that you own".to_string());
        }
    }
    
    // 3. Validate shelf existence and prevent self-references
    if let ItemContent::Shelf(ref nested_shelf_id) = input.content {
        // Use immutable read for existence check
        let exists = SHELVES.with(|s| s.borrow().contains_key(nested_shelf_id));
        if !exists {
             return Err(format!("Shelf to be added ('{}') does not exist", nested_shelf_id));
        }

        if is_self_reference(&shelf_id, nested_shelf_id) {
            return Err("Cannot add a shelf to itself".to_string());
        }
    }

    // --- Prepare Updated Data (Read Phase - Immutable Borrows) ---

    let mut maybe_updated_nested_shelf: Option<(ShelfId, Shelf)> = None;
    if let ItemContent::Shelf(ref nested_shelf_id) = input.content {
        // Fetch nested shelf immutably and clone
        let nested_shelf_opt = SHELVES.with(|s| s.borrow().get(nested_shelf_id));
        if let Some(mut nested_shelf) = nested_shelf_opt {
            // Modify the clone
            if !nested_shelf.appears_in.contains(&shelf_id) {
                if nested_shelf.appears_in.len() >= crate::storage::MAX_APPEARS_IN_COUNT {
                    nested_shelf.appears_in.remove(0); // Remove oldest
                }
                nested_shelf.appears_in.push(shelf_id.clone());
                maybe_updated_nested_shelf = Some((nested_shelf_id.clone(), nested_shelf));
            }
            // If appears_in already contains shelf_id, no update needed for nested shelf clone
        } else {
            // This should ideally not happen due to the earlier existence check,
            // but provides robustness against potential race conditions.
            return Err(format!("Nested shelf '{}' not found during preparation phase", nested_shelf_id));
        }
    }

    // Fetch parent shelf immutably and clone
    let mut parent_shelf = SHELVES.with(|s| s.borrow().get(&shelf_id))
        .ok_or_else(|| format!("Parent shelf '{}' not found during preparation phase", shelf_id))?;

    // --- Modify Cloned Data ---

    // Generate new item ID (using the cloned parent_shelf state)
    let new_id = parent_shelf.items.keys()
        .max()
        .map_or(1, |max_id| max_id + 1); // Start from 1 if empty, else increment max u32 ID

    // Create the new item
    let new_item = Item {
        id: new_id,
        content: input.content.clone(),
    };

    // Add the item to the *cloned* parent shelf state
    // Assuming insert_item modifies the shelf in place and returns Result<(), String>
    // And assuming it DOES NOT access global SHELVES
    parent_shelf.insert_item(new_item)?; // Handles MAX_ITEMS check within the cloned struct

    // Position the new item relative to the reference item if provided, using the cloned state
    if let Some(ref_id) = input.reference_item_id {
         // Assuming move_item modifies the shelf in place and returns Result<(), String>
         // And assuming it DOES NOT access global SHELVES
        parent_shelf.move_item(new_id, Some(ref_id), input.before)?; // Modifies cloned struct
    }
    // else: rely on insert_item's default placement within the cloned struct

    // Update timestamp on the clone
    parent_shelf.updated_at = ic_cdk::api::time();


    // --- Write Phase (Single Mutable Borrow) ---
    SHELVES.with(|shelves| {
        let mut shelves_map = shelves.borrow_mut();

        // Insert the updated nested shelf if it was modified
        if let Some((nested_id, updated_nested)) = maybe_updated_nested_shelf {
             // Ensure nested shelf still exists before overwriting (optional robustness check)
            // if !shelves_map.contains_key(&nested_id) {
            //     return Err(format!("Nested shelf '{}' disappeared before write phase", nested_id));
            // }
            shelves_map.insert(nested_id, updated_nested);
        }

        // Insert the updated parent shelf
         // Ensure parent shelf still exists before overwriting (optional robustness check)
        // if !shelves_map.contains_key(&shelf_id) {
        //     return Err(format!("Parent shelf '{}' disappeared before write phase", shelf_id));
        // }
        shelves_map.insert(shelf_id.clone(), parent_shelf); // Insert the fully prepared parent shelf

        // Explicitly specify the error type for the closure's Ok variant
        Ok::<(), String>(()) // Indicate success for the SHELVES.with block
    })?; // Propagate potential errors from the SHELVES block (like out of memory during insert)


    // --- Post-Update (outside the main SHELVES lock) ---

    // Update tracking for NFT references if applicable
    if let ItemContent::Nft(ref nft_id) = input.content {
        NFT_SHELVES.with(|nft_shelves| {
            let mut nft_map = nft_shelves.borrow_mut();
            let mut shelves = nft_map.get(nft_id).unwrap_or_default();
            
            // Check if the shelf ID is already present
            if !shelves.0.contains(&shelf_id) {
                // Check the reference limit *before* adding
                if shelves.0.len() < MAX_NFT_REFERENCES {
                    shelves.0.push(shelf_id.clone());
                    nft_map.insert(nft_id.to_string(), shelves);
                } else {
                    // Silently not adding the shelf to the NFT reference list.
                    // ic_cdk::println!("NFT {} reference limit ({}) reached. Not adding shelf {}.", 
                    //    nft_id, MAX_NFT_REFERENCES, shelf_id);
                }
            }
        });
    }

    Ok(()) // Final success
}

/// Removes a item from an existing shelf
/// 
/// Only users with edit permissions can remove items.
/// This also handles cleanup of any references if the item contained an NFT.
#[ic_cdk::update(guard = "not_anon")]
pub async fn remove_item_from_shelf(shelf_id: ShelfId, item_id: u32) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Check edit permissions first (outside the main logic for clarity)
    if !auth::can_edit_shelf(&shelf_id, &caller)? {
        return Err("Unauthorized: You don't have edit permissions for this shelf".to_string());
    }

    // --- Perform Removal ---
    // We need mutable access to SHELVES for potentially updating nested shelf `appears_in`
    // and the parent shelf's items/positions.
    
    let mut item_content_opt: Option<ItemContent> = None;
    let mut removal_successful = false;

    // First, modify the parent shelf
    SHELVES.with(|shelves_refcell| {
        let mut shelves_map = shelves_refcell.borrow_mut();
        if let Some(mut shelf) = shelves_map.get(&shelf_id).map(|s| s.clone()) { 
            
            // Check if item exists before attempting removal
            if !shelf.items.contains_key(&item_id) {
                // Explicitly return error if item doesn't exist in the primary map
                 return Err(format!("Item {} not found in shelf {}", item_id, shelf_id));
            }

            // Get content before removing from map
            item_content_opt = shelf.items.get(&item_id).map(|item| item.content.clone());

            // Remove from items map
            let removed_item = shelf.items.remove(&item_id); 
            // Remove from position tracker
            let removed_pos = shelf.item_positions.remove(&item_id); 

            // Check consistency (optional but recommended)
            if removed_item.is_some() && removed_pos.is_none() {
                 ic_cdk::println!("WARN: Item {} removed from items map but was missing from position tracker in shelf {}", item_id, shelf_id);
                 // Decide if this is an error or just a warning. Let's treat as warning for now.
            } else if removed_item.is_none() && removed_pos.is_some() {
                 // This case means item was in tracker but not map, indicates prior inconsistency.
                 ic_cdk::println!("WARN: Item {} removed from position tracker but was missing from items map in shelf {}", item_id, shelf_id);
            }

            // If removal from items map succeeded, update shelf and mark success
            if removed_item.is_some() {
                 shelf.updated_at = ic_cdk::api::time();
                 shelves_map.insert(shelf_id.clone(), shelf); // Put modified shelf back
                 removal_successful = true;
                 Ok(()) // Return success from this part of the closure
            } else {
                 // This path means item wasn't in items map, despite check above (shouldn't happen)
                 Err("Failed to remove item from shelf items map.".to_string()) 
            }

        } else {
            Err(format!("Shelf {} not found", shelf_id))
        }
    })?; // Propagate error from SHELVES.with

    // Ensure removal was marked successful before proceeding with side effects
    if !removal_successful {
         // If removal failed above (e.g., shelf not found, item not found), return early.
         // The specific error should have been propagated by the `?` operator.
         // Adding an explicit check just in case.
         return Err("Item removal failed or shelf not found.".to_string()); 
    }


    // --- Handle Side Effects (Post-Removal) ---
    if let Some(item_content) = item_content_opt {
        let shelf_id_ref = &shelf_id; // Borrow shelf_id

        // Handle nested shelf appears_in update
        if let ItemContent::Shelf(ref nested_shelf_id) = item_content {
            SHELVES.with(|shelves_refcell| {
                let mut shelves_map = shelves_refcell.borrow_mut();
                if let Some(mut nested_shelf) = shelves_map.get(nested_shelf_id).map(|s| s.clone()) { 
                    nested_shelf.appears_in.retain(|id| id != shelf_id_ref);
                    shelves_map.insert(nested_shelf_id.clone(), nested_shelf);
                }
            });
        }
        
        // Handle NFT tracking update
        if let ItemContent::Nft(ref nft_id) = item_content {
            NFT_SHELVES.with(|nft_shelves| {
                let mut nft_map = nft_shelves.borrow_mut();
                if let Some(mut shelves) = nft_map.get(nft_id).map(|sv| sv.clone()) { 
                    shelves.0.retain(|id| id != shelf_id_ref);
                    if shelves.0.is_empty() {
                        nft_map.remove(nft_id);
                    } else {
                        nft_map.insert(nft_id.to_string(), shelves);
                    }
                }
            });
        }
    } else {
        // This means item content wasn't retrieved, possibly because the item didn't exist initially.
        // Log or handle as appropriate, though the initial check should prevent this.
        ic_cdk::println!("WARN: Item content not available after removal for item_id {} in shelf {}", item_id, shelf_id);
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

    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf| {
        // 1. Validation: Check if all provided IDs exist in the shelf's *items* map
        let existing_item_ids: HashSet<u32> = shelf.items.keys().cloned().collect();
        let input_item_ids: HashSet<u32> = ordered_item_ids.iter().cloned().collect();

        if input_item_ids.len() != ordered_item_ids.len() {
            return Err("Duplicate item IDs provided in the order list.".to_string());
        }

        // Check for missing IDs (IDs in shelf but not in input)
        let missing_ids: Vec<u32> = existing_item_ids.difference(&input_item_ids).cloned().collect();
        if !missing_ids.is_empty() {
            return Err(format!(
                "Input order is incomplete. Missing item IDs: {:?}",
                missing_ids
            ));
        }

        // Check for extra IDs (IDs in input but not in shelf's items map)
        let extra_ids: Vec<u32> = input_item_ids.difference(&existing_item_ids).cloned().collect();
        if !extra_ids.is_empty() {
            return Err(format!(
                "Input order contains invalid item IDs not found in the shelf: {:?}",
                extra_ids
            ));
        }

        // 2. Clear existing positions using PositionTracker method
        shelf.item_positions.clear();

        // 3. Calculate and set new positions based on the provided order using PositionTracker method
        for (index, item_id) in ordered_item_ids.iter().enumerate() {
            // Calculate position starting from STEP, increasing by STEP
            // Using SHELF_ITEM_STEP_SIZE imported from storage
            let position = (index as f64 + 1.0) * SHELF_ITEM_STEP_SIZE; 
            shelf.item_positions.insert(*item_id, position); // Use insert
        }

        // 4. Update timestamp
        shelf.updated_at = ic_cdk::api::time();

        Ok(())
    })
} 