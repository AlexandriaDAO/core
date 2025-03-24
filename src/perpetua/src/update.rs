use candid::{CandidType, Deserialize, Nat, Principal};
use crate::storage::{Slot, SlotContent, SHELVES, NFT_SHELVES, USER_SHELVES, create_shelf, GLOBAL_TIMELINE};
use crate::guard::not_anon;
use crate::auth;
use ic_cdk::api::call::CallResult;
use icrc_ledger_types::icrc1::account::Account;
use std::str::FromStr;


#[ic_cdk::update(guard = "not_anon")]
pub async fn store_shelf(
    title: String,
    description: Option<String>,
    slots: Vec<Slot>,
) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let shelf = create_shelf(title, description, slots).await?;  // Remove owner parameter
    let shelf_id = shelf.shelf_id.clone();
    let now = shelf.created_at;

    // Store NFT references
    for slot in shelf.slots.values() {
        if let SlotContent::Nft(nft_id) = &slot.content {
            NFT_SHELVES.with(|nft_shelves| {
                let mut nft_map = nft_shelves.borrow_mut();
                let mut shelves = nft_map.get(nft_id).unwrap_or_default();
                shelves.0.push(shelf_id.clone());
                nft_map.insert(nft_id.to_string(), shelves);
            });
        }
    }

    SHELVES.with(|shelves| {
        shelves.borrow_mut().insert(shelf_id.clone(), shelf.clone());
    });

    USER_SHELVES.with(|user_shelves| {
        let mut user_map = user_shelves.borrow_mut();
        let mut user_shelves_set = user_map.get(&caller).unwrap_or_default();
        user_shelves_set.0.insert((now, shelf_id.clone()));
        user_map.insert(caller, user_shelves_set);
    });

    // Add shelf to the global timeline for public discoverability
    GLOBAL_TIMELINE.with(|timeline| {
        let mut timeline_map = timeline.borrow_mut();
        timeline_map.insert(now, shelf_id.clone());
    });

    Ok(shelf_id)
}

#[derive(CandidType, Deserialize)]
pub struct ShelfUpdate {
    pub title: Option<String>,
    pub description: Option<String>,
    pub slots: Option<Vec<Slot>>,
}

#[derive(CandidType, Deserialize)]
pub struct SlotReorderInput {
    pub slot_id: u32,
    pub reference_slot_id: Option<u32>,
    pub before: bool,
}

#[ic_cdk::update(guard = "not_anon")]
pub fn reorder_shelf_slot(shelf_id: String, reorder: SlotReorderInput) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Use the auth helper to handle edit permissions check and update
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf| {
        // Use the existing move_slot method to handle the reordering
        shelf.move_slot(reorder.slot_id, reorder.reference_slot_id, reorder.before)
    })
}

#[derive(CandidType, Deserialize)]
pub struct AddSlotInput {
    pub content: SlotContent,
    pub reference_slot_id: Option<u32>,
    pub before: bool,
}

/// Checks if an NFT (either original or SBT) is owned by the caller
async fn verify_nft_ownership(nft_id: &str, caller: Principal) -> Result<bool, String> {
    // First validate that we have a proper NFT ID format
    // NFT IDs should be numerical and quite long
    if !nft_id.chars().all(|c| c.is_digit(10)) {
        return Err(format!("Invalid NFT ID format: '{}'. The ID must be numeric. You may be trying to use an Arweave transaction ID instead of the actual NFT ID.", nft_id));
    }
    
    // Additional length validation (NFT IDs are typically very long numbers)
    if nft_id.len() < 10 {
        return Err(format!("Invalid NFT ID: '{}'. NFT IDs are typically long numeric strings (>10 digits).", nft_id));
    }
    
    // Use different canister based on ID length
    // SBTs have longer IDs (95 chars) compared to NFTs (73 chars)
    let is_sbt = nft_id.len() > 90;
    
    let canister_principal = if is_sbt {
        crate::icrc7_scion_principal()
    } else {
        crate::icrc7_principal()
    };
    
    // Convert string ID to Nat for canister call
    let token_nat = match Nat::from_str(nft_id) {
        Ok(nat) => nat,
        Err(_) => {
            return Err(format!("Could not convert '{}' to a valid NFT ID. Make sure you're using the actual NFT ID and not the Arweave transaction ID.", nft_id));
        }
    };
    
    // Call owner_of on the appropriate canister
    let owner_call_result: CallResult<(Vec<Option<Account>>,)> = ic_cdk::call(
        canister_principal,
        "icrc7_owner_of",
        (vec![token_nat],)
    ).await;
    
    match owner_call_result {
        Ok((owners,)) => {
            // Check if the first element matches the caller
            if let Some(Some(account)) = owners.first() {
                return Ok(account.owner == caller);
            }
            // No owner returned means NFT doesn't exist
            Err(format!("NFT with ID '{}' not found or has no owner", nft_id))
        },
        Err((code, msg)) => {
            Err(format!("Error fetching owner for NFT {}: {:?} - {}", nft_id, code, msg))
        }
    }
}

