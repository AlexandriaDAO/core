use candid::{CandidType, Deserialize, Principal};
use crate::storage::{Item, ItemContent, SHELVES, NFT_SHELVES, USER_SHELVES, create_shelf, GLOBAL_TIMELINE};
use crate::storage::{validate_tag, add_tag_to_tracking, remove_tag_from_tracking, MAX_TAGS_PER_SHELF, normalize_tag, check_tag_rate_limit};
use crate::guard::not_anon;
use crate::auth;

/// Represents the data needed to update a shelf's metadata
#[derive(CandidType, Deserialize)]
pub struct ShelfUpdate {
    pub title: Option<String>,
    pub description: Option<String>,
    pub items: Option<Vec<Item>>,
}

/// Input for tag operations
#[derive(CandidType, Deserialize)]
pub struct TagOperation {
    pub shelf_id: String,
    pub tag: String,
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
    tags: Option<Vec<String>>, // New parameter for tags
) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let shelf = create_shelf(title, description, items, tags).await?;
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

/// Add a tag to a shelf
///
/// Validates the tag format and ensures the shelf does not exceed
/// the maximum number of allowed tags.
#[ic_cdk::update(guard = "not_anon")]
pub fn add_tag_to_shelf(input: TagOperation) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Check rate limit before processing
    check_tag_rate_limit(&caller)?;
    
    // Normalize and validate the tag
    let normalized_tag = normalize_tag(&input.tag);
    validate_tag(&normalized_tag)?;
    
    // Use auth helper for shelf modification
    auth::get_shelf_for_edit_mut(&input.shelf_id, &caller, |shelf| {
        // Check if tag already exists (after normalization)
        if shelf.tags.iter().any(|t| normalize_tag(t) == normalized_tag) {
            return Ok(());  // Tag already exists, nothing to do
        }
        
        // Check if at max tags limit
        if shelf.tags.len() >= MAX_TAGS_PER_SHELF {
            return Err(format!("Maximum of {} tags per shelf", MAX_TAGS_PER_SHELF));
        }
        
        // Add tag to shelf
        shelf.tags.push(normalized_tag.clone());
        
        // Update tracking
        add_tag_to_tracking(&normalized_tag, &input.shelf_id)?;
        
        Ok(())
    })
}

/// Remove a tag from a shelf
///
/// Removes the specified tag from a shelf and updates the
/// tag tracking indexes accordingly.
#[ic_cdk::update(guard = "not_anon")]
pub fn remove_tag_from_shelf(input: TagOperation) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Normalize the tag for consistent comparison
    let normalized_tag = normalize_tag(&input.tag);
    
    // Use auth helper for shelf modification
    auth::get_shelf_for_edit_mut(&input.shelf_id, &caller, |shelf| {
        // Find tags that match after normalization
        let matching_indices: Vec<usize> = shelf.tags.iter()
            .enumerate()
            .filter(|(_, t)| normalize_tag(t) == normalized_tag)
            .map(|(i, _)| i)
            .collect();
        
        // Remove all matching tags (usually just one)
        for &index in matching_indices.iter().rev() {
            shelf.tags.remove(index);
        }
        
        // Update tracking if we removed any tags
        if !matching_indices.is_empty() {
            remove_tag_from_tracking(&normalized_tag, &input.shelf_id)?;
        }
        
        Ok(())
    })
}

/// Update the tag popularity index in a batch operation
#[ic_cdk::update(guard = "not_anon")]
pub fn update_tag_popularity_batch() -> Result<usize, String> {
    // This function should be called periodically by system maintenance
    let updated_count = crate::storage::update_tag_popularity_index();
    Ok(updated_count)
}

/// Clean up unused tags to prevent unbounded storage growth
#[ic_cdk::update(guard = "not_anon")]
pub fn cleanup_unused_tags() -> Result<usize, String> {
    // This function should be called periodically by system maintenance
    let removed_count = crate::storage::cleanup_unused_tags();
    Ok(removed_count)
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