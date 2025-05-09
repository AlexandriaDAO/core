use candid::{CandidType, Principal, Nat};
use ic_cdk;
use std::ops::Bound;

// rand traits and PRNG implementation
use rand::seq::SliceRandom;
use rand_chacha::ChaCha20Rng;
use rand_core::SeedableRng;

// Import necessary items from storage
use crate::storage::{
    SHELVES, TAG_SHELF_ASSOCIATIONS, NFT_SHELVES,
    Item, ShelfId, ItemId, // Use ItemId directly
    USER_SHELVES, GLOBAL_TIMELINE, USER_PROFILE_ORDER, // Added for moved functions
    FOLLOWED_USERS, FOLLOWED_TAGS, // Added for moved functions
    UserProfileOrder, // Added for get_user_shelves
    RANDOM_SHELF_CANDIDATES, // <-- Import new map for random feed
};
// Import necessary types from types module
use crate::types::TagShelfAssociationKey;
// Import utils
use crate::utils::normalize_tag;
// Import types/functions from the parent query module
use super::follows::{ 
    // Add Offset types back for get_user_shelves
    OffsetPaginationInput, OffsetPaginatedResult, 
    CursorPaginationInput, CursorPaginatedResult, // Import pagination types
    QueryResult, QueryError, // Import result types
    ShelfPublic, // Import public shelf structure
    DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT, // Import pagination constants
};
// Add other necessary imports
use crate::guard::not_anon;


// --- ShelfPositionMetrics Struct (Moved from query.rs) ---
#[derive(CandidType, Debug)]
pub struct ShelfPositionMetrics {
    pub item_count: usize,
    pub min_gap: f64,
    pub avg_gap: f64,
    pub max_gap: f64,
}


// --- Moved Query Functions ---

#[ic_cdk::query]
pub fn get_shelf(shelf_id: ShelfId) -> QueryResult<ShelfPublic> {
    SHELVES.with(|shelves| {
        shelves
            .borrow()
            .get(&shelf_id)
            .map(|s| s.clone())
            .map(ShelfPublic::from) // Assumes ShelfPublic::from is accessible (it is via super::query::ShelfPublic)
            .ok_or(QueryError::ShelfNotFound)
    })
}

#[ic_cdk::query]
pub fn get_shelf_items(
    shelf_id: ShelfId,
    pagination: CursorPaginationInput<ItemId> // Use ItemId from storage
) -> QueryResult<CursorPaginatedResult<Item, ItemId>> { // Use Item and ItemId from storage
    let limit = pagination.get_limit(); // get_limit() is pub(super) in query.rs

    // Get the internal shelf first
    let internal_shelf = SHELVES.with(|s| s.borrow().get(&shelf_id).map(|sh| sh.clone()))
        .ok_or(QueryError::ShelfNotFound)?;

    // Get ordered item IDs from the tracker O(N)
    let ordered_ids: Vec<u32> = internal_shelf.item_positions.iter_keys_ordered().cloned().collect();
    let total_items = ordered_ids.len();

    if total_items == 0 {
        return Ok(CursorPaginatedResult {
            items: Vec::new(),
            next_cursor: None,
            limit: pagination.limit,
        });
    }

    // Find the starting index based on the cursor in the ordered ID list
    let start_index = match pagination.cursor {
        Some(cursor_id) => {
            ordered_ids
                .iter()
                .position(|&id| id == cursor_id)
                .map(|idx| idx + 1) // Start from the item *after* the cursor
                .unwrap_or(0)
        }
        None => 0,
    };

    // Slice the ID vector
    let end_index = (start_index + limit).min(total_items);
    let page_ids: &[u32] = if start_index >= total_items {
        &[]
    } else {
        &ordered_ids[start_index..end_index]
    };

    // Fetch only the items for the current page using the IDs O(page_limit * log N)
    let items_page: Vec<Item> = page_ids // Use Item from storage
        .iter()
        .filter_map(|id| internal_shelf.items.get(id).map(|i| i.clone()))
        .collect();

    // Determine the next cursor (ID of the last item on *this* page)
     let correct_next_cursor = if end_index < total_items {
         // The cursor should be the ID of the last item INCLUDED in the current page
         page_ids.last().cloned()
     } else {
         None
     };


    Ok(CursorPaginatedResult {
        items: items_page,
        next_cursor: correct_next_cursor, // Use the corrected cursor logic
        limit: pagination.limit, 
    })
}

