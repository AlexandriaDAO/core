use crate::storage::{GLOBAL_TIMELINE, ShelfId, ShelfMetadata, SHELF_METADATA};
use crate::guard::not_anon;
use ic_cdk;
use candid::Principal;

/// Toggles public access for a shelf
/// 
/// When enabled, anyone can edit the shelf.
/// Only the shelf owner can toggle this setting.
#[ic_cdk::update(guard = "not_anon")]
pub fn toggle_shelf_public_access(shelf_id: ShelfId, public_editing: bool) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let mut shelf_created_at_for_timeline: Option<u64> = None;
    let mut owner_for_timeline: Option<Principal> = None;
    let mut tags_for_timeline: Option<Vec<String>> = None;

    // Update SHELF_METADATA
    SHELF_METADATA.with(|metadata_map_ref| {
        let mut metadata_map = metadata_map_ref.borrow_mut();
        if let Some(mut metadata) = metadata_map.get(&shelf_id).map(|m| m.clone()) {
            // Authorization check: Only owner can toggle
            if metadata.owner != caller {
                return Err("Unauthorized: Only shelf owner can toggle public access.".to_string());
            }
            metadata.public_editing = public_editing;
            metadata.updated_at = ic_cdk::api::time();
            
            // Store details needed for GLOBAL_TIMELINE update
            shelf_created_at_for_timeline = Some(metadata.created_at);
            owner_for_timeline = Some(metadata.owner); // owner is Principal
            tags_for_timeline = Some(metadata.tags.clone()); // tags is Vec<String>

            metadata_map.insert(shelf_id.clone(), metadata);
            Ok(())
        } else {
            Err(format!("Shelf metadata with ID '{}' not found", shelf_id))
        }
    })?;

    // Ensure we got the timestamp and other details for GLOBAL_TIMELINE
    let created_at_key = shelf_created_at_for_timeline.ok_or_else(|| 
        format!("INTERNAL ERROR: Failed to retrieve created_at for shelf {}", shelf_id)
    )?;
    let owner_key = owner_for_timeline.ok_or_else(||
        format!("INTERNAL ERROR: Failed to retrieve owner for shelf {}", shelf_id)
    )?;
    let tags_key = tags_for_timeline.ok_or_else(||
        format!("INTERNAL ERROR: Failed to retrieve tags for shelf {}", shelf_id)
    )?;

    // Update GLOBAL_TIMELINE
    GLOBAL_TIMELINE.with(|timeline_map_ref| {
        let mut timeline_map = timeline_map_ref.borrow_mut();
        // Try to remove and then re-insert. If it wasn't there, it's an inconsistency.
        if let Some(mut current_timeline_item) = timeline_map.remove(&created_at_key) {
            if current_timeline_item.shelf_id == shelf_id {
                current_timeline_item.public_editing = public_editing;
                // The owner and tags should ideally not change here, but we re-insert them
                // to ensure consistency if this is the primary place GLOBAL_TIMELINE is written to
                // after initial creation.
                current_timeline_item.owner = owner_key;
                current_timeline_item.tags = tags_key;
                timeline_map.insert(created_at_key, current_timeline_item);
                Ok(())
            } else {
                // Inconsistency: timestamp key led to a different shelf's timeline item
                let inconsistent_shelf_id = current_timeline_item.shelf_id.clone();
                // Restore the original item as we removed it
                timeline_map.insert(created_at_key, current_timeline_item);
                let err_msg = format!(
                    "CRITICAL INCONSISTENCY: GLOBAL_TIMELINE key {} for shelf_id {} resolved to an item for shelf_id {}. Original timeline item restored. GLOBAL_TIMELINE not updated for public_editing change.",
                    created_at_key, shelf_id, inconsistent_shelf_id
                );
                ic_cdk::println!("{}", err_msg);
                Err(err_msg)
            }
        } else {
            // Inconsistency: shelf exists in SHELVES, but no corresponding entry in GLOBAL_TIMELINE
            let err_msg = format!(
                "ERROR: Shelf {} (created_at_key: {}) found and updated in SHELVES, but its entry was NOT found in GLOBAL_TIMELINE. GLOBAL_TIMELINE not updated for public_editing change.",
                shelf_id, created_at_key
            );
            ic_cdk::println!("{}", err_msg);
            // This is a significant inconsistency. Depending on policy, could return an error
            // or allow the SHELVES update to proceed but log this issue.
            // For now, let's make it an error as the state is inconsistent.
            Err(err_msg)
        }
    }) // This is the Result<(), String> from the timeline update attempt
}

/// Checks if a shelf is publicly editable
/// 
/// Returns true if the shelf is set to public access mode.
#[ic_cdk::query(guard = "not_anon")]
pub fn is_shelf_public(shelf_id: String) -> Result<bool, String> {
    SHELF_METADATA.with(|metadata_map_ref| {
        let metadata_map = metadata_map_ref.borrow();
        match metadata_map.get(&shelf_id) {
            Some(metadata) => Ok(metadata.public_editing),
            None => Err(format!("Shelf metadata with ID '{}' not found", shelf_id))
        }
    })
} 