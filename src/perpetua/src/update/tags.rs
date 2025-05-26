use ic_cdk;
use candid::{CandidType, Deserialize};

use crate::storage::{
    ShelfId, NormalizedTag, TagMetadata,
    TAG_METADATA, TAG_SHELF_ASSOCIATIONS, TAG_POPULARITY_INDEX, TAG_LEXICAL_INDEX,
    SHELF_TAG_ASSOCIATIONS, ShelfTagAssociationKey, MAX_TAGS_PER_SHELF,
    TAG_SHELF_CREATION_TIMELINE_INDEX, TagShelfCreationTimelineKey,
    validate_tag_format
};
use crate::types::{TagPopularityKey, TagShelfAssociationKey as TypesTagShelfAssociationKey};
use crate::utils::{normalize_tag};
use crate::auth;
use crate::guard::not_anon;

/// Input for tag operations (reusing similar structure)
#[derive(CandidType, Deserialize)]
pub struct TagOperationInput {
    pub shelf_id: ShelfId,
    pub tag: String, // Raw tag input
}

/// Adds a tag to a shelf and updates all relevant indices.
/// This is the primary entry point for associating a tag with a shelf.
#[ic_cdk::update(guard = "not_anon")]
pub fn add_tag_to_shelf(input: TagOperationInput) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let shelf_id = input.shelf_id;
    let raw_tag = input.tag;

    let normalized_tag = normalize_tag(&raw_tag);
    validate_tag_format(&normalized_tag)?;

    auth::get_shelf_parts_for_edit_mut(&shelf_id, &caller, |metadata, _content| {
        if metadata.tags.len() >= MAX_TAGS_PER_SHELF && !metadata.tags.contains(&normalized_tag) {
            return Err(format!(
                "Shelf already has the maximum number of tags ({})",
                MAX_TAGS_PER_SHELF
            ));
        }

        if !metadata.tags.contains(&normalized_tag) {
            metadata.tags.push(normalized_tag.clone());
        } else {
            return Err("Tag already exists on shelf".to_string());
        }
        
        let now = ic_cdk::api::time();
        add_tag_to_metadata_maps(&shelf_id, &normalized_tag, metadata.created_at, now);

        Ok(())
    })
}

/// Removes a tag from a shelf and updates all relevant indices.
#[ic_cdk::update(guard = "not_anon")]
pub fn remove_tag_from_shelf(input: TagOperationInput) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let shelf_id = input.shelf_id;
    let raw_tag = input.tag;

    let normalized_tag = normalize_tag(&raw_tag);

    auth::get_shelf_parts_for_edit_mut(&shelf_id, &caller, |metadata, _content| {
        let initial_len = metadata.tags.len();
        metadata.tags.retain(|t| t != &normalized_tag);

        if metadata.tags.len() == initial_len {
            return Err("Tag not found on shelf".to_string());
        }
        
        let now = ic_cdk::api::time();
        remove_tag_from_metadata_maps(&shelf_id, &normalized_tag, metadata.created_at, now);

        Ok(())
    })
}

pub(super) fn add_tag_to_metadata_maps(shelf_id: &ShelfId, normalized_tag: &NormalizedTag, shelf_created_at: u64, now: u64) {
    // --- Phase 1: Update primary associations and basic indexes --- 
    TAG_SHELF_ASSOCIATIONS.with(|map_ref| {
        map_ref.borrow_mut().insert(TypesTagShelfAssociationKey(normalized_tag.clone(), shelf_id.clone()), ());
    });
    
    SHELF_TAG_ASSOCIATIONS.with(|map_ref| {
        map_ref.borrow_mut().insert(ShelfTagAssociationKey { shelf_id: shelf_id.clone(), tag: normalized_tag.clone() }, ());
    });

    // TAG_LEXICAL_INDEX is typically added when a tag first appears or its count > 0.
    // It's managed below based on count. If it's the first time, it will be added.
    // The original code added it here unconditionally, let's preserve that and ensure it's also handled
    // correctly based on count logic for new tags / existing tags.
    // For now, let's ensure it is added if the metadata entry is new or count becomes > 0.
    // The most straightforward is to add it here, and remove it if count drops to 0 in remove_tag_from_metadata_maps
    TAG_LEXICAL_INDEX.with(|map_ref| {
        map_ref.borrow_mut().insert(normalized_tag.clone(), ());
    });

    TAG_SHELF_CREATION_TIMELINE_INDEX.with(|map_ref| {
        map_ref.borrow_mut().insert(
            TagShelfCreationTimelineKey {
                tag: normalized_tag.clone(),
                reversed_created_at: u64::MAX - shelf_created_at,
                shelf_id: shelf_id.clone(),
            },
            (),
        );
    });

    // --- Phase 2: Update Metadata & Popularity Incrementally ---
    TAG_METADATA.with(|map_ref| {
        let mut map = map_ref.borrow_mut();
        // Get the existing metadata or create a new default one.
        // We remove it and re-insert to handle the StableBTreeMap update pattern.
        let mut metadata = map.remove(normalized_tag).unwrap_or_default();

        let old_shelf_count = metadata.current_shelf_count;
        metadata.current_shelf_count += 1; // Increment count
        let new_shelf_count = metadata.current_shelf_count;

        if old_shelf_count == 0 { // This means it's the first time this tag is associated with a shelf
            metadata.first_seen_timestamp = now;
        }
        metadata.last_association_timestamp = now; // Timestamp of this specific association
        metadata.last_active_timestamp = now;    // General activity timestamp for the tag
        
        map.insert(normalized_tag.clone(), metadata); // Store the updated metadata

        // Update Popularity Index
        if old_shelf_count > 0 {
            TAG_POPULARITY_INDEX.with(|pop_map_ref|{
                pop_map_ref.borrow_mut().remove(&TagPopularityKey(old_shelf_count, normalized_tag.clone()));
            });
        }
        // new_shelf_count is guaranteed to be > 0 because we incremented
        TAG_POPULARITY_INDEX.with(|pop_map_ref|{
            pop_map_ref.borrow_mut().insert(TagPopularityKey(new_shelf_count, normalized_tag.clone()), ());
        });
    });
}

