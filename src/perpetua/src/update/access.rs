use crate::storage::{SHELVES, GLOBAL_TIMELINE, ShelfId};
use crate::guard::not_anon;
use crate::auth;
use ic_cdk;

/// Toggles public access for a shelf
/// 
/// When enabled, anyone can edit the shelf.
/// Only the shelf owner can toggle this setting.
#[ic_cdk::update(guard = "not_anon")]
pub fn toggle_shelf_public_access(shelf_id: ShelfId, public_editing: bool) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let mut shelf_created_at_for_timeline: Option<u64> = None;

    // Update SHELVES and get the created_at timestamp
    auth::get_shelf_for_owner_mut(&shelf_id, &caller, |shelf_in_map| {
        shelf_in_map.public_editing = public_editing;
        // shelf_in_map.updated_at is handled by get_shelf_for_owner_mut
        shelf_created_at_for_timeline = Some(shelf_in_map.created_at);
        Ok(()) // Return Ok from this closure
    })?; // Propagate error from auth::get_shelf_for_owner_mut or its closure

    // Ensure we got the timestamp
    let created_at_key = match shelf_created_at_for_timeline {
        Some(ts) => ts,
        None => {
            // This case should ideally not be reached if the above succeeded.
            let err_msg = format!(
                "INTERNAL ERROR: Failed to retrieve created_at timestamp for shelf {} after SHELVES update. GLOBAL_TIMELINE not updated.",
                shelf_id
            );
            ic_cdk::println!("{}", err_msg);
            return Err(err_msg);
        }
    };

    // Update GLOBAL_TIMELINE
    GLOBAL_TIMELINE.with(|timeline_map_ref| {
        let mut timeline_map = timeline_map_ref.borrow_mut();
        if let Some(mut current_timeline_item) = timeline_map.remove(&created_at_key) {
            if current_timeline_item.shelf_id == shelf_id {
                current_timeline_item.public_editing = public_editing;
                timeline_map.insert(created_at_key, current_timeline_item);
                // Optional: Log success if needed during debugging
                // ic_cdk::println!("SUCCESS: GLOBAL_TIMELINE updated for shelf_id: {}, public_editing: {}", shelf_id, public_editing);
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
    SHELVES.with(|shelves| {
        let shelves_map = shelves.borrow();
        match shelves_map.get(&shelf_id) {
            Some(shelf) => Ok(shelf.public_editing),
            None => Err(format!("Shelf with ID '{}' not found", shelf_id))
        }
    })
} 