/// Get optimization metrics for a shelf's positions
/// This helps frontend clients identify when a shelf needs rebalancing
#[ic_cdk::query]
pub fn get_shelf_position_metrics(shelf_id: ShelfId) -> Result<ShelfPositionMetrics, String> {
    SHELVES.with(|shelves| {
        let shelves_map = shelves.borrow();

        if let Some(shelf) = shelves_map.get(&shelf_id).map(|s| s.clone()) {
            let position_count = shelf.item_positions.len();

            if position_count < 2 {
                return Ok(ShelfPositionMetrics {
                    item_count: position_count,
                    min_gap: 0.0,
                    avg_gap: 0.0,
                    max_gap: 0.0,
                });
            }

            let mut positions: Vec<f64> = shelf.item_positions.iter_ordered().map(|(_, pos)| pos).collect();
            positions.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));

            let mut min_gap = f64::MAX;
            let mut max_gap = 0.0;
            let mut sum_gap = 0.0;

            for i in 1..positions.len() {
                let gap = positions[i] - positions[i-1];
                if gap < 0.0 { /* Handle potential floating point issue or ordering bug */ continue; }
                min_gap = f64::min(min_gap, gap);
                max_gap = f64::max(max_gap, gap);
                sum_gap += gap;
            }

            let avg_gap = if positions.len() > 1 { sum_gap / (positions.len() - 1) as f64 } else { 0.0 };

            Ok(ShelfPositionMetrics {
                item_count: position_count,
                min_gap,
                avg_gap,
                max_gap,
            })
        } else {
            // Use QueryError::ShelfNotFound if appropriate, or keep String for specific error message
            Err("Shelf not found".to_string())
            // Or: Err(QueryError::ShelfNotFound) - would require changing function signature return type
        }
    })
}


/// Get shelf IDs associated with a specific tag (Paginated).
/// Returns an empty list if the tag is not found.
#[ic_cdk::query]
pub fn get_shelves_by_tag(
    tag: String,
    pagination: CursorPaginationInput<TagShelfAssociationKey> // Use TagShelfAssociationKey from types
) -> QueryResult<CursorPaginatedResult<ShelfId, TagShelfAssociationKey>> { // Use ShelfId from storage
    let normalized_tag = normalize_tag(&tag);
    if normalized_tag.is_empty() {
        // Return empty result for empty tag
        return Ok(CursorPaginatedResult {
            items: Vec::new(),
            next_cursor: None,
            limit: pagination.limit,
        });
    }

    let limit = pagination.get_limit();
    let limit_plus_one = limit + 1;
    let mut result_keys: Vec<TagShelfAssociationKey> = Vec::with_capacity(limit_plus_one);

    TAG_SHELF_ASSOCIATIONS.with(|assoc| {
        let map = assoc.borrow();

        // Define the iteration range start based on the cursor
        let start_bound = match pagination.cursor {
            // If cursor exists, start EXCLUSIVEly after it
            Some(cursor_key) => {
                // Basic validation: cursor tag should match requested tag
                if cursor_key.0 != normalized_tag {
                    return Err(QueryError::InvalidCursor);
                }
                Bound::Excluded(cursor_key)
            },
            // If no cursor, start INCLUSIVEly from the beginning for this tag
            None => Bound::Included(TagShelfAssociationKey(normalized_tag.clone(), String::new())),
        };

        // Iterate through the associations for the given tag
        for (key, _) in map.range((start_bound, Bound::Unbounded)) {
            // Stop if we've moved past the target tag
            if key.0 != normalized_tag {
                break;
            }

            result_keys.push(key.clone());

            // Stop if we have fetched enough keys for pagination logic
            if result_keys.len() >= limit_plus_one {
                break;
            }
        }
        Ok(())
    })?;

    // Determine the next cursor
    let next_cursor = if result_keys.len() == limit_plus_one {
        result_keys.pop() // Remove the extra item and use its key as the cursor
    } else {
        None
    };

    // Extract ShelfIds from the remaining keys
    let items: Vec<ShelfId> = result_keys.into_iter().map(|key| key.1).collect(); // Use ShelfId from storage

    Ok(CursorPaginatedResult {
        items,
        next_cursor,
        limit: pagination.limit, 
    })
}


