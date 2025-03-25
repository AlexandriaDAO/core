use candid::{CandidType, Deserialize, Principal};
use crate::storage::{Slot, SlotContent, SHELVES, NFT_SHELVES, USER_SHELVES, create_shelf, GLOBAL_TIMELINE};
use crate::guard::not_anon;
use crate::auth;
use crate::update::utils::{verify_nft_ownership, shelf_exists, is_self_reference};

/// Input structure for reordering a slot within a shelf
#[derive(CandidType, Deserialize)]
pub struct SlotReorderInput {
    /// The ID of the slot to move
    pub slot_id: u32,
    /// The reference slot to position relative to (if None, will be placed at the end)
    pub reference_slot_id: Option<u32>,
    /// Whether to place before (true) or after (false) the reference slot
    pub before: bool,
}

/// Input structure for adding a new slot to a shelf
#[derive(CandidType, Deserialize)]
pub struct AddSlotInput {
    /// The content of the new slot (NFT, Shelf, or other type)
    pub content: SlotContent,
    /// The reference slot to position relative to (if None, will be placed at the end)
    pub reference_slot_id: Option<u32>,
    /// Whether to place before (true) or after (false) the reference slot
    pub before: bool,
}

/// Reorders a slot within a shelf
/// 
/// This changes the position of an existing slot relative to other slots.
/// The position can be specified as before or after another slot.
#[ic_cdk::update(guard = "not_anon")]
pub fn reorder_shelf_slot(shelf_id: String, reorder: SlotReorderInput) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Use the auth helper to handle edit permissions check and update
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf| {
        // Use the existing move_slot method to handle the reordering
        shelf.move_slot(reorder.slot_id, reorder.reference_slot_id, reorder.before)
    })
}

/// Adds a single slot to an existing shelf
/// 
/// This provides a specific API for adding one slot without
/// needing to replace the entire slot list. The new slot
/// can be positioned relative to existing slots.
#[ic_cdk::update(guard = "not_anon")]
pub async fn add_slot_to_shelf(shelf_id: String, input: AddSlotInput) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Validate NFT ownership if applicable
    if let SlotContent::Nft(nft_id) = &input.content {
        let is_owner = verify_nft_ownership(nft_id, caller).await?;
        if !is_owner {
            return Err("Unauthorized: You can only add NFTs that you own".to_string());
        }
    }
    
    // Validate shelf existence and prevent self-references
    if let SlotContent::Shelf(nested_shelf_id) = &input.content {
        if !shelf_exists(nested_shelf_id) {
            return Err(format!("Shelf '{}' does not exist", nested_shelf_id));
        }
        
        if is_self_reference(&shelf_id, nested_shelf_id) {
            return Err("Cannot add a shelf to itself".to_string());
        }
    }
    
    // Use the auth helper to handle edit permissions check and update
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf| {
        // Generate new slot ID
        let new_id = shelf.slots.keys()
            .max()
            .map_or(1, |max_id| max_id + 1);

        // Create the new slot without position field
        let new_slot = Slot {
            id: new_id,
            content: input.content.clone(),
        };

        // Add the slot
        shelf.insert_slot(new_slot.clone())?;

        // If reference slot is provided, position the new slot relative to it
        if let Some(ref_id) = input.reference_slot_id {
            shelf.move_slot(new_id, Some(ref_id), input.before)?;
        }

        // Update tracking for NFT references if applicable
        if let SlotContent::Nft(nft_id) = &input.content {
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

/// Removes a slot from an existing shelf
/// 
/// Only users with edit permissions can remove slots.
/// This also handles cleanup of any references if the slot contained an NFT.
#[ic_cdk::update(guard = "not_anon")]
pub async fn remove_slot_from_shelf(shelf_id: String, slot_id: u32) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Use the auth helper to handle edit permissions check and update
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf| {
        // First, check if the slot exists
        let slot_opt = shelf.slots.get(&slot_id);
        if slot_opt.is_none() {
            return Err(format!("Slot {} not found in shelf {}", slot_id, shelf_id));
        }
        
        // Get a clone of the slot to use after removal for cleanup operations
        let slot_content = slot_opt.unwrap().content.clone();
        
        // Remove the slot
        shelf.slots.remove(&slot_id);
        
        // Update slot positions (optional, but might help maintain consistency)
        shelf.ensure_balanced_positions();
        
        // Clean up any references if the removed slot was an NFT
        if let SlotContent::Nft(nft_id) = &slot_content {
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

/// Creates a new shelf and adds it as a slot to an existing parent shelf
/// 
/// This is a convenience function that combines shelf creation and
/// slot addition in a single atomic operation.
#[ic_cdk::update(guard = "not_anon")]
pub async fn create_and_add_shelf_slot(
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
            
            // Generate new slot ID
            let new_id = parent_shelf.slots.keys()
                .max()
                .map_or(1, |max_id| max_id + 1);

            // Create the new slot
            let new_slot = Slot {
                id: new_id,
                content: SlotContent::Shelf(new_shelf_id.clone()),
            };

            // Add the slot to parent shelf
            if let Err(e) = parent_shelf.insert_slot(new_slot.clone()) {
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