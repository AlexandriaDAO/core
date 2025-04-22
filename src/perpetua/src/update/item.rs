use candid::{CandidType, Deserialize};
use crate::storage::{Item, ItemContent, SHELVES, NFT_SHELVES, USER_SHELVES, ShelfId, create_shelf, GLOBAL_TIMELINE, SHELF_ITEM_STEP_SIZE};
use crate::guard::not_anon;
use crate::auth;
use crate::update::utils::{verify_nft_ownership, shelf_exists, is_self_reference};
use ic_stable_structures::{StableBTreeMap, memory_manager::VirtualMemory};
use ic_stable_structures::DefaultMemoryImpl;
use std::collections::HashSet;

// --- Constants ---
const MAX_USER_SHELVES: usize = 1000;
const MAX_NFT_REFERENCES: usize = 1000; // Limit for NFT_SHELVES tracking

// Define Memory type alias for clarity
type Memory = VirtualMemory<DefaultMemoryImpl>;

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
    
    // 3. Validate shelf existence and prevent self-references (read-only SHELVES access ok)
    if let ItemContent::Shelf(ref nested_shelf_id) = input.content {
        if !shelf_exists(nested_shelf_id) {
            return Err(format!("Shelf '{}' does not exist", nested_shelf_id));
        }
        
        if is_self_reference(&shelf_id, nested_shelf_id) {
            return Err("Cannot add a shelf to itself".to_string());
        }
    }

    // --- Main Logic: Modify SHELVES within a single critical section ---
    SHELVES.with(|shelves| {
        let mut shelves_map = shelves.borrow_mut();

        // --- Handle Nested Shelf Update (if adding a shelf item) ---
        if let ItemContent::Shelf(ref nested_shelf_id) = input.content {
            // Fetch the nested shelf
            if let Some(nested_shelf) = shelves_map.get(nested_shelf_id) {
                let mut nested_shelf = nested_shelf.clone(); // Clone to modify

                // Update appears_in list
                if !nested_shelf.appears_in.contains(&shelf_id) {
                    // Cap appears_in
                    if nested_shelf.appears_in.len() >= crate::storage::MAX_APPEARS_IN_COUNT {
                        nested_shelf.appears_in.remove(0); // Remove oldest
                    }
                    nested_shelf.appears_in.push(shelf_id.clone());

                    // Save the updated nested shelf back to the map
                    shelves_map.insert(nested_shelf_id.clone(), nested_shelf);
                }
            } else {
                // This should ideally not happen due to the shelf_exists check earlier
                return Err(format!("Nested shelf '{}' disappeared unexpectedly", nested_shelf_id));
            }
        }

        // --- Handle Parent Shelf Update ---
        // Fetch the parent shelf
        let parent_shelf_opt = shelves_map.get(&shelf_id);
        if parent_shelf_opt.is_none() {
            return Err(format!("Parent shelf '{}' not found", shelf_id));
        }
        let mut parent_shelf = parent_shelf_opt.unwrap().clone(); // Clone to modify

        // Generate new item ID
        let new_id = parent_shelf.items.keys()
            .max()
            .map_or(1, |max_id| max_id + 1);

        // Create the new item
        let new_item = Item {
            id: new_id,
            content: input.content.clone(),
        };

        // Add the item to the parent shelf
        parent_shelf.insert_item(new_item)?; // Handles MAX_ITEMS check

        // If reference item is provided, position the new item relative to it
        if let Some(ref_id) = input.reference_item_id {
            parent_shelf.move_item(new_id, Some(ref_id), input.before)?;
        } else {
             // If no reference, ensure it's positioned correctly (e.g., at the end)
             // insert_item already calculates an initial position, but we might need
             // to rebalance or explicitly move it if no reference is given.
             // For now, relying on insert_item's default placement at the end.
             // Consider adding explicit move_item(new_id, None, false) if necessary.
        }

        // Update timestamp
        parent_shelf.updated_at = ic_cdk::api::time();

        // Save the updated parent shelf back to the map
        shelves_map.insert(shelf_id.clone(), parent_shelf);

        Ok(()) // Return success from the SHELVES.with block
    })?; // Propagate errors from the SHELVES block

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