/// Query to find all shelves that contain a specific NFT ID.
/// Returns an empty list if the NFT is not found in any tracked shelves.
#[ic_cdk::query]
pub fn get_shelves_containing_nft(nft_id: String) -> Vec<ShelfId> { // Use ShelfId from storage
    NFT_SHELVES.with(|nft_shelves| {
        nft_shelves
            .borrow()
            .get(&nft_id)
            // If the NFT ID exists in the map, clone its list of Shelf IDs.
            // Otherwise, return an empty vector.
            .map_or(Vec::new(), |string_vec| string_vec.0.clone())
    })
}

// --- Functions moved from query.rs ---

#[ic_cdk::query]
pub fn get_user_shelves(
    user: Principal,
    pagination: OffsetPaginationInput
) -> QueryResult<OffsetPaginatedResult<ShelfPublic>> {
    let limit = pagination.get_limit(); // Needs OffsetPaginationInput::get_limit() to be pub in query.rs (OR move OffsetPaginationInput here)
    let offset = pagination.get_offset(); // Needs OffsetPaginationInput::get_offset() to be pub in query.rs (OR move OffsetPaginationInput here)

    USER_SHELVES.with(|user_shelves| {
        user_shelves
            .borrow()
            .get(&user)
            .map(|ts| ts.clone())
            .ok_or(QueryError::UserNotFound)
            .and_then(|timestamped| {
                // Get user profile order (contains PositionTracker)
                let user_profile_opt: Option<UserProfileOrder> = USER_PROFILE_ORDER.with(|profile_order| {
                    profile_order.borrow().get(&user).map(|o| o.clone())
                });

                let has_custom_order = user_profile_opt.as_ref().map_or(false, |order| order.is_customized);

                let combined_ids: Vec<ShelfId> = if has_custom_order {
                    let user_order = user_profile_opt.unwrap(); // Safe unwrap due to has_custom_order check

                    // Use get_ordered_entries to get (key, pos) pairs directly
                    let ordered_positions: Vec<(ShelfId, f64)> = user_order.shelf_positions.get_ordered_entries();
                    // Already sorted by position from get_ordered_entries

                    let ordered_ids: Vec<ShelfId> = ordered_positions.into_iter().map(|(id, _)| id).collect();
                    let ordered_id_set: std::collections::HashSet<ShelfId> = ordered_ids.iter().cloned().collect();

                    // Get timestamp-ordered IDs for shelves *not* in the custom order
                    let mut timestamp_ordered_ids: Vec<(u64, ShelfId)> = timestamped.0
                        .iter()
                        .filter(|(_, id)| !ordered_id_set.contains(id))
                        .cloned() // Clone the (u64, ShelfId) tuple
                        .collect();
                    timestamp_ordered_ids.sort_by(|a, b| b.0.cmp(&a.0)); // Newest first

                    let non_ordered_ids: Vec<ShelfId> = timestamp_ordered_ids.into_iter().map(|(_, id)| id).collect();

                    // Combine: custom order first, then timestamp order
                    ordered_ids.into_iter().chain(non_ordered_ids.into_iter()).collect()

                } else {
                    // Default: Sort by timestamp (newest first)
                    let mut shelf_data: Vec<(u64, ShelfId)> = timestamped.0.iter().cloned().collect();
                    shelf_data.sort_by(|a, b| b.0.cmp(&a.0));
                    shelf_data.into_iter().map(|(_, id)| id).collect()
                };

                let total_count = combined_ids.len();

                // Apply offset and limit to the final ID list
                let final_ids: Vec<ShelfId> = combined_ids
                    .into_iter()
                    .skip(offset)
                    .take(limit)
                    .collect();

                // Fetch Shelf data for the paginated IDs
                SHELVES.with(|shelves| {
                    let shelves_ref = shelves.borrow();
                    // Fetch internal Shelves, then convert to ShelfPublic
                    let items: Vec<ShelfPublic> = final_ids
                        .iter()
                        .filter_map(|id| shelves_ref.get(id).map(|s| s.clone()))
                        .map(ShelfPublic::from)
                        .collect();

                    Ok(OffsetPaginatedResult {
                        items,
                        total_count: Nat::from(total_count),
                        limit: limit as u64,
                        offset: Nat::from(offset),
                    })
                })
            })
    })
}