/// Checks if a shelf exists
fn shelf_exists(shelf_id: &String) -> bool {
    SHELVES.with(|shelves| {
        shelves.borrow().contains_key(shelf_id)
    })
}

/// Check if attempting to add a shelf to itself (direct self-reference)
fn is_self_reference(shelf_id: &String, nested_shelf_id: &String) -> bool {
    // Only check for direct self-references (shelf A cannot contain shelf A)
    shelf_id == nested_shelf_id
}

/// Adds a single slot to an existing shelf
/// This provides a more specific API for adding just one slot without
/// needing to replace the entire slot list
#[ic_cdk::update(guard = "not_anon")]
pub async fn add_shelf_slot(shelf_id: String, input: AddSlotInput) -> Result<(), String> {
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

/// Manually rebalances the slot positions within a shelf
/// This can be useful when many reorderings have caused position values to become too close
#[ic_cdk::update(guard = "not_anon")]
pub fn rebalance_shelf_slots(shelf_id: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Use the auth helper to handle edit permissions check and update
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf| {
        // Force a rebalance
        shelf.rebalance_positions();
        Ok(())
    })
}

#[ic_cdk::update(guard = "not_anon")]
pub fn update_shelf_metadata(
    shelf_id: String, 
    title: Option<String>, 
    description: Option<String>
) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Use the auth helper to handle edit permissions check and update
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf| {
        // Update the title if provided
        if let Some(new_title) = title {
            shelf.title = new_title;
        }
        
        // Update the description (which is already Option<String>)
        shelf.description = description;
        
        // The timestamp will be updated by the auth helper
        Ok(())
    })
}

/// Adds a new editor to a shelf
/// Only the shelf owner can add editors
#[ic_cdk::update(guard = "not_anon")]
pub fn add_shelf_editor(shelf_id: String, editor_principal: Principal) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Use the auth helper to handle shelf ownership check and update
    auth::get_shelf_for_owner_mut(&shelf_id, &caller, |shelf| {
        // Prevent adding owner as editor (they already have full permissions)
        if editor_principal == shelf.owner {
            return Err("Cannot add the owner as an editor".to_string());
        }
        
        // Check if editor already exists
        if shelf.editors.contains(&editor_principal) {
            return Err("Principal is already an editor".to_string());
        }
        
        // Add the new editor
        shelf.editors.push(editor_principal);
        
        Ok(())
    })
}

/// Removes an editor from a shelf
/// Only the shelf owner can remove editors
#[ic_cdk::update(guard = "not_anon")]
pub fn remove_shelf_editor(shelf_id: String, editor_principal: Principal) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Use the auth helper to handle shelf ownership check and update
    auth::get_shelf_for_owner_mut(&shelf_id, &caller, |shelf| {
        // Find and remove the editor
        let position = shelf.editors.iter().position(|p| *p == editor_principal);
        
        match position {
            Some(index) => {
                shelf.editors.remove(index);
                Ok(())
            },
            None => Err("Principal is not an editor".to_string())
        }
    })
}

/// Lists all editors for a shelf
/// Anyone can view the editors list
#[ic_cdk::query(guard = "not_anon")]
pub fn list_shelf_editors(shelf_id: String) -> Result<Vec<Principal>, String> {
    SHELVES.with(|shelves| {
        let shelves_map = shelves.borrow();
        match shelves_map.get(&shelf_id) {
            Some(shelf) => Ok(shelf.editors.clone()),
            None => Err(format!("Shelf with ID '{}' not found", shelf_id))
        }
    })
}

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