fn remove_tag_from_metadata_maps(shelf_id: &ShelfId, normalized_tag: &NormalizedTag, shelf_created_at: u64, now: u64) {
    // --- Phase 1: Remove primary associations and timeline index --- 
    TAG_SHELF_ASSOCIATIONS.with(|map_ref| {
        map_ref.borrow_mut().remove(&TypesTagShelfAssociationKey(normalized_tag.clone(), shelf_id.clone()));
    });

    SHELF_TAG_ASSOCIATIONS.with(|map_ref| {
        map_ref.borrow_mut().remove(&ShelfTagAssociationKey { shelf_id: shelf_id.clone(), tag: normalized_tag.clone() });
    });
    
    TAG_SHELF_CREATION_TIMELINE_INDEX.with(|map_ref| {
        map_ref.borrow_mut().remove(&TagShelfCreationTimelineKey {
            tag: normalized_tag.clone(),
            reversed_created_at: u64::MAX - shelf_created_at,
            shelf_id: shelf_id.clone(),
        });
    });

    // --- Phase 2: Update Metadata & Popularity Incrementally ---
    let mut final_shelf_count: u64 = 0;
    let mut popularity_old_count: u64 = 0;
    let mut popularity_new_count: u64 = 0;
    let mut tag_existed_in_metadata_and_was_processed = false;

    TAG_METADATA.with(|map_ref| {
        let mut map = map_ref.borrow_mut();
        if let Some(mut metadata) = map.remove(normalized_tag) { // Try to get and remove
            tag_existed_in_metadata_and_was_processed = true;
            popularity_old_count = metadata.current_shelf_count;

            if metadata.current_shelf_count > 0 {
                metadata.current_shelf_count -= 1; // Decrement count
            }
            // If count was already 0 (or became 0), it implies an issue or that it's the last one.

            metadata.last_active_timestamp = now; // Update activity timestamp
            popularity_new_count = metadata.current_shelf_count;
            final_shelf_count = metadata.current_shelf_count;

            if metadata.current_shelf_count > 0 {
                map.insert(normalized_tag.clone(), metadata); // Put back if count is still > 0
            }
            // If current_shelf_count is 0, the metadata entry remains removed.
        }
        // If tag was not in metadata, final_shelf_count remains 0, 
        // and popularity counts remain 0. Nothing to do for this tag in TAG_METADATA.
    });

    // Update Popularity Index
    // Only update if the tag was in metadata and its count potentially changed.
    if tag_existed_in_metadata_and_was_processed && popularity_old_count > 0 {
        TAG_POPULARITY_INDEX.with(|pop_map_ref|{
            pop_map_ref.borrow_mut().remove(&TagPopularityKey(popularity_old_count, normalized_tag.clone()));
        });
    }
    if tag_existed_in_metadata_and_was_processed && popularity_new_count > 0 {
        TAG_POPULARITY_INDEX.with(|pop_map_ref|{
            pop_map_ref.borrow_mut().insert(TagPopularityKey(popularity_new_count, normalized_tag.clone()), ());
        });
    }

    // Update Lexical Index: Remove if the count has dropped to zero.
    if final_shelf_count == 0 {
        // This means either the tag was not in metadata (so its count is considered 0),
        // or it was in metadata and its count decremented to 0.
        TAG_LEXICAL_INDEX.with(|lex_map_ref|{
            lex_map_ref.borrow_mut().remove(normalized_tag);
        });
    }
} 