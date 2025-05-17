use candid::{CandidType, Deserialize};
use crate::storage::{Item, ItemContent, SHELVES, NFT_SHELVES, USER_SHELVES, create_shelf, GLOBAL_TIMELINE, ShelfId, GlobalTimelineItemValue, ShelfMetadata, ShelfContent, SHELF_METADATA};
use crate::guard::not_anon;
use super::tags::add_tag_to_metadata_maps;

// --- Constants ---
const MAX_USER_SHELVES: usize = 500;

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
    
    // --- Check Shelf Limit ---
    let current_shelf_count = USER_SHELVES.with(|user_shelves| {
        user_shelves.borrow()
            .get(&caller)
            .map_or(0, |shelves_set| shelves_set.0.len())
    });

    if current_shelf_count >= MAX_USER_SHELVES {
        return Err(format!("User cannot own more than {} shelves.", MAX_USER_SHELVES));
    }
    
    // Create the in-memory shelf - create_shelf now handles normalization/validation
    let shelf_in_memory = create_shelf(title, description, items, tags).await?;
    let shelf_id = shelf_in_memory.shelf_id.clone();
    let now = shelf_in_memory.created_at; // Use created_at from the in-memory shelf

    // Deconstruct the in-memory Shelf into ShelfMetadata and ShelfContent parts
    let shelf_metadata = ShelfMetadata {
        shelf_id: shelf_in_memory.shelf_id.clone(),
        title: shelf_in_memory.title.clone(),
        description: shelf_in_memory.description.clone(),
        owner: shelf_in_memory.owner,
        created_at: shelf_in_memory.created_at,
        updated_at: shelf_in_memory.updated_at, // Should be same as created_at initially
        appears_in: shelf_in_memory.appears_in.clone(),
        tags: shelf_in_memory.tags.clone(),
        public_editing: shelf_in_memory.public_editing,
    };

    let shelf_content = ShelfContent {
        items: shelf_in_memory.items.clone(),
        item_positions: shelf_in_memory.item_positions.clone(),
    };

    // --- COMMIT PHASE ---
    // From this point onwards, any failure MUST cause a panic to ensure atomicity.

    // Store ShelfMetadata and ShelfContent
    SHELF_METADATA.with(|metadata_map_ref| {
        // metadata_map_ref.borrow_mut().insert(shelf_id.clone(), shelf_metadata.clone());
        // If insert can theoretically fail (e.g. OOM), it should panic. StableBTreeMap's insert doesn't return Result.
        // Panics from Storable trait's to_bytes (Encode!) are expected and desired here on failure.
        if metadata_map_ref.borrow_mut().insert(shelf_id.clone(), shelf_metadata.clone()).is_some() {
            // This case (replacing an existing item with the same key) should ideally not happen for a new shelf_id.
            // Depending on exact guarantees of shelf_id generation, this might indicate a hash collision or reuse.
            // For atomicity, if this is an unexpected state, a panic might be justified.
            // However, StableBTreeMap's insert replaces and returns the old value.
            // For now, we assume shelf_id is unique and this won't be an issue of replacing an *intended* different shelf.
        }
    });
    SHELVES.with(|content_map_ref| { // SHELVES now stores ShelfContent
        // content_map_ref.borrow_mut().insert(shelf_id.clone(), shelf_content);
        if content_map_ref.borrow_mut().insert(shelf_id.clone(), shelf_content).is_some() {
            // Similar consideration as above for SHELF_METADATA.
        }
    });

    // Store NFT references (using data from shelf_metadata or shelf_in_memory)
    for item in shelf_in_memory.items.values() { // Iterate over items from in-memory shelf
        if let ItemContent::Nft(nft_id) = &item.content {
            NFT_SHELVES.with(|nft_shelves| {
                let mut nft_map = nft_shelves.borrow_mut();
                let mut shelves = nft_map.get(nft_id).unwrap_or_default();
                shelves.0.push(shelf_id.clone());
                // nft_map.insert(nft_id.to_string(), shelves);
                if nft_map.insert(nft_id.to_string(), shelves).is_some() {
                    // If replacing, it means the NFT_ID was already there, we're just adding a new shelf_id to its list.
                }
            });
        }
    }

    // Update user shelf tracking
    USER_SHELVES.with(|user_shelves| {
        let mut user_map = user_shelves.borrow_mut();
        let mut user_shelves_set = user_map.get(&caller).unwrap_or_default();
        user_shelves_set.0.insert((now, shelf_id.clone()));
        // user_map.insert(caller, user_shelves_set);
        if user_map.insert(caller, user_shelves_set).is_some() {
            // Replacing the user's entry, expected if they already have other shelves.
        }
    });

    // Add shelf to the global timeline for public discoverability
    GLOBAL_TIMELINE.with(|timeline_map_ref| {
        // timeline_map_ref.borrow_mut().insert(
        //     now, // This 'now' is shelf_in_memory.created_at
        //     GlobalTimelineItemValue {
        //         shelf_id: shelf_metadata.shelf_id.clone(), 
        //         owner: shelf_metadata.owner, 
        //         tags: shelf_metadata.tags.clone(), 
        //         public_editing: shelf_metadata.public_editing, 
        //     }
        // );
        if timeline_map_ref.borrow_mut().insert(
            now, // This 'now' is shelf_in_memory.created_at
            GlobalTimelineItemValue {
                shelf_id: shelf_metadata.shelf_id.clone(), 
                owner: shelf_metadata.owner, 
                tags: shelf_metadata.tags.clone(), 
                public_editing: shelf_metadata.public_editing, 
            }
        ).is_some() {
            // This means a timeline entry for this exact timestamp 'now' was replaced.
            // Highly unlikely for u64 ns timestamps unless multiple shelves are created by same user in same transaction (not possible from UI)
            // or a hash collision on timestamp (extremely unlikely).
            // If this happens, it's a critical issue. For now, we let it replace. A panic could be justified if 'now' must be unique.
            // ic_cdk::trap(&format!("Duplicate timestamp in GLOBAL_TIMELINE: {}", now));
        }
    });
    
    // MODIFICATION: Call add_tag_to_metadata_maps for each tag.
    // This helper now panics on failure, ensuring atomicity for tag-related map updates.
    // The original .map_err and ? are removed.
    // shelf_metadata.tags are already normalized by create_shelf
    for tag_to_associate in &shelf_metadata.tags {
        // The 'now' timestamp here refers to the shelf creation time.
        // add_tag_to_metadata_maps uses its 'now' param for last_association_timestamp etc.
        // For initial creation, using shelf_metadata.created_at for both 'now' and 'shelf_created_at' in add_tag_to_metadata_maps call
        // or more accurately, 'now' (shelf creation time) for both.
        add_tag_to_metadata_maps(&shelf_id, tag_to_associate, shelf_metadata.created_at, now); 
            // REMOVED: .map_err(|e| format!("Failed to associate tag '{}': {}", tag_to_associate, e))?;
    }

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
    
    // This function now only deals with ShelfMetadata
    // The auth helper get_shelf_parts_for_owner_mut or a new one for metadata only could be used.
    // For simplicity, let's fetch, check, modify, and save metadata directly here.

    SHELF_METADATA.with(|metadata_map_ref| {
        let mut metadata_map = metadata_map_ref.borrow_mut();
        if let Some(mut metadata) = metadata_map.get(&shelf_id).map(|m| m.clone()) {
            // Authorization check
            if metadata.owner != caller {
                return Err("Unauthorized: Only shelf owner can perform this action".to_string());
            }

            // Update the title if provided and not empty
            if let Some(new_title) = title {
                if new_title.trim().is_empty() {
                    return Err("Title cannot be empty".to_string());
                }
                if new_title.len() > 100 {
                     return Err("Title is too long (max 100 characters)".to_string());
                }
                metadata.title = new_title;
            }
            
            // Update the description if provided
            if let Some(ref desc) = description {
                 if desc.len() > 500 {
                     return Err("Description is too long (max 500 characters)".to_string());
                 }
            }
            // Directly assign, allowing None to clear the description
            metadata.description = description;
            
            // Update the timestamp
            metadata.updated_at = ic_cdk::api::time();

            // Save the updated metadata
            metadata_map.insert(shelf_id.clone(), metadata);
            Ok(())
        } else {
            Err(format!("Shelf metadata with ID '{}' not found", shelf_id))
        }
    })
} 