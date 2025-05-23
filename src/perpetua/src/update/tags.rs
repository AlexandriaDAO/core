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

    // --- Phase 2: Recalculate count and update derived data (Metadata & Popularity) ---
    let new_shelf_count = TAG_SHELF_ASSOCIATIONS.with(|map_ref| {
        let map = map_ref.borrow();
        map.iter().filter(|(key, _)| key.0 == *normalized_tag).count() as u64
    });

    let old_shelf_count_for_popularity_removal = if new_shelf_count > 0 { new_shelf_count - 1 } else { 0 };

    TAG_METADATA.with(|map_ref| {
        let mut map = map_ref.borrow_mut();
        let mut entry = map.get(normalized_tag).unwrap_or_default();
        
        if entry.current_shelf_count == 0 && new_shelf_count > 0 { // First time this tag is being added effectively
            entry.first_seen_timestamp = now;
        }
        
        entry.current_shelf_count = new_shelf_count;
        entry.last_association_timestamp = now; // Reflects this specific association event
        entry.last_active_timestamp = now;    // Reflects general activity for the tag
        
        if new_shelf_count > 0 {
            map.insert(normalized_tag.clone(), entry);
        } else {
            // This case should ideally not be hit if we are adding a tag,
            // but as a safeguard if new_shelf_count is somehow 0 after an add.
            map.remove(normalized_tag);
        }
    });

    if old_shelf_count_for_popularity_removal > 0 {
        TAG_POPULARITY_INDEX.with(|pop_map_ref|{
            pop_map_ref.borrow_mut().remove(&TagPopularityKey(old_shelf_count_for_popularity_removal, normalized_tag.clone()));
        });
    }
    if new_shelf_count > 0 {
        TAG_POPULARITY_INDEX.with(|pop_map_ref|{
            pop_map_ref.borrow_mut().insert(TagPopularityKey(new_shelf_count, normalized_tag.clone()), ());
        });
    }
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

    // --- Phase 2: Recalculate count and update derived data (Metadata & Popularity) ---
    let new_shelf_count = TAG_SHELF_ASSOCIATIONS.with(|map_ref| {
        let map = map_ref.borrow();
        map.iter().filter(|(key, _)| key.0 == *normalized_tag).count() as u64
    });

    let old_shelf_count_for_popularity_removal = new_shelf_count + 1; // The count before this removal

    TAG_METADATA.with(|map_ref| {
        let mut map = map_ref.borrow_mut();
        if let Some(mut entry) = map.get(normalized_tag).map(|e| e.clone()) { 
            entry.current_shelf_count = new_shelf_count;
            entry.last_active_timestamp = now; 
            if new_shelf_count == 0 {
                map.remove(normalized_tag); 
            } else {
                map.insert(normalized_tag.clone(), entry);
            }
        }
    });

    // Update Popularity Index
    TAG_POPULARITY_INDEX.with(|pop_map_ref|{
        pop_map_ref.borrow_mut().remove(&TagPopularityKey(old_shelf_count_for_popularity_removal, normalized_tag.clone()));
    });

    if new_shelf_count > 0 {
        TAG_POPULARITY_INDEX.with(|pop_map_ref|{
            pop_map_ref.borrow_mut().insert(TagPopularityKey(new_shelf_count, normalized_tag.clone()), ());
        });
    } else {
        // If the tag is no longer associated with any shelves, remove it from the lexical index as well.
        TAG_LEXICAL_INDEX.with(|lex_map_ref|{
            lex_map_ref.borrow_mut().remove(normalized_tag);
        });
    }
} 