#[ic_cdk::query]
pub fn get_recent_shelves(
    pagination: CursorPaginationInput<u64>
) -> QueryResult<CursorPaginatedResult<ShelfPublic, u64>> {
    let limit = pagination.get_limit();
    let limit_plus_one = limit + 1;
    let mut fetched_items_count = 0;
    let mut last_processed_timeline_key: Option<u64> = None;
    let mut shelf_public_items: Vec<ShelfPublic> = Vec::with_capacity(limit);

    GLOBAL_TIMELINE.with(|timeline| {
        let timeline_ref = timeline.borrow();
        let start_bound = match pagination.cursor {
            Some(cursor_ts) => Bound::Excluded(cursor_ts),
            None => Bound::Unbounded,
        };

        // Iterate newest first (reverse iteration)
        for (timestamp_key, timeline_item_value) in timeline_ref
            .iter()
            .rev()
            .skip_while(|(ts, _)| match start_bound {
                Bound::Excluded(cursor_ts) => *ts >= cursor_ts, // Skip items with timestamp >= cursor
                Bound::Unbounded => false, 
                _ => unreachable!(), 
            })
        {
            last_processed_timeline_key = Some(timestamp_key);

            // Fetch the full shelf details
            let maybe_shelf_internal = SHELVES.with(|s_map| {
                s_map.borrow().get(&timeline_item_value.shelf_id).map(|s| s.clone())
            });

            if let Some(shelf_internal) = maybe_shelf_internal {
                shelf_public_items.push(ShelfPublic::from(shelf_internal));
                fetched_items_count += 1;

                if fetched_items_count >= limit_plus_one {
                    break; // We have enough items for the page + cursor determination
                }
            } else {
                // Shelf ID was in timeline but not in SHELVES map. Log this inconsistency.
                ic_cdk::println!(
                    "Warning: Shelf {} (public) found in GLOBAL_TIMELINE but not in SHELVES map.", 
                    timeline_item_value.shelf_id
                );
            }
        }
    });

    let next_cursor = if fetched_items_count == limit_plus_one {
        shelf_public_items.pop(); // Remove the extra item
        last_processed_timeline_key // The timestamp of the (limit+1)th item is the cursor
    } else {
        None // No more items
    };

    Ok(CursorPaginatedResult {
        items: shelf_public_items,
        next_cursor,
        limit: pagination.limit, 
    })
}

// Define constants for the time-based shuffle
const NANOS_PER_HOUR: u64 = 60 * 60 * 1_000_000_000;
// Or const NANOS_PER_DAY: u64 = 24 * NANOS_PER_HOUR;

// Helper to derive a seed from a time period ID
fn derive_seed_from_period_id(period_id: u64) -> [u8; 32] {
    let mut seed = [0u8; 32];
    let bytes = period_id.to_le_bytes();
    // Simple mixing: XOR bytes into the seed array
    // Ensure seed is always 32 bytes, even if period_id bytes are fewer.
    for i in 0..8 { // u64 has 8 bytes
        if i < bytes.len() {
            seed[i % 32] ^= bytes[i]; 
        }
    }
    // Further mix to ensure all 32 bytes of seed are likely used
    // This is a simple approach; more robust hashing could be used if extreme cryptographic security were needed for seed generation.
    for i in 8..32 {
        seed[i] = seed[i % 8].wrapping_add(0x9E as u8).wrapping_mul(i as u8);
    }
    seed
}

