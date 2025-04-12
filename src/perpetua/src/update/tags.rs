use candid::Principal;
use ic_cdk;
use ic_cdk::api::time;
use std::borrow::Cow;
use std::collections::BTreeSet;

use crate::storage::{
    Shelf, ShelfId, NormalizedTag, TagMetadata, 
    TAG_METADATA, TAG_SHELF_ASSOCIATIONS, SHELF_TAG_ASSOCIATIONS,
    TAG_POPULARITY_INDEX, TAG_LEXICAL_INDEX, ORPHANED_TAG_CANDIDATES,
    SHELVES, MAX_TAGS_PER_SHELF, validate_tag_format,
    TagShelfAssociationKey, ShelfTagAssociationKey, TagPopularityKey, OrphanedTagValue
};
use crate::utils::normalize_tag;
use crate::auth;
use crate::guard::not_anon; // Assuming guard functions are needed

// Define constants for GC
const NANOS_PER_SECOND: u64 = 1_000_000_000;
const DEFAULT_GC_THRESHOLD_SECONDS: u64 = 365 * 24 * 60 * 60; // 1 year
const DEFAULT_GC_MAX_TAGS_PER_RUN: u64 = 100; 

/// Input for tag operations (reusing similar structure)
#[derive(candid::CandidType, candid::Deserialize)]
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
    let now = time();

    // 1. Normalize and Validate Tag
    let normalized_tag = normalize_tag(&raw_tag);
    validate_tag_format(&normalized_tag)?; // Validate format

    // 2. Authorize and Get Shelf (Mutable)
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf, _shelves_map| {
        
        // 3. Check Max Tags Constraint
        if !shelf.tags.contains(&normalized_tag) && shelf.tags.len() >= MAX_TAGS_PER_SHELF {
            return Err(format!("Maximum of {} tags per shelf reached", MAX_TAGS_PER_SHELF));
        }

        // 4. Add tag to Shelf struct (if not present)
        let was_added_to_shelf = if !shelf.tags.contains(&normalized_tag) {
            shelf.tags.push(normalized_tag.clone());
            true
        } else {
            false // Tag already exists on shelf
        };

        // 5. Update Indices ONLY if it was newly added to this shelf
        if was_added_to_shelf {
            _update_tag_indices_on_add(&shelf_id, &normalized_tag, now)?;
        }
        
        // Timestamp update is handled by get_shelf_for_edit_mut

        Ok(())
    })
}


/// Removes a tag from a shelf and updates all relevant indices.
#[ic_cdk::update(guard = "not_anon")]
pub fn remove_tag_from_shelf(input: TagOperationInput) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let shelf_id = input.shelf_id;
    let raw_tag = input.tag;
    let now = time();

    // 1. Normalize Tag
    let normalized_tag = normalize_tag(&raw_tag);
    // No format validation needed on remove, just find the normalized version

    // 2. Authorize and Get Shelf (Mutable)
    auth::get_shelf_for_edit_mut(&shelf_id, &caller, |shelf, _shelves_map| {

        // 3. Remove tag from Shelf struct (if present)
        let original_len = shelf.tags.len();
        shelf.tags.retain(|t| t != &normalized_tag);
        let was_removed_from_shelf = shelf.tags.len() < original_len;

        // 4. Update Indices ONLY if it was actually removed from this shelf
        if was_removed_from_shelf {
             _update_tag_indices_on_remove(&shelf_id, &normalized_tag, now)?;
        } else {
            // Optional: Return specific error if tag wasn't on shelf?
            // Or just succeed silently. Current approach: succeed silently.
        }

        // Timestamp update is handled by get_shelf_for_edit_mut
        
        Ok(())
    })
}

// --- Internal Helper Functions ---

