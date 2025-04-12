use candid::{CandidType, Deserialize};
use crate::storage::{Item, ItemContent, SHELVES, NFT_SHELVES, USER_SHELVES, create_shelf, GLOBAL_TIMELINE};
use crate::guard::not_anon;
use crate::auth;
use crate::update::utils::{verify_nft_ownership, shelf_exists, is_self_reference};
use ic_stable_structures::{StableBTreeMap, memory_manager::VirtualMemory};
use ic_stable_structures::DefaultMemoryImpl;

// Define Memory type alias for clarity
type Memory = VirtualMemory<DefaultMemoryImpl>;

/// Input structure for reordering a item within a shelf
#[derive(CandidType, Deserialize)]
pub struct ItemReorderInput {
    /// The ID of the item to move
    pub item_id: u32,
    /// The reference item to position relative to (if None, will be placed at the end)
    pub reference_item_id: Option<u32>,
    /// Whether to place before (true) or after (false) the reference item
    pub before: bool,
}

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

/// Reorders a item within a shelf
/// 
/// This changes the position of an existing item relative to other items.
/// The position can be specified as before or after another item.
#[ic_cdk::update(guard = "not_anon")]
pub fn reorder_shelf_item(shelf_id: String, reorder: ItemReorderInput) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Use the auth helper - update closure to accept the (unused) map argument
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf, _shelves_map| {
        // Use the existing move_item method to handle the reordering
        shelf.move_item(reorder.item_id, reorder.reference_item_id, reorder.before)
    })
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

        // If we added a shelf item, reorder items by popularity
        let is_shelf_item = matches!(input.content, ItemContent::Shelf(_));
        if is_shelf_item {
            // Pass a reference to the already borrowed map
            reorder_shelves_by_popularity(&mut parent_shelf, &*shelves_map);
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
            
            // Avoid duplicates if item already exists somehow? Check needed?
            // For now, assume add implies it wasn't there before for this shelf.
            if !shelves.0.contains(&shelf_id) {
                shelves.0.push(shelf_id.clone());
                nft_map.insert(nft_id.to_string(), shelves);
            }
        });
    }

    Ok(()) // Final success
}

/// Reorders shelf items based on popularity (number of appearances in other shelves)
fn reorder_shelves_by_popularity(
    shelf: &mut crate::storage::Shelf,
    shelves_map_ref: &StableBTreeMap<String, crate::storage::Shelf, Memory>
) {
    // Constant for shelf item positioning
    const SHELF_ITEM_STEP_SIZE: f64 = 1000.0;
    
    // Collect all shelf items with their popularity
    let mut shelf_items: Vec<(u32, usize)> = Vec::new();
    
    for (item_id, item) in &shelf.items {
        if let ItemContent::Shelf(nested_id) = &item.content {
            // Get popularity using the provided map reference, not a new borrow
            let popularity = shelves_map_ref.get(nested_id)
                .map(|nested_shelf| nested_shelf.appears_in.len())
                .unwrap_or(0);
            
            shelf_items.push((*item_id, popularity));
        }
    }
    
    // If no shelf items, just return
    if shelf_items.is_empty() {
        return;
    }
    
    // Sort by popularity (highest first)
    shelf_items.sort_by(|a, b| b.1.cmp(&a.1));
    
    // Separate shelf items from non-shelf items
    let shelf_item_ids: std::collections::HashSet<u32> = shelf_items.iter()
        .map(|(id, _)| *id)
        .collect();
    
    // Gather non-shelf items (preserve their relative order from positions)
    let mut non_shelf_items: Vec<(u32, f64)> = shelf.item_positions.iter()
        .filter(|(id, _)| !shelf_item_ids.contains(id))
        .map(|(id, pos)| (*id, *pos))
        .collect();
    
    // Sort non-shelf items by position
    non_shelf_items.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap());
    
    // Create a new ordering with non-shelf items first, then shelf items by popularity
    let mut all_items: Vec<u32> = non_shelf_items.iter().map(|(id, _)| *id).collect();
    for (id, _) in shelf_items {
        all_items.push(id);
    }
    
    // Evenly distribute positions for all items
    let total_items = all_items.len();
    if total_items > 0 {
        let step = SHELF_ITEM_STEP_SIZE / (total_items as f64 + 1.0);
        let mut current_pos = step;
        
        // Clear existing positions
        shelf.item_positions.clear();
        
        // Assign new positions
        for item_id in all_items {
            shelf.item_positions.insert(item_id, current_pos);
            current_pos += step;
        }
    }
}

/// Removes a item from an existing shelf
/// 
/// Only users with edit permissions can remove items.
/// This also handles cleanup of any references if the item contained an NFT.
#[ic_cdk::update(guard = "not_anon")]
pub async fn remove_item_from_shelf(shelf_id: String, item_id: u32) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Use the auth helper to handle edit permissions check and update
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf, shelves_map| {
        // First, check if the item exists
        let item_opt = shelf.items.get(&item_id);
        if item_opt.is_none() {
            return Err(format!("Item {} not found in shelf {}", item_id, shelf_id));
        }
        
        // Get a clone of the item to use after removal for cleanup operations
        let item_content = item_opt.unwrap().content.clone();
        
        // Flag to track if we're removing a shelf reference
        let is_shelf_item = matches!(item_content, ItemContent::Shelf(_));
        
        // Create a reference to avoid cloning
        let shelf_id_ref = &shelf_id;
        
        // If removing a shelf reference, update its appears_in list
        if let ItemContent::Shelf(ref nested_shelf_id) = item_content {
            SHELVES.with(|shelves| {
                let mut shelves_map = shelves.borrow_mut();
                if let Some(nested_shelf) = shelves_map.get(nested_shelf_id) {
                    let mut nested_shelf = nested_shelf.clone();
                    
                    // Remove this shelf from the nested shelf's appears_in list
                    nested_shelf.appears_in.retain(|id| id != shelf_id_ref);
                    
                    // Save the updated nested shelf
                    shelves_map.insert(nested_shelf_id.clone(), nested_shelf);
                }
            });
        }
        
        // Remove the item
        shelf.items.remove(&item_id);
        shelf.item_positions.remove(&item_id);
        
        // If we removed a shelf item, reorder remaining shelf items by popularity
        if is_shelf_item {
            // Pass the received map reference
            reorder_shelves_by_popularity(shelf, shelves_map);
        }
        
        // Clean up any references if the removed item was an NFT
        if let ItemContent::Nft(ref nft_id) = item_content {
            NFT_SHELVES.with(|nft_shelves| {
                let mut nft_map = nft_shelves.borrow_mut();
                
                // If this NFT is in the tracking map
                if let Some(shelves) = nft_map.get(nft_id) {
                    let mut shelves_clone = shelves.clone();
                    shelves_clone.0.retain(|id| id != shelf_id_ref);
                    
                    // Update or remove the entry
                    if shelves_clone.0.is_empty() {
                        nft_map.remove(nft_id);
                    } else {
                        nft_map.insert(nft_id.to_string(), shelves_clone);
                    }
                }
            });
        }
        
        // Update timestamps
        shelf.updated_at = ic_cdk::api::time();
        
        Ok(())
    })
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
            
            // Reorder shelf items by popularity, passing the map reference
            reorder_shelves_by_popularity(&mut parent_shelf, &*shelves_map);
            
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