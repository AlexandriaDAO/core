use candid::{CandidType, Deserialize, Principal};
use crate::storage::{Item, ItemContent, SHELVES, NFT_SHELVES, USER_SHELVES, create_shelf, GLOBAL_TIMELINE};
use crate::guard::not_anon;
use crate::auth;

/// Represents the data needed to update a shelf's metadata
#[derive(CandidType, Deserialize)]
pub struct ShelfUpdate {
    pub title: Option<String>,
    pub description: Option<String>,
    pub items: Option<Vec<Item>>,
}

/// Creates a new shelf with the provided metadata and items
/// 
/// Stores the newly created shelf in the global registry and
/// establishes the appropriate ownership and reference tracking.
#[ic_cdk::update(guard = "not_anon")]
pub async fn store_shelf(
    title: String,
    description: Option<String>,
    items: Vec<Item>,
) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let shelf = create_shelf(title, description, items).await?;
    let shelf_id = shelf.shelf_id.clone();
    let now = shelf.created_at;

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

    SHELVES.with(|shelves| {
        shelves.borrow_mut().insert(shelf_id.clone(), shelf.clone());
    });

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

    Ok(shelf_id)
}

/// Updates the metadata (title and/or description) of an existing shelf
/// 
/// Only users with edit permissions can modify shelf metadata.
#[ic_cdk::update(guard = "not_anon")]
pub fn update_shelf_metadata(
    shelf_id: String, 
    title: Option<String>, 
    description: Option<String>
) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Use the auth helper to handle edit permissions check and update
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf| {
        // Update the title if provided
        if let Some(new_title) = title {
            shelf.title = new_title;
        }
        
        // Update the description (which is already Option<String>)
        shelf.description = description;
        
        // The timestamp will be updated by the auth helper
        Ok(())
    })
}

/// Manually rebalances the item positions within a shelf
/// 
/// This can be useful when many reorderings have caused position values to become too close,
/// which could lead to precision issues or unexpected ordering behavior.
#[ic_cdk::update(guard = "not_anon")]
pub fn rebalance_shelf_items(shelf_id: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Use the auth helper to handle edit permissions check and update
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf| {
        // Force a rebalance
        shelf.rebalance_positions();
        Ok(())
    })
} 