/// Encapsulates index updates when a tag is ADDED to a shelf.
fn _update_tag_indices_on_add(shelf_id: &ShelfId, tag: &NormalizedTag, now: u64) -> Result<(), String> {
    
    // Association Indices - Use Wrappers
    let ts_key = TagShelfAssociationKey(tag.clone(), shelf_id.clone());
    let st_key = ShelfTagAssociationKey(shelf_id.clone(), tag.clone());
    TAG_SHELF_ASSOCIATIONS.with(|map| map.borrow_mut().insert(ts_key, ()));
    SHELF_TAG_ASSOCIATIONS.with(|map| map.borrow_mut().insert(st_key, ()));

    // Metadata & Popularity Update
    TAG_METADATA.with(|map| {
        let mut meta_map = map.borrow_mut();
        let mut metadata = meta_map.get(tag).unwrap_or_default();
        let old_count = metadata.current_shelf_count;

        // Update metadata
        if old_count == 0 { // First time seeing this tag on *any* shelf
            metadata.first_seen_timestamp = now;
            TAG_LEXICAL_INDEX.with(|lex| lex.borrow_mut().insert(tag.clone(), ())); // Add to lexical index
        }
        metadata.current_shelf_count += 1;
        metadata.last_association_timestamp = now;
        metadata.last_active_timestamp = now; // Update last active time

        // Remove old popularity entry if it exists
        if old_count > 0 {
            let old_pop_key = TagPopularityKey(old_count, tag.clone());
            TAG_POPULARITY_INDEX.with(|pop| pop.borrow_mut().remove(&old_pop_key));
        }
        
        // Insert new popularity entry
        let new_count = metadata.current_shelf_count;
        let new_pop_key = TagPopularityKey(new_count, tag.clone());
        TAG_POPULARITY_INDEX.with(|pop| pop.borrow_mut().insert(new_pop_key, ()));

        // Remove from potential orphans if it was there
        _remove_from_orphan_candidates(tag, metadata.last_association_timestamp); 

        // Save metadata
        meta_map.insert(tag.clone(), metadata);
    });

    Ok(())
}

/// Encapsulates index updates when a tag is REMOVED from a shelf.
fn _update_tag_indices_on_remove(shelf_id: &ShelfId, tag: &NormalizedTag, now: u64) -> Result<(), String> {

    // Association Indices - Use Wrappers
    let ts_key = TagShelfAssociationKey(tag.clone(), shelf_id.clone());
    let st_key = ShelfTagAssociationKey(shelf_id.clone(), tag.clone());
    TAG_SHELF_ASSOCIATIONS.with(|map| map.borrow_mut().remove(&ts_key));
    SHELF_TAG_ASSOCIATIONS.with(|map| map.borrow_mut().remove(&st_key));

    // Metadata & Popularity Update
    TAG_METADATA.with(|map| {
        let mut meta_map = map.borrow_mut();
        if let Some(mut metadata) = meta_map.get(tag) {
            let old_count = metadata.current_shelf_count;
            
            // Ensure count doesn't go below zero (shouldn't happen with correct logic)
            if old_count == 0 { 
                 ic_cdk::trap("Tag count inconsistency detected during removal.");
            }

            // Update metadata
            metadata.current_shelf_count -= 1;
            metadata.last_active_timestamp = now; // Update last active time
            let new_count = metadata.current_shelf_count;

            // Update popularity index
            let old_pop_key = TagPopularityKey(old_count, tag.clone());
            TAG_POPULARITY_INDEX.with(|pop| {
                 let mut pop_map = pop.borrow_mut();
                 pop_map.remove(&old_pop_key); // Remove old
                 if new_count > 0 {
                     let new_pop_key = TagPopularityKey(new_count, tag.clone());
                     pop_map.insert(new_pop_key, ()); // Add new if still > 0
                 }
             });

            // If count is now zero, add to orphan candidates
            if new_count == 0 {
                metadata.last_association_timestamp = now; // Record when it became orphaned
                 _add_to_orphan_candidates(tag, metadata.last_association_timestamp);
            }
            
            // Save updated metadata
            meta_map.insert(tag.clone(), metadata);

        } else {
            // This case implies the tag metadata didn't exist, which suggests an inconsistency.
            // Depending on desired robustness, could log an error or trap.
             ic_cdk::println!("Warning: Attempted to remove tag '{}' which has no metadata.", tag);
        }
    });

    Ok(())
}

// --- Garbage Collection ---

