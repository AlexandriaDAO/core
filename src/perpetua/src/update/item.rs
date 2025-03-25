use candid::{CandidType, Deserialize, Principal};
use crate::storage::{Item, ItemContent, SHELVES, NFT_SHELVES, USER_SHELVES, create_shelf, GLOBAL_TIMELINE};
use crate::guard::not_anon;
use crate::auth;
use crate::update::utils::{verify_nft_ownership, shelf_exists, is_self_reference};

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
    
    // Use the auth helper to handle edit permissions check and update
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf| {
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
    
    // Validate NFT ownership if applicable
    if let ItemContent::Nft(nft_id) = &input.content {
        let is_owner = verify_nft_ownership(nft_id, caller).await?;
        if !is_owner {
            return Err("Unauthorized: You can only add NFTs that you own".to_string());
        }
    }
    
    // Validate shelf existence and prevent self-references
    if let ItemContent::Shelf(nested_shelf_id) = &input.content {
        if !shelf_exists(nested_shelf_id) {
            return Err(format!("Shelf '{}' does not exist", nested_shelf_id));
        }
        
        if is_self_reference(&shelf_id, nested_shelf_id) {
            return Err("Cannot add a shelf to itself".to_string());
        }
    }
    
    // Use the auth helper to handle edit permissions check and update
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf| {
        // Generate new item ID
        let new_id = shelf.items.keys()
            .max()
            .map_or(1, |max_id| max_id + 1);

        // Create the new item without position field
        let new_item = Item {
            id: new_id,
            content: input.content.clone(),
        };

        // Add the item
        shelf.insert_item(new_item.clone())?;

        // If reference item is provided, position the new item relative to it
        if let Some(ref_id) = input.reference_item_id {
            shelf.move_item(new_id, Some(ref_id), input.before)?;
        }

        // Update tracking for NFT references if applicable
        if let ItemContent::Nft(nft_id) = &input.content {
            NFT_SHELVES.with(|nft_shelves| {
                let mut nft_map = nft_shelves.borrow_mut();
                let mut shelves = nft_map.get(nft_id).unwrap_or_default();
                shelves.0.push(shelf_id.clone());
                nft_map.insert(nft_id.to_string(), shelves);
            });
        }

        // Check if the shelf needs rebalancing before saving
        shelf.ensure_balanced_positions();

        Ok(())
    })
}

/// Removes a item from an existing shelf
/// 
/// Only users with edit permissions can remove items.
/// This also handles cleanup of any references if the item contained an NFT.
#[ic_cdk::update(guard = "not_anon")]
pub async fn remove_item_from_shelf(shelf_id: String, item_id: u32) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Use the auth helper to handle edit permissions check and update
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf| {
        // First, check if the item exists
        let item_opt = shelf.items.get(&item_id);
        if item_opt.is_none() {
            return Err(format!("Item {} not found in shelf {}", item_id, shelf_id));
        }
        
        // Get a clone of the item to use after removal for cleanup operations
        let item_content = item_opt.unwrap().content.clone();
        
        // Remove the item
        shelf.items.remove(&item_id);
        
        // Update item positions (optional, but might help maintain consistency)
        shelf.ensure_balanced_positions();
        
        // Clean up any references if the removed item was an NFT
        if let ItemContent::Nft(nft_id) = &item_content {
            NFT_SHELVES.with(|nft_shelves| {
                let mut nft_map = nft_shelves.borrow_mut();
                
                // If this NFT is in the tracking map
                if let Some(shelves) = nft_map.get(nft_id) {
                    let mut shelves_clone = shelves.clone();
                    shelves_clone.0.retain(|id| id != &shelf_id);
                    
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
    let shelf = create_shelf(title, description, vec![]).await?;
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
            
            // Check if the shelf needs rebalancing
            parent_shelf.ensure_balanced_positions();
            
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