use candid::{CandidType, Deserialize};
use crate::storage::{Item, ItemContent, ShelfData, SHELF_DATA, NFT_SHELVES, USER_SHELVES, create_shelf, GLOBAL_TIMELINE, ShelfId, GlobalTimelineItemValue, ShelfMetadata, ShelfContent};
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
    
    // TODO: If items are allowed during initial shelf creation in the future,
    // a robust circular reference check (e.g., would_create_cycle from item.rs or storage/shelf_storage.rs)
    // must be performed here or in create_shelf for any ItemContent::Shelf in the initial items.
    // The current Item type in the signature is maintained for Candid compatibility.
    if !items.is_empty() {
        return Err("Initializing shelves with items is currently unsupported. Please create an empty shelf and add items separately.".to_string());
    }
    
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
    let shelf_metadata_for_data = ShelfMetadata {
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

    let shelf_content_for_data = ShelfContent {
        items: shelf_in_memory.items.clone(),
        item_positions: shelf_in_memory.item_positions.clone(),
    };

    let shelf_data_to_store = ShelfData {
        metadata: shelf_metadata_for_data.clone(), // Clone for ShelfData, metadata_for_data is used below for timeline
        content: shelf_content_for_data,
    };

    // --- COMMIT PHASE ---
    // From this point onwards, any failure MUST cause a panic to ensure atomicity.

    // Store ShelfData
    SHELF_DATA.with(|sds_map_ref| {
        if sds_map_ref.borrow_mut().insert(shelf_id.clone(), shelf_data_to_store).is_some() {
            // Log or handle potential overwrite if necessary, though shelf_id should be unique
        }
    });

    // Store NFT references (using data from shelf_metadata or shelf_in_memory)
    for item in shelf_in_memory.items.values() { // Iterate over items from in-memory shelf
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
    GLOBAL_TIMELINE.with(|timeline_map_ref| {
        if timeline_map_ref.borrow_mut().insert(
            now, // This 'now' is shelf_in_memory.created_at
            GlobalTimelineItemValue {
                shelf_id: shelf_metadata_for_data.shelf_id.clone(), 
                owner: shelf_metadata_for_data.owner, 
                tags: shelf_metadata_for_data.tags.clone(), 
                public_editing: shelf_metadata_for_data.public_editing, 
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
    for tag_to_associate in &shelf_metadata_for_data.tags {
        // The 'now' timestamp here refers to the shelf creation time.
        // add_tag_to_metadata_maps uses its 'now' param for last_association_timestamp etc.
        // For initial creation, using shelf_metadata.created_at for both 'now' and 'shelf_created_at' in add_tag_to_metadata_maps call
        // or more accurately, 'now' (shelf creation time) for both.
        add_tag_to_metadata_maps(&shelf_id, tag_to_associate, shelf_metadata_for_data.created_at, now); 
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
    let now = ic_cdk::api::time();

    SHELF_DATA.with(|shelf_data_map_ref| {
        let mut shelf_data_map = shelf_data_map_ref.borrow_mut();
        if let Some(mut shelf_data) = shelf_data_map.get(&shelf_id).map(|sd| sd.clone()) { // Clone to modify
            if shelf_data.metadata.owner != caller && !shelf_data.metadata.public_editing { // Check edit permission
                return Err("Unauthorized: You don\'t have permission to edit this shelf metadata".to_string());
            }

            if let Some(new_title) = title {
                if new_title.trim().is_empty() {
                    return Err("Title cannot be empty".to_string());
                }
                if new_title.len() > 100 {
                     return Err("Title is too long (max 100 characters)".to_string());
                }
                shelf_data.metadata.title = new_title;
            }
            
            if let Some(ref desc_val) = description {
                 if desc_val.len() > 500 {
                     return Err("Description is too long (max 500 characters)".to_string());
                 }
            }
            shelf_data.metadata.description = description;
            
            shelf_data.metadata.updated_at = now;

            shelf_data_map.insert(shelf_id.clone(), shelf_data); // Insert the modified ShelfData
            Ok(())
        } else {
            Err(format!("Shelf with ID '{}' not found", shelf_id))
        }
    })
} 