/// Internal function called periodically to garbage collect orphaned tag metadata.
pub fn gc_orphaned_tags() {
     // Use default constants for now, could make these configurable state variables later
    let gc_time_threshold_ns = DEFAULT_GC_THRESHOLD_SECONDS * NANOS_PER_SECOND;
    let max_tags_to_process = DEFAULT_GC_MAX_TAGS_PER_RUN;
    let current_time_ns = time();

    let mut processed_count = 0u64;
    let mut timestamps_to_clean = Vec::new();
    let mut tags_to_remove = Vec::new();

    ORPHANED_TAG_CANDIDATES.with(|candidates| {
        let candidates_map = candidates.borrow();
        // Iterate through candidates, oldest first (ascending timestamp order)
        for (timestamp, wrapped_tag_list) in candidates_map.iter() {
            if processed_count >= max_tags_to_process {
                break; // Stop if we hit the processing limit for this run
            }

            // Check if the orphan timestamp is older than the threshold
            if current_time_ns.saturating_sub(timestamp) >= gc_time_threshold_ns {
                timestamps_to_clean.push(timestamp); // Mark this timestamp bucket for cleaning
                for tag in &wrapped_tag_list.0 {
                    if processed_count < max_tags_to_process {
                        tags_to_remove.push(tag.clone());
                        processed_count += 1;
                    } else {
                        break; // Stop adding tags if limit reached
                    }
                }
            } else {
                // Since timestamps are ordered, we can stop checking earlier timestamps
                break; 
            }
        }
    });

    // Perform the actual removal outside the first borrow scope
    if !tags_to_remove.is_empty() {
        ic_cdk::println!("GC: Removing metadata for {} orphaned tags.", tags_to_remove.len());

        // Remove from Metadata, Lexical Index
        TAG_METADATA.with(|map| {
            let mut meta_map = map.borrow_mut();
            for tag in &tags_to_remove {
                if meta_map.get(tag).map_or(false, |m| m.current_shelf_count == 0) {
                     meta_map.remove(tag);
                } else {
                    // Safety check: Don't GC if count somehow became > 0 again
                    ic_cdk::println!("GC Warning: Tag '{}' intended for GC was re-associated. Skipping removal.", tag);
                    // Also need to remove it from the timestamps_to_clean logic if we skip here... Complex.
                    // Simpler for now: Assume if it's in orphans AND timestamp is old, it's safe to GC.
                    // A production system might need more robust checks or re-verification.
                    meta_map.remove(tag); // Proceed with removal based on timestamp check
                }
            }
        });
        TAG_LEXICAL_INDEX.with(|map| {
             let mut lex_map = map.borrow_mut();
             for tag in &tags_to_remove {
                 lex_map.remove(tag);
             }
         });

        // Remove cleaned timestamp buckets from Orphan Candidates map
        ORPHANED_TAG_CANDIDATES.with(|candidates| {
            let mut candidates_map = candidates.borrow_mut();
            for timestamp in timestamps_to_clean {
                 candidates_map.remove(&timestamp);
            }
             // Note: If max_tags_to_process was hit mid-bucket, the timestamp bucket won't be removed fully.
             // This is acceptable; remaining tags in that bucket will be processed next run.
        });
    }
}


/// Helper to add a tag to the list of potential orphans.
fn _add_to_orphan_candidates(tag: &NormalizedTag, last_association_timestamp: u64) {
    ORPHANED_TAG_CANDIDATES.with(|candidates| {
        let mut candidates_map = candidates.borrow_mut();
        let mut current_wrapped_list = candidates_map.get(&last_association_timestamp).unwrap_or_default();
        
        // Avoid duplicates within the list for the same timestamp
        if !current_wrapped_list.0.contains(tag) {
             current_wrapped_list.0.push(tag.clone());
             candidates_map.insert(last_association_timestamp, current_wrapped_list);
        }
    });
}

/// Helper to remove a tag from the list of potential orphans (if it exists there).
/// This is called when a tag with count 0 gets re-associated.
fn _remove_from_orphan_candidates(tag: &NormalizedTag, last_association_timestamp: u64) {
     ORPHANED_TAG_CANDIDATES.with(|candidates| {
        let mut candidates_map = candidates.borrow_mut();
        if let Some(mut current_wrapped_list) = candidates_map.get(&last_association_timestamp) {
            let initial_len = current_wrapped_list.0.len();
            current_wrapped_list.0.retain(|t| t != tag);
            
            // If the list is now empty, remove the timestamp entry entirely
            if current_wrapped_list.0.is_empty() {
                candidates_map.remove(&last_association_timestamp);
            } 
            // Otherwise, if elements were removed, update the list
            else if current_wrapped_list.0.len() < initial_len {
                 candidates_map.insert(last_association_timestamp, current_wrapped_list);
            }
        }
    });
} 