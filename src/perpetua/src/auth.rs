use candid::Principal;
use crate::storage::{Shelf, SHELVES};

/// Checks if the provided principal is the owner of the specified shelf
pub fn is_shelf_owner(shelf_id: &str, principal: &Principal) -> Result<bool, String> {
    SHELVES.with(|shelves| {
        let shelves_map = shelves.borrow();
        match shelves_map.get(&shelf_id.to_string()) {
            Some(shelf) => Ok(shelf.owner == *principal),
            None => Err(format!("Shelf with ID '{}' not found", shelf_id))
        }
    })
}

/// Checks if the provided principal has edit permissions for the specified shelf
/// Returns true if the principal is either the owner or in the editors list
pub fn can_edit_shelf(shelf_id: &str, principal: &Principal) -> Result<bool, String> {
    SHELVES.with(|shelves| {
        let shelves_map = shelves.borrow();
        match shelves_map.get(&shelf_id.to_string()) {
            Some(shelf) => Ok(shelf.owner == *principal || shelf.editors.contains(principal)),
            None => Err(format!("Shelf with ID '{}' not found", shelf_id))
        }
    })
}

/// Checks if the provided principal is the admin (owner) of the specified shelf
/// This is used for admin-only operations like managing editors
pub fn is_shelf_admin(shelf_id: &str, principal: &Principal) -> Result<bool, String> {
    is_shelf_owner(shelf_id, principal)
}

/// Retrieves a shelf and verifies ownership by the provided principal
/// Returns the shelf if the principal is the owner, otherwise returns an error
pub fn get_shelf_for_owner(shelf_id: &str, principal: &Principal) -> Result<Shelf, String> {
    SHELVES.with(|shelves| {
        let shelves_map = shelves.borrow();
        match shelves_map.get(&shelf_id.to_string()) {
            Some(shelf) => {
                if shelf.owner != *principal {
                    return Err("Unauthorized: Only shelf owner can perform this action".to_string());
                }
                Ok(shelf.clone())
            },
            None => Err(format!("Shelf with ID '{}' not found", shelf_id))
        }
    })
}

/// Retrieves a shelf and verifies that the principal has edit permissions
/// Returns the shelf if the principal can edit it, otherwise returns an error
pub fn get_shelf_for_edit(shelf_id: &str, principal: &Principal) -> Result<Shelf, String> {
    SHELVES.with(|shelves| {
        let shelves_map = shelves.borrow();
        match shelves_map.get(&shelf_id.to_string()) {
            Some(shelf) => {
                if shelf.owner != *principal && !shelf.editors.contains(principal) {
                    return Err("Unauthorized: You don't have edit permissions for this shelf".to_string());
                }
                Ok(shelf.clone())
            },
            None => Err(format!("Shelf with ID '{}' not found", shelf_id))
        }
    })
}

/// Retrieves a shelf and verifies ownership by the provided principal, 
/// returning a mutable reference to the shelves map and the shelf
/// This is useful when you need to modify and save the shelf afterward
pub fn get_shelf_for_owner_mut<F, R>(
    shelf_id: &str, 
    principal: &Principal, 
    callback: F
) -> Result<R, String> 
where 
    F: FnOnce(&mut Shelf) -> Result<R, String>
{
    SHELVES.with(|shelves| {
        let mut shelves_map = shelves.borrow_mut();
        
        match shelves_map.get(&shelf_id.to_string()) {
            Some(shelf) => {
                if shelf.owner != *principal {
                    return Err("Unauthorized: Only shelf owner can perform this action".to_string());
                }
                
                // Create a mutable copy of the shelf
                let mut shelf_mut = shelf.clone();
                
                // Execute the callback with the mutable shelf
                let result = callback(&mut shelf_mut)?;
                
                // Update the timestamp
                shelf_mut.updated_at = ic_cdk::api::time();
                
                // Save the updated shelf
                shelves_map.insert(shelf_id.to_string(), shelf_mut);
                
                Ok(result)
            },
            None => Err(format!("Shelf with ID '{}' not found", shelf_id))
        }
    })
}

/// Retrieves a shelf and verifies edit permissions for the provided principal,
/// returning a mutable reference to the shelves map and the shelf
/// This allows anyone with edit permission to modify the shelf
pub fn get_shelf_for_edit_mut<F, R>(
    shelf_id: &str, 
    principal: &Principal, 
    callback: F
) -> Result<R, String> 
where 
    F: FnOnce(&mut Shelf) -> Result<R, String>
{
    SHELVES.with(|shelves| {
        let mut shelves_map = shelves.borrow_mut();
        
        match shelves_map.get(&shelf_id.to_string()) {
            Some(shelf) => {
                if shelf.owner != *principal && !shelf.editors.contains(principal) {
                    return Err("Unauthorized: You don't have edit permissions for this shelf".to_string());
                }
                
                // Create a mutable copy of the shelf
                let mut shelf_mut = shelf.clone();
                
                // Execute the callback with the mutable shelf
                let result = callback(&mut shelf_mut)?;
                
                // Update the timestamp
                shelf_mut.updated_at = ic_cdk::api::time();
                
                // Save the updated shelf
                shelves_map.insert(shelf_id.to_string(), shelf_mut);
                
                Ok(result)
            },
            None => Err(format!("Shelf with ID '{}' not found", shelf_id))
        }
    })
} 