/// Creates a new shelf and adds it as a item to an existing parent shelf
/// 
/// This is a convenience function that combines shelf creation and
/// item addition in a single atomic operation.
#[ic_cdk::update(guard = "not_anon")]
pub async fn create_and_add_shelf_item(
    parent_shelf_id: String,
    title: String,
    description: Option<String>,
) -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    // First, check if the user has edit permissions for the parent shelf
    if !auth::can_edit_shelf(&parent_shelf_id, &caller)? {
        return Err("You don't have edit permissions for the parent shelf".to_string());
    }
    
    // --- Check Shelf Limit Before Creation ---
    let current_shelf_count = USER_SHELVES.with(|user_shelves| {
        user_shelves.borrow()
            .get(&caller)
            .map_or(0, |shelves_set| shelves_set.0.len())
    });

    if current_shelf_count >= MAX_USER_SHELVES {
        return Err(format!("User cannot own more than {} shelves.", MAX_USER_SHELVES));
    }

    // Create a new shelf
    let mut shelf = create_shelf(title, description, vec![], None).await?;
    
    // Initialize appears_in with the parent shelf ID
    shelf.appears_in.push(parent_shelf_id.clone());
    
    let new_shelf_id = shelf.shelf_id.clone();
    
    // Store everything in a single critical section to prevent multiple borrows
    SHELVES.with(|shelves| {
        let mut shelves_map = shelves.borrow_mut();
        
        // First, add the new shelf to SHELVES
        shelves_map.insert(new_shelf_id.clone(), shelf.clone());
        
        // Then, get the parent shelf and modify it
        if let Some(parent_shelf) = shelves_map.get(&parent_shelf_id) {
            // Clone the parent shelf to work with it
            let mut parent_shelf = parent_shelf.clone();
            
            // Generate new item ID
            let new_id = parent_shelf.items.keys()
                .max()
                .map_or(1, |max_id| max_id + 1);

            // Create the new item
            let new_item = Item {
                id: new_id,
                content: ItemContent::Shelf(new_shelf_id.clone()),
            };

            // Add the item to parent shelf
            if let Err(e) = parent_shelf.insert_item(new_item.clone()) {
                return Err(e);
            }
            
            // Update the timestamp
            parent_shelf.updated_at = ic_cdk::api::time();
            
            // Save the updated parent shelf
            shelves_map.insert(parent_shelf_id.clone(), parent_shelf);
            
            Ok(())
        } else {
            Err(format!("Parent shelf with ID '{}' not found", parent_shelf_id))
        }
    })?;
    
    // Now update USER_SHELVES and GLOBAL_TIMELINE which are separate from SHELVES
    let now = ic_cdk::api::time();
    
    USER_SHELVES.with(|user_shelves| {
        let mut user_map = user_shelves.borrow_mut();
        let mut user_shelves_set = user_map.get(&caller).unwrap_or_default();
        user_shelves_set.0.insert((now, new_shelf_id.clone()));
        user_map.insert(caller, user_shelves_set);
    });

    // Add shelf to the global timeline for public discoverability
    GLOBAL_TIMELINE.with(|timeline| {
        let mut timeline_map = timeline.borrow_mut();
        timeline_map.insert(now, new_shelf_id.clone());
    });
    
    Ok(new_shelf_id)
}

/// Sets the absolute order of items within a shelf.
///
/// This replaces the existing item order with the one provided.
/// All item IDs in the input list must exist within the shelf.
#[ic_cdk::update(guard = "not_anon")]
pub fn set_item_order(shelf_id: ShelfId, ordered_item_ids: Vec<u32>) -> Result<(), String> {
    let caller = ic_cdk::caller();

    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf, _shelves_map| {
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