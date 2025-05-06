use crate::storage::SHELVES;
use crate::guard::not_anon;
use crate::auth;

/// Toggles public access for a shelf
/// 
/// When enabled, anyone can edit the shelf.
/// Only the shelf owner can toggle this setting.
#[ic_cdk::update(guard = "not_anon")]
pub fn toggle_shelf_public_access(shelf_id: String, is_public: bool) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Use the auth helper to handle shelf ownership check and update
    auth::get_shelf_for_owner_mut(&shelf_id, &caller, |shelf| {
        // Update the public access flag
        shelf.is_public = is_public;
        
        Ok(())
    })
}

/// Checks if a shelf is publicly editable
/// 
/// Returns true if the shelf is set to public access mode.
#[ic_cdk::query(guard = "not_anon")]
pub fn is_shelf_public(shelf_id: String) -> Result<bool, String> {
    SHELVES.with(|shelves| {
        let shelves_map = shelves.borrow();
        match shelves_map.get(&shelf_id) {
            Some(shelf) => Ok(shelf.is_public),
            None => Err(format!("Shelf with ID '{}' not found", shelf_id))
        }
    })
} 