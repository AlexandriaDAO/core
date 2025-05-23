use candid::{CandidType, Deserialize};
use crate::storage::{Item, ItemContent, ShelfData, SHELF_DATA, NFT_SHELVES, USER_SHELVES, create_shelf, GLOBAL_TIMELINE, ShelfId, GlobalTimelineItemValue, ShelfMetadata, ShelfContent, StringVec};
use crate::storage::error_log_storage::{add_reconciliation_task, ReconciliationTaskType};
use crate::guard::not_anon;
use super::tags::add_tag_to_metadata_maps;

// --- Constants ---
const MAX_USER_SHELVES: usize = 500;

/// Represents the data needed to update a shelf's metadata
#[derive(CandidType, Deserialize)]
pub struct ShelfUpdate {
    pub title: Option<String>,
    pub description: Option<String>,
}

/// Creates a new shelf with the provided metadata and items
/// 
/// Stores the newly created shelf in the global registry and
/// establishes the appropriate ownership and reference tracking.
/// If secondary updates (like timeline or NFT index) fail, tasks are logged for reconciliation.
#[ic_cdk::update(guard = "not_anon")]
pub async fn store_shelf(
    title: String,
    description: Option<String>,
    items: Vec<Item>,
    tags: Option<Vec<String>>, 
) -> Result<(ShelfId, Option<u64>), String> { // Return ShelfId and optional task_id
    let caller = ic_cdk::caller();
    let mut task_id_on_error: Option<u64> = None;
    
    // --- Check Shelf Limit ---
    let current_shelf_count = USER_SHELVES.with(|user_shelves| {
        user_shelves.borrow()
            .get(&caller)
            .map_or(0, |shelves_set| shelves_set.0.len())
    });

    if current_shelf_count >= MAX_USER_SHELVES {
        return Err(format!("User cannot own more than {} shelves.", MAX_USER_SHELVES));
    }
    
    // Create the in-memory shelf representation using the storage function
    // create_shelf itself now returns Result<(CommonShelfId, Option<u64>), String>
    // The Option<u64> from create_shelf is if *it* logged a timeline error internally.
    // We will handle new timeline/NFT errors specifically from this function's operations.
    let (shelf_id_from_storage, mut internal_task_id) = match create_shelf(title, description, items.clone(), tags.clone()).await {
        Ok(res) => res,
        Err(e) => return Err(format!("Failed during internal shelf object creation: {}", e)),
    };
    // If create_shelf logged a task, we should probably use that one.
    task_id_on_error = internal_task_id;

    // Fetch the fully constructed Shelf object from create_shelf (it's not directly returned anymore).
    // This is a bit indirect. Ideally create_shelf would return the Shelf object or its parts.
    // For now, we'll re-fetch based on its ID, or re-construct parts if create_shelf returned them.
    // Based on current create_shelf, it returns ShelfId. We need the created Shelf object's details.
    // Let's assume create_shelf has done its job and we now need to commit its state to ShelfData and other maps.
    // The create_shelf in shelf_storage.rs was modified to do the main ShelfData insert.
    // So, here, store_shelf becomes more of a coordinator for secondary map updates if create_shelf succeeded.

    // Re-fetch the created ShelfData to get all necessary details for secondary map updates.
    // This ensures we are working with what was actually stored by create_shelf.
    let (created_shelf_data, created_shelf_metadata, shelf_in_memory_items, shelf_owner, shelf_tags_normalized, shelf_public_editing, shelf_updated_at_ts) = 
        SHELF_DATA.with(|sds_map_ref| {
            sds_map_ref.borrow().get(&shelf_id_from_storage).map_or_else(
                || Err(format!("Consistency error: Shelf {} not found in SHELF_DATA after creation.", shelf_id_from_storage)),
                |sd| Ok((
                    sd.clone(), // ShelfData
                    sd.metadata.clone(), // ShelfMetadata
                    sd.content.items.clone(), // Items
                    sd.metadata.owner, // Owner
                    sd.metadata.tags.clone(), // Tags
                    sd.metadata.public_editing, // Public editing
                    sd.metadata.updated_at, // updated_at timestamp
                ))
            )
        })?;

    let shelf_id = shelf_id_from_storage;
    let now = shelf_updated_at_ts; // Use the timestamp from the stored ShelfData

    // --- Secondary Operations (Primary SHELF_DATA insert is now done by create_shelf) ---

    // 1. Store NFT references
    for item in created_shelf_data.content.items.values() {
        if let ItemContent::Nft(nft_id_str) = &item.content {
            // Simulate potential failure for NFT_SHELVES update for demonstration
            let nft_update_success = NFT_SHELVES.with(|nft_shelves_map_ref| -> Result<(), String> {
                let mut nft_map = nft_shelves_map_ref.borrow_mut();
                let mut shelves_vec = nft_map.get(nft_id_str).unwrap_or_default();
                if !shelves_vec.0.contains(&shelf_id) {
                    shelves_vec.0.push(shelf_id.clone());
                    shelves_vec.0.sort(); // Keep it sorted for consistency
                    // Example: Simulate failure for a specific NFT ID to test logging
                    if nft_id_str.contains("FAIL_NFT_UPDATE") { 
                        return Err("Simulated failure updating NFT_SHELVES".to_string());
                    }
                    nft_map.insert(nft_id_str.to_string(), shelves_vec);
                }
                Ok(())
            });

            if let Err(e) = nft_update_success {
                ic_cdk::println!("Error updating NFT_SHELVES for shelf {}: {}. Logging task.", shelf_id, e);
                let task_type = ReconciliationTaskType::NftShelfAdd {
                    shelf_id: shelf_id.clone(),
                    nft_id: nft_id_str.clone(),
                };
                task_id_on_error = Some(add_reconciliation_task(task_type, e));
                // Continue to the next step even if this fails, as per reconciliation model
            }
        }
    }

    // 2. Update user shelf tracking
    USER_SHELVES.with(|user_shelves_map_ref| {
        let mut user_map = user_shelves_map_ref.borrow_mut();
        let mut user_shelves_set = user_map.get(&caller).unwrap_or_default();
        if !user_shelves_set.0.iter().any(|(_, sid)| sid == &shelf_id) {
            user_shelves_set.0.insert((now, shelf_id.clone())); // now is shelf_updated_at_ts
            user_map.insert(caller, user_shelves_set);
        }
    });

    // 3. Add shelf to the global timeline (if not already handled by create_shelf's internal logging)
    // The create_shelf in shelf_storage logs its own timeline update. We should avoid double-logging.
    // If internal_task_id from create_shelf is None, it means its timeline update succeeded.
    // We don't need to do it again here, as create_shelf is now the source for SHELF_DATA and its initial timeline entry.
    if internal_task_id.is_some() {
        ic_cdk::println!("Timeline update for shelf {} was already logged by create_shelf (task_id: {:?})", shelf_id, internal_task_id);
    } else {
        // Verify it's actually in the timeline (it should be if create_shelf succeeded its timeline part)
        let in_timeline = GLOBAL_TIMELINE.with(|gt_ref| gt_ref.borrow().get(&now).map_or(false, |val| val.shelf_id == shelf_id));
        if !in_timeline {
            ic_cdk::println!("Warning: Shelf {} created by create_shelf not found in GLOBAL_TIMELINE with key {}. Logging task.", shelf_id, now);
            let task_type = ReconciliationTaskType::GlobalTimelineEntry {
                shelf_id: shelf_id.clone(),
                expected_timestamp: now,
                owner: shelf_owner,
                tags: shelf_tags_normalized.iter().map(|t| t.to_string()).collect(),
                public_editing: shelf_public_editing,
            };
            task_id_on_error = Some(add_reconciliation_task(task_type, "Shelf missing from GLOBAL_TIMELINE after create_shelf internal update succeeded.".to_string()));
        }
    }
    
    // 4. Tag associations
    // add_tag_to_metadata_maps panics on failure, enforcing atomicity for its part.
    // If this is too strict and tag association failures should also be logged, this needs refactoring.
    for tag_to_associate in &shelf_tags_normalized {
        add_tag_to_metadata_maps(&shelf_id, tag_to_associate, now, now); 
    }

    Ok((shelf_id, task_id_on_error))
}

