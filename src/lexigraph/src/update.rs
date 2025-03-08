use candid::{CandidType, Deserialize, Nat, Principal};
use crate::storage::{Slot, SlotContent, SHELVES, NFT_SHELVES, USER_SHELVES, create_shelf, GLOBAL_TIMELINE};
use crate::guard::not_anon;
use ic_cdk::api::call::CallResult;
use icrc_ledger_types::icrc1::account::Account;
use std::str::FromStr;


#[ic_cdk::update(guard = "not_anon")]
pub async fn store_shelf(
    title: String,
    description: Option<String>,
    slots: Vec<Slot>,
) -> Result<(), String> {
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

    Ok(())
}

// Update update_shelf function
#[ic_cdk::update(guard = "not_anon")]
pub async fn update_shelf(shelf_id: String, updates: ShelfUpdate) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // First, verify NFT ownership for all slots if applicable
    if let Some(new_slots) = &updates.slots {
        // Extract all NFT IDs that need ownership verification
        let nft_ids: Vec<String> = new_slots.iter()
            .filter_map(|slot| {
                if let SlotContent::Nft(nft_id) = &slot.content {
                    Some(nft_id.clone())
                } else {
                    None
                }
            })
            .collect();
            
        // Verify ownership of all NFTs outside the closure
        for nft_id in &nft_ids {
            let is_owner = verify_nft_ownership(nft_id, caller).await?;
            if !is_owner {
                return Err(format!("Unauthorized: You don't own NFT '{}'", nft_id));
            }
        }
    }
    
    // Now perform the update in the with block
    SHELVES.with(|shelves| {
        let mut shelves_map = shelves.borrow_mut();
        
        if let Some(mut shelf) = shelves_map.get(&shelf_id) {
            // Enforce owner check
            if shelf.owner != caller {
                return Err("Unauthorized: Only shelf owner can update shelf".to_string());
            }
            
            // Update basic properties if provided
            if let Some(title) = &updates.title {
                shelf.title = title.clone();
            }
            
            if let Some(desc) = &updates.description {
                shelf.description = Some(desc.clone());
            }
            
            // Process slot updates if provided
            if let Some(new_slots) = &updates.slots {
                // Validate total slot count
                if new_slots.len() > 500 {
                    return Err("Cannot update shelf with more than 500 slots".to_string());
                }
                
                // Validate all nested shelf references
                for slot in new_slots {
                    if let SlotContent::Shelf(nested_shelf_id) = &slot.content {
                        // Check the referenced shelf exists
                        if !shelf_exists(nested_shelf_id) {
                            return Err(format!("Shelf '{}' does not exist", nested_shelf_id));
                        }
                        
                        // Check for circular references
                        if is_self_reference(&shelf_id, nested_shelf_id) {
                            return Err("Cannot add a shelf to itself".to_string());
                        }
                    }
                }
            }
            
            // Update slots if provided
            if let Some(new_slots) = updates.slots {
                if new_slots.len() > 500 {
                    return Err("Cannot update shelf with more than 500 slots".to_string());
                }
                
                // Extract all NFT IDs for reference updates
                let new_nfts: Vec<String> = new_slots.iter()
                    .filter_map(|slot| {
                        if let SlotContent::Nft(nft_id) = &slot.content {
                            Some(nft_id.clone())
                        } else {
                            None
                        }
                    })
                    .collect();
                    
                // Create updated shelf for modification
                let mut updated_shelf = shelf.clone();
                
                // Get current NFT references
                let current_nfts: Vec<String> = updated_shelf.slots.values()
                    .filter_map(|slot| {
                        if let SlotContent::Nft(nft_id) = &slot.content {
                            Some(nft_id.clone())
                        } else {
                            None
                        }
                    })
                    .collect();
                
                // Clear current slots and re-add from new list
                updated_shelf.slots.clear();
                updated_shelf.slot_positions.clear();
                
                // Add new slots
                for slot in new_slots {
                    updated_shelf.insert_slot(slot)?;
                }
                
                // Check if the shelf needs rebalancing
                updated_shelf.ensure_balanced_positions();
                
                // Update tracking for NFT references
                // First remove old references
                for nft_id in &current_nfts {
                    NFT_SHELVES.with(|nft_shelves| {
                        let mut nft_map = nft_shelves.borrow_mut();
                        if let Some(mut shelves) = nft_map.get(nft_id) {
                            // Remove this shelf from the list
                            shelves.0.retain(|id| id != &shelf_id);
                            nft_map.insert(nft_id.to_string(), shelves);
                        }
                    });
                }
                
                // Then add new references
                for nft_id in &new_nfts {
                    NFT_SHELVES.with(|nft_shelves| {
                        let mut nft_map = nft_shelves.borrow_mut();
                        let mut shelves = nft_map.get(nft_id).unwrap_or_default();
                        if !shelves.0.contains(&shelf_id) {
                            shelves.0.push(shelf_id.clone());
                            nft_map.insert(nft_id.to_string(), shelves);
                        }
                    });
                }
                
                // Update shelf
                shelf = updated_shelf;
            }
            
            // Update timestamp and save
            shelf.updated_at = ic_cdk::api::time();
            // Store the timestamp before moving shelf
            let timestamp = shelf.updated_at;
            shelves_map.insert(shelf_id.clone(), shelf);
            
            // Add to global timeline
            GLOBAL_TIMELINE.with(|timeline| {
                let mut timeline_map = timeline.borrow_mut();
                // Direct insert to the BTreeMap instead of using get/set
                timeline_map.insert(timestamp, shelf_id.clone());
            });
            
            Ok(())
        } else {
            Err("Shelf not found".to_string())
        }
    })
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
    
    SHELVES.with(|shelves| {
        let mut shelves_map = shelves.borrow_mut();
        if let Some(mut shelf) = shelves_map.get(&shelf_id) {
            // Enforce owner check using caller
            if shelf.owner != caller {
                return Err("Unauthorized: Only shelf owner can reorder slots".to_string());
            }

            // Use the existing move_slot method to handle the reordering
            shelf.move_slot(reorder.slot_id, reorder.reference_slot_id, reorder.before)?;
            
            // Update the timestamp and save
            shelf.updated_at = ic_cdk::api::time();
            shelves_map.insert(shelf_id, shelf);
            Ok(())
        } else {
            Err("Shelf not found".to_string())
        }
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
    // Use different canister based on ID length
    // SBTs have longer IDs (95 chars) compared to NFTs (73 chars)
    let is_sbt = nft_id.len() > 90;
    
    let canister_principal = if is_sbt {
        crate::icrc7_scion_principal()
    } else {
        crate::icrc7_principal()
    };
    
    // Convert string ID to Nat for canister call
    let token_nat = Nat::from_str(nft_id)
        .map_err(|_| format!("Invalid NFT ID format: {}", nft_id))?;
    
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
            Ok(false)
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

#[ic_cdk::update(guard = "not_anon")]
pub fn delete_shelf(shelf_id: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    SHELVES.with(|shelves| {
        let mut shelves_map = shelves.borrow_mut();
        
        // Get the shelf and verify ownership
        let shelf = shelves_map.get(&shelf_id)
            .ok_or_else(|| "Shelf not found".to_string())?;
            
        if shelf.owner != caller {
            return Err("Unauthorized: Only shelf owner can delete".to_string());
        }
        
        // Remove references based on slot content type
        for slot in shelf.slots.values() {
            match &slot.content {
                SlotContent::Nft(nft_id) => {
                    NFT_SHELVES.with(|nft_shelves| {
                        let mut nft_map = nft_shelves.borrow_mut();
                        if let Some(mut shelves) = nft_map.get(nft_id) {
                            shelves.0.retain(|id| id != &shelf_id);
                            nft_map.insert(nft_id.clone(), shelves);
                        }
                    });
                },
                _ => {} // No action needed for other content types
            }
        }
        
        // Remove from user's shelf list
        USER_SHELVES.with(|user_shelves| {
            let mut user_map = user_shelves.borrow_mut();
            if let Some(mut user_shelves_set) = user_map.get(&shelf.owner) {
                user_shelves_set.0.retain(|(_, id)| id != &shelf_id);
                user_map.insert(shelf.owner, user_shelves_set);
            }
        });
        
        // Remove from global timeline
        GLOBAL_TIMELINE.with(|timeline| {
            let mut timeline_map = timeline.borrow_mut();
            for ts in [shelf.created_at, shelf.updated_at].iter() {
                timeline_map.remove(ts);
            }
        });
        
        // Remove the shelf itself
        shelves_map.remove(&shelf_id);
        
        Ok(())
    })
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
    
    SHELVES.with(|shelves| {
        let mut shelves_map = shelves.borrow_mut();
        if let Some(mut shelf) = shelves_map.get(&shelf_id) {
            // Enforce owner check
            if shelf.owner != caller {
                return Err("Unauthorized: Only shelf owner can add slots".to_string());
            }

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

            // Update timestamp and save
            shelf.updated_at = ic_cdk::api::time();
            shelves_map.insert(shelf_id, shelf);
            Ok(())
        } else {
            Err("Shelf not found".to_string())
        }
    })
}

/// Manually rebalances the slot positions within a shelf
/// This can be useful when many reorderings have caused position values to become too close
#[ic_cdk::update(guard = "not_anon")]
pub fn rebalance_shelf_slots(shelf_id: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    SHELVES.with(|shelves| {
        let mut shelves_map = shelves.borrow_mut();
        if let Some(mut shelf) = shelves_map.get(&shelf_id) {
            // Enforce owner check
            if shelf.owner != caller {
                return Err("Unauthorized: Only shelf owner can rebalance slots".to_string());
            }
            
            // Force a rebalance
            shelf.rebalance_positions();
            
            // Update timestamp and save
            shelf.updated_at = ic_cdk::api::time();
            shelves_map.insert(shelf_id, shelf);
            Ok(())
        } else {
            Err("Shelf not found".to_string())
        }
    })
}