/// Returns a list of shelves shuffled deterministically based on the current hour.
/// This now uses a pre-populated list of candidates.
#[ic_cdk::query]
pub fn get_shuffled_by_hour_feed(
    limit: u64
) -> QueryResult<Vec<ShelfPublic>> {
    // Use pagination constants from the follows module or define locally if preferred
    let limit_usize: usize = limit.try_into().unwrap_or(DEFAULT_PAGE_LIMIT).min(MAX_PAGE_LIMIT);
    if limit_usize == 0 {
        return Ok(Vec::new());
    }

    let current_timestamp_ns = ic_cdk::api::time();
    let hour_period_id = current_timestamp_ns / NANOS_PER_HOUR;
    let seed = derive_seed_from_period_id(hour_period_id);
    let mut rng = ChaCha20Rng::from_seed(seed); // Use ChaCha20Rng with the deterministic seed

    RANDOM_SHELF_CANDIDATES.with(|candidates_map_ref| {
        let candidates_map = candidates_map_ref.borrow();
        
        // Collect all shelf IDs from the candidates map.
        let mut candidate_shelf_ids: Vec<ShelfId> = candidates_map.iter().map(|(_, shelf_id)| shelf_id.clone()).collect();
        
        if candidate_shelf_ids.is_empty() {
            ic_cdk::println!("No candidates available for shuffled feed.");
            return Ok(Vec::new());
        }

        // Shuffle the collected candidate IDs using the deterministic RNG
        candidate_shelf_ids.shuffle(&mut rng);

        // Take the requested limit
        let final_ids: Vec<ShelfId> = candidate_shelf_ids.into_iter().take(limit_usize).collect();
        
        // Fetch the shelf data for the selected IDs
        SHELVES.with(|shelves_map_ref| {
            let shelves_map = shelves_map_ref.borrow();
            let result_shelves: Vec<ShelfPublic> = final_ids
                .iter()
                // For ShelfPublic::from, we need to ensure it takes &Shelf or Shelf.
                // Assuming storage::Shelf can be cloned.
                .filter_map(|id| shelves_map.get(id).map(|s_internal| ShelfPublic::from(s_internal.clone())))
                .collect();
            Ok(result_shelves)
        })
    })
}

#[ic_cdk::query(guard = "not_anon")] // Add guard to prevent anonymous access
pub fn get_followed_users_feed(
    pagination: CursorPaginationInput<u64>
) -> QueryResult<CursorPaginatedResult<ShelfPublic, u64>> {
    let caller = ic_cdk::caller();
    let limit = pagination.get_limit();
    let limit_plus_one = limit + 1;

    let followed_users_set = FOLLOWED_USERS.with(|followed| {
        followed.borrow().get(&caller).map(|ps| ps.clone()).unwrap_or_default()
    });

    if followed_users_set.0.is_empty() {
        return Ok(CursorPaginatedResult {
            items: Vec::new(),
            next_cursor: None,
            limit: pagination.limit,
        });
    }

    let mut result_shelves: Vec<ShelfPublic> = Vec::with_capacity(limit);
    let mut last_processed_timeline_key: Option<u64> = None;
    let mut items_fetched_count = 0;

    GLOBAL_TIMELINE.with(|timeline| {
        let timeline_ref = timeline.borrow();
        let start_bound = match pagination.cursor {
            Some(cursor_ts) => Bound::Excluded(cursor_ts),
            None => Bound::Unbounded,
        };

        for (timestamp_key, timeline_item_value) in timeline_ref
            .iter()
            .rev()
            .skip_while(|(ts, _)| match start_bound {
                Bound::Excluded(cursor_ts) => *ts >= cursor_ts,
                Bound::Unbounded => false,
                _ => unreachable!(),
            })
        {
            last_processed_timeline_key = Some(timestamp_key);

            if followed_users_set.0.contains(&timeline_item_value.owner) {
                // Shelf owner is followed, and shelf is public. Fetch the full shelf.
                let maybe_shelf_internal = SHELVES.with(|s_map| s_map.borrow().get(&timeline_item_value.shelf_id).map(|s| s.clone()));
                if let Some(shelf_internal) = maybe_shelf_internal {
                    result_shelves.push(ShelfPublic::from(shelf_internal));
                    items_fetched_count += 1;
                    if items_fetched_count >= limit_plus_one {
                        break;
                    }
                }
            }
        }
    });

    let next_cursor = if items_fetched_count == limit_plus_one {
        result_shelves.pop(); 
        last_processed_timeline_key
    } else {
        None
    };

    Ok(CursorPaginatedResult {
        items: result_shelves,
        next_cursor,
        limit: pagination.limit, 
    })
}