/// Updates the metadata (title and/or description) of an existing shelf
/// 
/// Only users with edit permissions can modify shelf metadata.
#[ic_cdk::update(guard = "not_anon")]
pub fn update_shelf_metadata(
    shelf_id: ShelfId, 
    title: Option<String>, 
    description: Option<String>
) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let now = ic_cdk::api::time();

    SHELF_DATA.with(|shelf_data_map_ref| {
        let mut shelf_data_map = shelf_data_map_ref.borrow_mut();
        if let Some(mut shelf_data) = shelf_data_map.get(&shelf_id).map(|sd| sd.clone()) { // Clone to modify
            if shelf_data.metadata.owner != caller && !shelf_data.metadata.public_editing { // Check edit permission
                return Err("Unauthorized: You don\'t have permission to edit this shelf metadata".to_string());
            }

            if let Some(new_title) = title {
                if new_title.trim().is_empty() {
                    return Err("Title cannot be empty".to_string());
                }
                if new_title.len() > 100 {
                     return Err("Title is too long (max 100 characters)".to_string());
                }
                shelf_data.metadata.title = new_title;
            }
            
            if let Some(ref desc_val) = description {
                 if desc_val.len() > 500 {
                     return Err("Description is too long (max 500 characters)".to_string());
                 }
            }
            shelf_data.metadata.description = description;
            
            shelf_data.metadata.updated_at = now;

            shelf_data_map.insert(shelf_id.clone(), shelf_data); // Insert the modified ShelfData
            Ok(())
        } else {
            Err(format!("Shelf with ID '{}' not found", shelf_id))
        }
    })
} 