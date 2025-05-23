use crate::storage::{GLOBAL_TIMELINE, ShelfId, ShelfData, SHELF_DATA};
use crate::guard::not_anon;
use ic_cdk;
use candid::Principal;

/// Toggles public access for a shelf
/// 
/// When enabled, anyone can edit the shelf.
/// Only the shelf owner can toggle this setting.
/// This function ensures that updates to SHELF_METADATA and GLOBAL_TIMELINE are atomic.
#[ic_cdk::update(guard = "not_anon")]
pub fn toggle_shelf_public_access(shelf_id: ShelfId, public_editing: bool) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let now = ic_cdk::api::time(); // Get time once for consistency

    // --- Phase 1: Read from storages, validate, and prepare updated data ---

    // Step 1.1: Process SHELF_METADATA
    // This closure retrieves existing metadata, performs checks, and returns the
    // prepared (but not yet saved) updated ShelfData, along with original details
    // needed for GLOBAL_TIMELINE.
    let (prepared_shelf_data_to_commit, created_at_key_for_timeline, owner_for_timeline, tags_for_timeline) =
        SHELF_DATA.with(|shelf_data_map_ref| {
            let shelf_data_map = shelf_data_map_ref.borrow();
            if let Some(existing_shelf_data) = shelf_data_map.get(&shelf_id) {
                // Authorization check
                if existing_shelf_data.metadata.owner != caller {
                    return Err("Unauthorized: Only shelf owner can toggle public access.".to_string());
                }

                // Clone and prepare the updated ShelfData
                let mut updated_shelf_data = existing_shelf_data.clone();
                updated_shelf_data.metadata.public_editing = public_editing;
                updated_shelf_data.metadata.updated_at = now;

                Ok((
                    updated_shelf_data, // The full ShelfData object ready to be inserted
                    existing_shelf_data.metadata.created_at,    // For timeline key
                    existing_shelf_data.metadata.owner,         // For timeline value consistency
                    existing_shelf_data.metadata.tags.clone(),  // For timeline value consistency
                ))
            } else {
                Err(format!("Shelf with ID '{}' not found", shelf_id)) // General not found message
            }
        })?;

    // Step 1.2: Process GLOBAL_TIMELINE
    // This closure retrieves the existing timeline item, performs consistency checks,
    // and returns the prepared (but not yet saved) updated GlobalTimelineItemValue.
    let prepared_timeline_item = GLOBAL_TIMELINE.with(|timeline_map_ref| {
        let timeline_map = timeline_map_ref.borrow();
        if let Some(existing_timeline_item) = timeline_map.get(&created_at_key_for_timeline) {
            if existing_timeline_item.shelf_id != shelf_id {
                let err_msg = format!(
                    "CRITICAL INCONSISTENCY: GLOBAL_TIMELINE key {} for shelf_id {} resolved to an item for shelf_id {}. Update aborted.",
                    created_at_key_for_timeline, shelf_id, existing_timeline_item.shelf_id
                );
                ic_cdk::println!("{}", err_msg);
                return Err(err_msg);
            }

            let mut updated_item = existing_timeline_item.clone();
            updated_item.public_editing = public_editing; // This public_editing is from the input param
            updated_item.owner = owner_for_timeline; // Ensure consistency
            updated_item.tags = tags_for_timeline;   // Ensure consistency

            Ok(updated_item)
        } else {
            let err_msg = format!(
                "ERROR: Shelf {} (created_at_key: {}) found (implying its data exists), but its entry was NOT found in GLOBAL_TIMELINE. Update aborted.",
                shelf_id, created_at_key_for_timeline
            );
            ic_cdk::println!("{}", err_msg);
            Err(err_msg)
        }
    })?;

    // --- Phase 2: Commit changes to both storages ---
    // If we've reached here, all checks passed and all data is prepared.

    // Commit to SHELF_METADATA
    SHELF_DATA.with(|shelf_data_map_ref| {
        let mut map = shelf_data_map_ref.borrow_mut();
        map.insert(shelf_id.clone(), prepared_shelf_data_to_commit);
    });

    // Commit to GLOBAL_TIMELINE
    GLOBAL_TIMELINE.with(|timeline_map_ref| {
        let mut timeline_map = timeline_map_ref.borrow_mut();
        timeline_map.insert(created_at_key_for_timeline, prepared_timeline_item);
    });

    Ok(())
}

/// Checks if a shelf is publicly editable
/// 
/// Returns true if the shelf is set to public access mode.
#[ic_cdk::query(guard = "not_anon")]
pub fn is_shelf_public(shelf_id: String) -> Result<bool, String> {
    SHELF_DATA.with(|shelf_data_map_ref| {
        let shelf_data_map = shelf_data_map_ref.borrow();
        match shelf_data_map.get(&shelf_id) {
            Some(shelf_data) => Ok(shelf_data.metadata.public_editing),
            None => Err(format!("Shelf with ID '{}' not found", shelf_id))
        }
    })
} 