#[ic_cdk::query(guard = "not_anon")] // Add guard
pub fn get_followed_tags_feed(
    pagination: CursorPaginationInput<u64>
) -> QueryResult<CursorPaginatedResult<ShelfPublic, u64>> {
    let caller = ic_cdk::caller();
    let limit = pagination.get_limit();
    let limit_plus_one = limit + 1;

    let followed_tags_set = FOLLOWED_TAGS.with(|followed| {
        followed.borrow().get(&caller).map(|nts| nts.clone()).unwrap_or_default()
    });

    if followed_tags_set.0.is_empty() {
        return Ok(CursorPaginatedResult {
            items: Vec::new(),
            next_cursor: None,
            limit: pagination.limit,
        });
    }

    let mut result_shelves: Vec<ShelfPublic> = Vec::with_capacity(limit);
    let mut last_processed_timeline_key: Option<u64> = None;
    let mut items_fetched_count = 0;

    GLOBAL_TIMELINE.with(|timeline| {
        let timeline_ref = timeline.borrow();
        let start_bound = match pagination.cursor {
            Some(cursor_ts) => Bound::Excluded(cursor_ts),
            None => Bound::Unbounded,
        };

        for (timestamp_key, timeline_item_value) in timeline_ref
            .iter()
            .rev()
            .skip_while(|(ts, _)| match start_bound {
                Bound::Excluded(cursor_ts) => *ts >= cursor_ts,
                Bound::Unbounded => false,
                _ => unreachable!(),
            })
        {
            last_processed_timeline_key = Some(timestamp_key);

            let shelf_has_followed_tag = timeline_item_value.tags.iter().any(|tag_on_shelf| {
                followed_tags_set.0.contains(tag_on_shelf)
            });

            if shelf_has_followed_tag {
                let maybe_shelf_internal = SHELVES.with(|s_map| s_map.borrow().get(&timeline_item_value.shelf_id).map(|s| s.clone()));
                if let Some(shelf_internal) = maybe_shelf_internal {
                    result_shelves.push(ShelfPublic::from(shelf_internal));
                    items_fetched_count += 1;
                    if items_fetched_count >= limit_plus_one {
                        break;
                    }
                }
            }
        }
    });

    let next_cursor = if items_fetched_count == limit_plus_one {
        result_shelves.pop();
        last_processed_timeline_key
    } else {
        None
    };

    Ok(CursorPaginatedResult {
        items: result_shelves,
        next_cursor,
        limit: pagination.limit, 
    })
}

