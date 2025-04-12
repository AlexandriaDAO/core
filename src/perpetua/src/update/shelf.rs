use candid::{CandidType, Deserialize};
use crate::storage::{Item, ItemContent, SHELVES, NFT_SHELVES, USER_SHELVES, create_shelf, GLOBAL_TIMELINE, ShelfId, NormalizedTag};
use crate::guard::not_anon;
use crate::auth;

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
/// Note: Initial tag association must now happen via explicit calls to add_tag_to_shelf.
#[ic_cdk::update(guard = "not_anon")]
pub async fn store_shelf(
    title: String,
    description: Option<String>,
    items: Vec<Item>,
    tags: Option<Vec<String>>, // Still accepts raw tags for shelf creation
) -> Result<ShelfId, String> { // Return ShelfId (String)
    let caller = ic_cdk::caller();
    
    // Create the shelf - create_shelf now handles normalization/validation
    let shelf = create_shelf(title, description, items, tags).await?;
    let shelf_id = shelf.shelf_id.clone();
    let initial_tags = shelf.tags.clone(); // Get normalized tags from created shelf
    let now = shelf.created_at;

    // Store in SHELVES first
    SHELVES.with(|shelves| {
        shelves.borrow_mut().insert(shelf_id.clone(), shelf.clone());
    });

    // Store NFT references
    for item in shelf.items.values() {
        if let ItemContent::Nft(nft_id) = &item.content {
            NFT_SHELVES.with(|nft_shelves| {
                let mut nft_map = nft_shelves.borrow_mut();
                let mut shelves = nft_map.get(nft_id).unwrap_or_default();
                shelves.0.push(shelf_id.clone());
                nft_map.insert(nft_id.to_string(), shelves);
            });
        }
    }

    // Update user shelf tracking
    USER_SHELVES.with(|user_shelves| {
        let mut user_map = user_shelves.borrow_mut();
        let mut user_shelves_set = user_map.get(&caller).unwrap_or_default();
        user_shelves_set.0.insert((now, shelf_id.clone()));
        user_map.insert(caller, user_shelves_set);
    });

    // Add shelf to the global timeline for public discoverability
    GLOBAL_TIMELINE.with(|timeline| {
        let mut timeline_map = timeline.borrow_mut();
        timeline_map.insert(now, shelf_id.clone());
    });
    
    // --- Defer Tag Association ---
    // The initial tags stored on the shelf struct are now set.
    // The actual association and index updates need to happen via calls 
    // to the new add_tag_to_shelf function from update::tags.
    // This function (store_shelf) *only* creates the shelf itself.
    // The caller (e.g., frontend) is responsible for making subsequent
    // add_tag_to_shelf calls for the initial_tags if needed. 
    // We return the shelf_id and the normalized initial tags for this purpose.

    // Returning just the shelf_id as per original function signature change in .did
    Ok(shelf_id) 
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
    
    // Use the auth helper - update closure to accept the (unused) map argument
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf, _shelves_map| {
        // Update the title if provided and not empty
        if let Some(new_title) = title {
            if new_title.trim().is_empty() {
                return Err("Title cannot be empty".to_string());
            }
            if new_title.len() > 100 {
                 return Err("Title is too long (max 100 characters)".to_string());
            }
            shelf.title = new_title;
        }
        
        // Update the description if provided
        if let Some(ref desc) = description {
             if desc.len() > 500 {
                 return Err("Description is too long (max 500 characters)".to_string());
             }
        }
        // Directly assign, allowing None to clear the description
        shelf.description = description;
        
        // The timestamp will be updated by the auth helper
        Ok(())
    })
} 