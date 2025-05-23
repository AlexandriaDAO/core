use candid::Principal;
// Import New Types
use crate::storage::{ShelfData, ShelfMetadata, ShelfContent, SHELF_DATA};
use ic_stable_structures::{memory_manager::VirtualMemory};
use ic_stable_structures::DefaultMemoryImpl;

// Define Memory type alias for clarity
type Memory = VirtualMemory<DefaultMemoryImpl>;

/// Common enum for shelf authorization errors
#[derive(Debug, Clone)]
pub enum ShelfAuthError {
    NotFound(String),
    Unauthorized(String),
    // ContentNotFound is implicitly covered by NotFound if ShelfData is missing
}

impl std::fmt::Display for ShelfAuthError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ShelfAuthError::NotFound(msg) => write!(f, "{}", msg),
            ShelfAuthError::Unauthorized(msg) => write!(f, "{}", msg),
        }
    }
}

impl From<ShelfAuthError> for String {
    fn from(error: ShelfAuthError) -> Self {
        error.to_string()
    }
}

/// Internal helper to get a shelf's data by ID
fn get_shelf_data_internal(shelf_id: &str) -> Result<ShelfData, ShelfAuthError> {
    SHELF_DATA.with(|map| {
        map.borrow().get(&shelf_id.to_string())
            .map(|data| data.clone()) // ShelfData must be Clone
            .ok_or_else(|| ShelfAuthError::NotFound(format!("Shelf data for ID '{}' not found", shelf_id)))
    })
}

/// Checks if the provided principal is the owner of the specified shelf
pub fn is_shelf_owner(shelf_id: &str, principal: &Principal) -> Result<bool, String> {
    let shelf_data = get_shelf_data_internal(shelf_id)?;
    Ok(shelf_data.metadata.owner == *principal)
}

/// Checks if principal can edit shelf
pub fn can_edit_shelf(shelf_id: &str, principal: &Principal) -> Result<bool, String> {
    let shelf_data = get_shelf_data_internal(shelf_id)?;
    Ok(shelf_data.metadata.owner == *principal || shelf_data.metadata.public_editing)
}

/// Checks if the provided principal is the admin (owner) of the specified shelf
/// This is used for admin-only operations like changing shelf private/public satus.
pub fn is_shelf_admin(shelf_id: &str, principal: &Principal) -> Result<bool, String> {
    is_shelf_owner(shelf_id, principal)
}

/// Retrieves a shelf's metadata and verifies ownership by the provided principal
/// Returns the ShelfMetadata if the principal is the owner, otherwise returns an error
pub fn get_shelf_metadata_for_owner(shelf_id: &str, principal: &Principal) -> Result<ShelfMetadata, String> {
    let shelf_data = get_shelf_data_internal(shelf_id)?;
    
    if shelf_data.metadata.owner != *principal {
        return Err(ShelfAuthError::Unauthorized(
            "Unauthorized: Only shelf owner can perform this action".to_string()
        ).into());
    }
    
    Ok(shelf_data.metadata)
}

/// Retrieves a shelf's metadata and verifies that the principal has edit permissions
/// Returns the ShelfMetadata if the principal can edit it, otherwise returns an error
pub fn get_shelf_metadata_for_edit(shelf_id: &str, principal: &Principal) -> Result<ShelfMetadata, String> {
    let shelf_data = get_shelf_data_internal(shelf_id)?;
    
    if shelf_data.metadata.owner != *principal && !shelf_data.metadata.public_editing {
        return Err(ShelfAuthError::Unauthorized(
            "Unauthorized: You don't have edit permissions for this shelf".to_string()
        ).into());
    }
    
    Ok(shelf_data.metadata)
}

/// Retrieves shelf data for owner, allows mutable operations on metadata and content via callback.
pub fn get_shelf_parts_for_owner_mut<F, R>(
    shelf_id: &str,
    principal: &Principal,
    callback: F,
) -> Result<R, String>
where
    F: FnOnce(&mut ShelfMetadata, &mut ShelfContent) -> Result<R, String>,
{
    // First verify ownership using metadata (read-only)
    if !is_shelf_owner(shelf_id, principal)? {
        return Err(ShelfAuthError::Unauthorized(
            "Unauthorized: Only shelf owner can perform this action".to_string(),
        )
        .into());
    }

    // Load ShelfData
    let mut shelf_data = get_shelf_data_internal(shelf_id)?;

    // Execute the callback with mutable metadata and content
    let result = callback(&mut shelf_data.metadata, &mut shelf_data.content)?;

    // Update the timestamp on metadata
    shelf_data.metadata.updated_at = ic_cdk::api::time();

    // Save the updated ShelfData
    SHELF_DATA.with(|map_ref| {
        map_ref.borrow_mut().insert(shelf_id.to_string(), shelf_data);
    });

    Ok(result)
}

/// Retrieves shelf data for editor, allows mutable operations on metadata and content via callback.
pub fn get_shelf_parts_for_edit_mut<F, R>(
    shelf_id: &str,
    principal: &Principal,
    callback: F,
) -> Result<R, String>
where
    F: FnOnce(&mut ShelfMetadata, &mut ShelfContent) -> Result<R, String>,
{
    // First verify edit permissions using metadata (read-only)
    if !can_edit_shelf(shelf_id, principal)? {
        return Err(ShelfAuthError::Unauthorized(
            "Unauthorized: You don't have edit permissions for this shelf".to_string(),
        )
        .into());
    }

    // Load ShelfData
    let mut shelf_data = get_shelf_data_internal(shelf_id)?;

    // Execute the callback with mutable metadata and content
    let result = callback(&mut shelf_data.metadata, &mut shelf_data.content)?;

    // Update the timestamp on metadata
    shelf_data.metadata.updated_at = ic_cdk::api::time();

    // Save the updated ShelfData
    SHELF_DATA.with(|map_ref| {
        map_ref.borrow_mut().insert(shelf_id.to_string(), shelf_data);
    });

    Ok(result)
} 