#[ic_cdk::query(guard = "not_anon")]
pub fn get_storyline_feed(
    pagination: CursorPaginationInput<u64>
) -> QueryResult<CursorPaginatedResult<ShelfPublic, u64>> {
    let caller = ic_cdk::caller();
    let limit = pagination.get_limit();
    let limit_plus_one = limit + 1;

    let followed_users_set = FOLLOWED_USERS.with(|followed| {
        followed.borrow().get(&caller).map(|ps| ps.clone()).unwrap_or_default()
    });
    let followed_tags_set = FOLLOWED_TAGS.with(|followed| {
        followed.borrow().get(&caller).map(|nts| nts.clone()).unwrap_or_default()
    });

    if followed_users_set.0.is_empty() && followed_tags_set.0.is_empty() {
        // Use a helper or directly construct if CursorPaginatedResult::empty is not defined.
        return Ok(CursorPaginatedResult {
            items: Vec::new(),
            next_cursor: None,
            limit: pagination.limit,
        });
    }

    let mut result_shelves_public: Vec<ShelfPublic> = Vec::with_capacity(limit);
    let mut last_processed_timeline_key: Option<u64> = None;
    let mut items_fetched_count = 0;
    // To ensure a shelf isn't added twice to the same page if it matches both user and tag follow
    let mut unique_shelf_ids_in_page: std::collections::BTreeSet<ShelfId> = std::collections::BTreeSet::new();

    GLOBAL_TIMELINE.with(|timeline| {
        let timeline_ref = timeline.borrow();
        let start_bound = match pagination.cursor {
            Some(cursor_ts) => Bound::Excluded(cursor_ts),
            None => Bound::Unbounded,
        };

        for (timestamp_key, timeline_item_value) in timeline_ref // timeline_item_value is GlobalTimelineItemValue
            .iter()
            .rev() 
            .skip_while(|(ts, _)| match start_bound { 
                Bound::Excluded(cursor_ts) => *ts >= cursor_ts, // Corrected skip logic
                Bound::Unbounded => false,
                _ => unreachable!(),
            })
        {
            last_processed_timeline_key = Some(timestamp_key); // Track the actual timeline key

            // Avoid processing the same shelf multiple times if it's already added to this page
            if unique_shelf_ids_in_page.contains(&timeline_item_value.shelf_id) {
                continue;
            }

            let owner_is_followed = !followed_users_set.0.is_empty() && 
                                      followed_users_set.0.contains(&timeline_item_value.owner);
            
            let mut tag_is_followed = false;
            if !followed_tags_set.0.is_empty() {
                for tag_on_shelf in &timeline_item_value.tags { // Use tags from GlobalTimelineItemValue
                    if followed_tags_set.0.contains(tag_on_shelf) {
                        tag_is_followed = true;
                        break;
                    }
                }
            }

            if owner_is_followed || tag_is_followed {
                // Only fetch full shelf details if it's relevant
                // SHELVES map stores crate::storage::Shelf
                let maybe_shelf_internal = SHELVES.with(|s_map| {
                    s_map.borrow().get(&timeline_item_value.shelf_id).map(|s| s.clone())
                });

                if let Some(shelf_internal) = maybe_shelf_internal {
                    result_shelves_public.push(ShelfPublic::from(shelf_internal)); // Convert internal Shelf to ShelfPublic
                    unique_shelf_ids_in_page.insert(timeline_item_value.shelf_id.clone());
                    items_fetched_count += 1;
                    
                    if items_fetched_count >= limit_plus_one {
                        break;
                    }
                } else {
                    // This case (shelf in timeline but not in SHELVES) should ideally not happen
                    // if data consistency is maintained. Log if necessary.
                    ic_cdk::println!("Warning: Shelf {} found in timeline's GlobalTimelineItemValue but not in SHELVES map.", timeline_item_value.shelf_id);
                }
            }
        }
    });

    let next_cursor = if items_fetched_count == limit_plus_one {
        result_shelves_public.pop(); // Remove the extra item used for cursor determination
        last_processed_timeline_key // The key of the (limit+1)th item becomes the next cursor
    } else {
        None
    };

    Ok(CursorPaginatedResult {
        items: result_shelves_public,
        next_cursor,
        limit: pagination.limit, 
    })
}

/// Get public shelf DTOs associated with a specific tag.
/// Returns an empty list if the tag is not found or no public shelves are associated.
#[ic_cdk::query]
pub fn get_public_shelves_by_tag(tag: String) -> QueryResult<Vec<ShelfPublic>> {
    let normalized_tag = normalize_tag(&tag);
    if normalized_tag.is_empty() {
        // Consider if TagNotFound is more appropriate, but empty list is also valid.
        return Ok(Vec::new());
    }

    let mut shelf_ids_for_tag: Vec<ShelfId> = Vec::new();

    TAG_SHELF_ASSOCIATIONS.with(|assoc_map_borrow| {
        let map_ref = assoc_map_borrow.borrow();
        // Define the start key for iteration (inclusive)
        let start_key = TagShelfAssociationKey(normalized_tag.clone(), String::new()); // Smallest possible ShelfId string

        for (key, _) in map_ref.range((Bound::Included(start_key), Bound::Unbounded)) {
            if key.0 != normalized_tag {
                // We've iterated past all associations for the target tag
                break;
            }
            shelf_ids_for_tag.push(key.1.clone());
        }
    });

    if shelf_ids_for_tag.is_empty() {
        return Ok(Vec::new());
    }

    let mut public_shelves: Vec<ShelfPublic> = Vec::new();
    SHELVES.with(|shelves_map_borrow| {
        let shelves_map = shelves_map_borrow.borrow();
        for shelf_id in shelf_ids_for_tag {
            if let Some(shelf) = shelves_map.get(&shelf_id) {
                public_shelves.push(ShelfPublic::from(shelf.clone()));
            }
            // If shelf_id from associations is not in SHELVES, we silently ignore it.
            // This could indicate a data consistency issue, but the query will still complete.
        }
    });

    Ok(public_shelves)
}