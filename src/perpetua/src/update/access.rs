use candid::Principal;
use crate::storage::SHELVES;
use crate::guard::not_anon;
use crate::auth;

/// Adds a new editor to a shelf
/// 
/// Only the shelf owner can add editors. The editors have permission
/// to modify the shelf contents but cannot add/remove other editors.
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
/// 
/// Only the shelf owner can remove editors. This revokes the editor's
/// permission to modify the shelf contents.
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
/// 
/// Returns a list of principal IDs that have edit permissions for the shelf.
/// Anyone can view the editors list.
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

/// Toggles public access for a shelf
/// 
/// When enabled, anyone can edit the shelf without explicit editor permissions.
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