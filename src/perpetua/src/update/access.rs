use crate::storage::{GLOBAL_TIMELINE, ShelfId, ShelfMetadata, SHELF_METADATA};
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
    // prepared (but not yet saved) updated ShelfMetadata, along with original details
    // needed for GLOBAL_TIMELINE.
    let (prepared_shelf_metadata, created_at_key, owner_key_from_shelf, tags_key_from_shelf) =
        SHELF_METADATA.with(|metadata_map_ref| {
            let metadata_map = metadata_map_ref.borrow(); // Immutable borrow for reading
            if let Some(existing_metadata) = metadata_map.get(&shelf_id) {
                // Authorization check
                if existing_metadata.owner != caller {
                    return Err("Unauthorized: Only shelf owner can toggle public access.".to_string());
                }

                // Clone and prepare the updated metadata
                let mut updated_metadata = existing_metadata.clone();
                updated_metadata.public_editing = public_editing;
                updated_metadata.updated_at = now;

                Ok((
                    updated_metadata, // The full metadata object ready to be inserted
                    existing_metadata.created_at,
                    existing_metadata.owner,      // Principal (used for GLOBAL_TIMELINE)
                    existing_metadata.tags.clone(), // Vec<String> (used for GLOBAL_TIMELINE)
                ))
            } else {
                Err(format!("Shelf metadata with ID '{}' not found", shelf_id))
            }
        })?; // Propagate error if any, no state changed yet

    // Step 1.2: Process GLOBAL_TIMELINE
    // This closure retrieves the existing timeline item, performs consistency checks,
    // and returns the prepared (but not yet saved) updated GlobalTimelineItemValue.
    let prepared_timeline_item = GLOBAL_TIMELINE.with(|timeline_map_ref| {
        let timeline_map = timeline_map_ref.borrow(); // Immutable borrow for reading
        if let Some(existing_timeline_item) = timeline_map.get(&created_at_key) {
            // Consistency check
            if existing_timeline_item.shelf_id != shelf_id {
                let err_msg = format!(
                    "CRITICAL INCONSISTENCY: GLOBAL_TIMELINE key {} for shelf_id {} resolved to an item for shelf_id {}. Update aborted.",
                    created_at_key, shelf_id, existing_timeline_item.shelf_id
                );
                ic_cdk::println!("{}", err_msg);
                return Err(err_msg);
            }

            // Clone and prepare the updated timeline item
            let mut updated_item = existing_timeline_item.clone();
            updated_item.public_editing = public_editing;
            // Ensure owner and tags are consistent with what's in ShelfMetadata
            updated_item.owner = owner_key_from_shelf;
            updated_item.tags = tags_key_from_shelf;

            Ok(updated_item) // The full timeline item ready for insertion
        } else {
            // If the shelf exists in SHELF_METADATA but not in GLOBAL_TIMELINE, this is an inconsistency.
            let err_msg = format!(
                "ERROR: Shelf {} (created_at_key: {}) found in SHELF_METADATA, but its entry was NOT found in GLOBAL_TIMELINE. Update aborted.",
                shelf_id, created_at_key
            );
            ic_cdk::println!("{}", err_msg);
            Err(err_msg)
        }
    })?; // Propagate error if any, no state changed yet

    // --- Phase 2: Commit changes to both storages ---
    // If we've reached here, all checks passed and all data is prepared.

    // Commit to SHELF_METADATA
    SHELF_METADATA.with(|metadata_map_ref| {
        let mut metadata_map = metadata_map_ref.borrow_mut();
        // shelf_id is cloned for the key as insert takes ownership
        metadata_map.insert(shelf_id.clone(), prepared_shelf_metadata);
    });

    // Commit to GLOBAL_TIMELINE
    GLOBAL_TIMELINE.with(|timeline_map_ref| {
        let mut timeline_map = timeline_map_ref.borrow_mut();
        // created_at_key is u64 (Copy), prepared_timeline_item is taken by value
        timeline_map.insert(created_at_key, prepared_timeline_item);
    });

    Ok(())
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