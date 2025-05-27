use candid::{CandidType, Principal, Nat, Deserialize};
use ic_cdk;
use std::ops::Bound;

// rand traits and PRNG implementation
use rand::seq::SliceRandom;
use rand_chacha::ChaCha20Rng;
use rand_core::SeedableRng;

// Import necessary items from storage
use crate::storage::{
    SHELF_DATA, ShelfData, // Replaced SHELVES, SHELF_METADATA
    NFT_SHELVES, 
    Item, ShelfId, ItemId, 
    USER_SHELVES, GLOBAL_TIMELINE, USER_PROFILE_ORDER, TimestampedShelves, // Added TimestampedShelves
    FOLLOWED_USERS, FOLLOWED_TAGS, PrincipalSet, NormalizedTagSet, // Added PrincipalSet, NormalizedTagSet
    UserProfileOrder, 
    RANDOM_SHELF_CANDIDATES, 
    TagShelfCreationTimelineKey, TAG_SHELF_CREATION_TIMELINE_INDEX, 
    ShelfMetadata, ShelfContent, // Still useful for type hints if ShelfData is deconstructed
    StringVec, // Ensure StringVec is imported if not already
};
// Import necessary types from types module
// use crate::types::TagShelfAssociationKey; // Comment out, no longer primary key for this query
// Import utils
use crate::utils::normalize_tag;
use crate::utils::id_conversion;
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

#[derive(CandidType, Deserialize)]
pub struct NFTAppearancesResult {
    pub shelves: Vec<ShelfId>,
    pub original_id_used: String,
}


// --- Moved Query Functions ---

#[ic_cdk::query]
pub fn get_shelf(shelf_id: ShelfId) -> QueryResult<ShelfPublic> {
    SHELF_DATA.with(|sds_map_ref| {
        sds_map_ref.borrow().get(&shelf_id)
            .map(|shelf_data| ShelfPublic::from_parts(&shelf_data.metadata, &shelf_data.content))
            .ok_or(QueryError::ShelfNotFound)
    })
}

#[ic_cdk::query]
pub fn get_shelf_items(
    shelf_id: ShelfId,
    pagination: CursorPaginationInput<ItemId>
) -> QueryResult<CursorPaginatedResult<Item, ItemId>> {
    let limit = pagination.get_limit();

    let shelf_data = SHELF_DATA.with(|sds_map| sds_map.borrow().get(&shelf_id).map(|sd_ref| sd_ref.clone()))
        .ok_or(QueryError::ShelfNotFound)?;

    let ordered_ids: Vec<u32> = shelf_data.content.item_positions.iter_keys_ordered().cloned().collect();
    let total_items = ordered_ids.len();

    if total_items == 0 {
        return Ok(CursorPaginatedResult {
            items: Vec::new(),
            next_cursor: None,
            limit: pagination.limit,
        });
    }

    let start_index = match pagination.cursor {
        Some(cursor_id) => ordered_ids.iter().position(|&id| id == cursor_id).map(|idx| idx + 1).unwrap_or(0),
        None => 0,
    };

    let end_index = (start_index + limit).min(total_items);
    let page_ids: &[u32] = if start_index >= total_items { &[] } else { &ordered_ids[start_index..end_index] };

    let items_page: Vec<Item> = page_ids.iter().filter_map(|id| shelf_data.content.items.get(id).cloned()).collect();

    let correct_next_cursor = if end_index < total_items { page_ids.last().cloned() } else { None };

    Ok(CursorPaginatedResult {
        items: items_page,
        next_cursor: correct_next_cursor,
        limit: pagination.limit, 
    })
}

/// Get optimization metrics for a shelf's positions
/// This helps frontend clients identify when a shelf needs rebalancing
#[ic_cdk::query]
pub fn get_shelf_position_metrics(shelf_id: ShelfId) -> Result<ShelfPositionMetrics, String> {
    SHELF_DATA.with(|sds_map_ref| {
        let sds_map = sds_map_ref.borrow();
        if let Some(shelf_data) = sds_map.get(&shelf_id) { // No clone needed if only accessing .content
            let position_count = shelf_data.content.item_positions.len();
            if position_count < 2 {
                return Ok(ShelfPositionMetrics { item_count: position_count, min_gap: 0.0, avg_gap: 0.0, max_gap: 0.0 });
            }
            let mut positions: Vec<f64> = shelf_data.content.item_positions.iter_ordered().map(|(_, pos)| pos).collect();
            positions.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
            let mut min_gap = f64::MAX;
            let mut max_gap = 0.0;
            let mut sum_gap = 0.0;
            for i in 1..positions.len() {
                let gap = positions[i] - positions[i-1];
                if gap < 0.0 { continue; }
                min_gap = f64::min(min_gap, gap);
                max_gap = f64::max(max_gap, gap);
                sum_gap += gap;
            }
            let avg_gap = if positions.len() > 1 { sum_gap / (positions.len() - 1) as f64 } else { 0.0 };
            Ok(ShelfPositionMetrics { item_count: position_count, min_gap, avg_gap, max_gap })
        } else {
            Err(format!("Shelf with ID '{}' not found", shelf_id))
        }
    })
}

// --- Functions moved from query.rs ---

#[ic_cdk::query]
pub fn get_user_shelves(
    user: Principal,
    pagination: OffsetPaginationInput
) -> QueryResult<OffsetPaginatedResult<ShelfPublic>> {
    let limit = pagination.get_limit();
    let offset = pagination.get_offset();

    USER_SHELVES.with(|user_shelves_map_ref| {
        user_shelves_map_ref.borrow().get(&user).map(|v_ref| v_ref.clone()).ok_or(QueryError::UserNotFound)
            .and_then(|timestamped| {
                let user_profile_opt: Option<UserProfileOrder> = USER_PROFILE_ORDER.with(|po_map| po_map.borrow().get(&user).map(|v_ref| v_ref.clone()));
                let has_custom_order = user_profile_opt.as_ref().map_or(false, |order| order.is_customized);
                let combined_ids: Vec<ShelfId> = if has_custom_order {
                    let user_order = user_profile_opt.unwrap();
                    let ordered_positions: Vec<(ShelfId, f64)> = user_order.shelf_positions.get_ordered_entries();
                    let ordered_ids: Vec<ShelfId> = ordered_positions.into_iter().map(|(id, _)| id).collect();
                    let ordered_id_set: std::collections::HashSet<ShelfId> = ordered_ids.iter().cloned().collect();
                    let mut timestamp_ordered_ids: Vec<(u64, ShelfId)> = timestamped.0.iter().filter(|(_, id)| !ordered_id_set.contains(id)).cloned().collect();
                    timestamp_ordered_ids.sort_by(|a, b| b.0.cmp(&a.0));
                    let non_ordered_ids: Vec<ShelfId> = timestamp_ordered_ids.into_iter().map(|(_, id)| id).collect();
                    ordered_ids.into_iter().chain(non_ordered_ids.into_iter()).collect()
                } else {
                    let mut shelf_data_timestamps: Vec<(u64, ShelfId)> = timestamped.0.iter().cloned().collect();
                    shelf_data_timestamps.sort_by(|a, b| b.0.cmp(&a.0));
                    shelf_data_timestamps.into_iter().map(|(_, id)| id).collect()
                };
                let total_count = combined_ids.len();
                let final_ids: Vec<ShelfId> = combined_ids.into_iter().skip(offset).take(limit).collect();
                let items: Vec<ShelfPublic> = SHELF_DATA.with(|sds_map_ref| {
                    let sds_map = sds_map_ref.borrow();
                    final_ids.iter().filter_map(|id| 
                        sds_map.get(id).map(|sd| ShelfPublic::from_parts(&sd.metadata, &sd.content))
                    ).collect()
                });
                Ok(OffsetPaginatedResult { items, total_count: Nat::from(total_count), limit: limit as u64, offset: Nat::from(offset) })
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

    GLOBAL_TIMELINE.with(|timeline_map_ref| {
        let timeline_map = timeline_map_ref.borrow();
        let start_bound = match pagination.cursor { Some(cursor_ts) => Bound::Excluded(cursor_ts), None => Bound::Unbounded };
        for (timestamp_key, timeline_item_value) in timeline_map.iter().rev().skip_while(|(ts, _)| match start_bound { Bound::Excluded(cursor_ts) => *ts >= cursor_ts, Bound::Unbounded => false, _ => unreachable!() }) {
            last_processed_timeline_key = Some(timestamp_key);
            let maybe_shelf_public = SHELF_DATA.with(|sds_map_ref| 
                sds_map_ref.borrow().get(&timeline_item_value.shelf_id).map(|sd| ShelfPublic::from_parts(&sd.metadata, &sd.content))
            );
            if let Some(shelf_public_item) = maybe_shelf_public {
                shelf_public_items.push(shelf_public_item);
                fetched_items_count += 1;
                if fetched_items_count >= limit_plus_one { break; }
            } else {
                ic_cdk::println!("Warning: Shelf {} from GLOBAL_TIMELINE not found in SHELF_DATA.", timeline_item_value.shelf_id);
            }
        }
    });
    let next_cursor = if fetched_items_count == limit_plus_one { shelf_public_items.pop(); last_processed_timeline_key } else { None };
    Ok(CursorPaginatedResult { items: shelf_public_items, next_cursor, limit: pagination.limit })
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

// Define constant for the new approach
const RANDOM_FEED_WINDOW_SIZE: usize = 200; // Number of recent items to consider for shuffling

/// Returns a list of shelves shuffled deterministically based on the current hour.
/// This samples from a recent window of public shelves.
#[ic_cdk::query]
pub fn get_shuffled_by_hour_feed(
    limit_input: u64
) -> QueryResult<Vec<ShelfPublic>> {
    let limit_usize: usize = limit_input.try_into().unwrap_or(DEFAULT_PAGE_LIMIT).min(MAX_PAGE_LIMIT);
    if limit_usize == 0 {
        return Ok(Vec::new());
    }

    let current_timestamp_ns = ic_cdk::api::time();
    // Use the full timestamp for more frequent reshuffling, instead of just hourly.
    let seed = derive_seed_from_period_id(current_timestamp_ns);
    let mut rng = ChaCha20Rng::from_seed(seed);

    let mut candidate_shelves: Vec<ShelfPublic> = Vec::with_capacity(RANDOM_FEED_WINDOW_SIZE);

    GLOBAL_TIMELINE.with(|timeline_rc| {
        SHELF_DATA.with(|sds_rc| {
            let timeline = timeline_rc.borrow();
            let sds_map = sds_rc.borrow();
            for (_timestamp, timeline_item) in timeline.iter().rev() {
                if candidate_shelves.len() >= RANDOM_FEED_WINDOW_SIZE {
                    break;
                }
                if let Some(sd) = sds_map.get(&timeline_item.shelf_id) {
                    candidate_shelves.push(ShelfPublic::from_parts(&sd.metadata, &sd.content));
                }
            }
        })
    });

    if candidate_shelves.is_empty() {
        ic_cdk::println!("No candidates found for shuffled feed from recent items.");
        return Ok(Vec::new());
    }

    candidate_shelves.shuffle(&mut rng);
    
    let result_shelves: Vec<ShelfPublic> = candidate_shelves.into_iter().take(limit_usize).collect();
    
    Ok(result_shelves)
}

#[ic_cdk::query(guard = "not_anon")]
pub fn get_followed_users_feed(
    pagination: CursorPaginationInput<u64>
) -> QueryResult<CursorPaginatedResult<ShelfPublic, u64>> {
    let caller = ic_cdk::caller();
    let limit = pagination.get_limit();
    let limit_plus_one = limit + 1;

    let followed_users_set = FOLLOWED_USERS.with(|fu| fu.borrow().get(&caller).map(|v_ref| v_ref.clone()).unwrap_or_default());

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

    GLOBAL_TIMELINE.with(|timeline_rc| {
        let timeline_map = timeline_rc.borrow();
        let start_bound = match pagination.cursor {
            Some(cursor_ts) => Bound::Excluded(cursor_ts),
            None => Bound::Unbounded,
        };

        for (timestamp_key, timeline_item_value) in timeline_map.iter().rev().skip_while(|(ts, _)| match start_bound {
            Bound::Excluded(cursor_ts) => *ts >= cursor_ts,
            Bound::Unbounded => false,
            _ => unreachable!(),
        }) {
            last_processed_timeline_key = Some(timestamp_key);

            if followed_users_set.0.contains(&timeline_item_value.owner) {
                let maybe_shelf_public = SHELF_DATA.with(|sds_rc| sds_rc.borrow().get(&timeline_item_value.shelf_id).map(|sd| ShelfPublic::from_parts(&sd.metadata, &sd.content)));
                if let Some(shelf_public_item) = maybe_shelf_public {
                    result_shelves.push(shelf_public_item);
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
pub fn get_followed_tags_feed(
    pagination: CursorPaginationInput<u64>
) -> QueryResult<CursorPaginatedResult<ShelfPublic, u64>> {
    let caller = ic_cdk::caller();
    let limit = pagination.get_limit();
    let limit_plus_one = limit + 1;

    let followed_tags_set = FOLLOWED_TAGS.with(|ft| ft.borrow().get(&caller).map(|v_ref| v_ref.clone()).unwrap_or_default());

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

    GLOBAL_TIMELINE.with(|timeline_rc| {
        let timeline_map = timeline_rc.borrow();
        let start_bound = match pagination.cursor {
            Some(cursor_ts) => Bound::Excluded(cursor_ts),
            None => Bound::Unbounded,
        };

        for (timestamp_key, timeline_item_value) in timeline_map.iter().rev().skip_while(|(ts, _)| match start_bound {
            Bound::Excluded(cursor_ts) => *ts >= cursor_ts,
            Bound::Unbounded => false,
            _ => unreachable!(),
        }) {
            last_processed_timeline_key = Some(timestamp_key);

            let shelf_has_followed_tag = timeline_item_value.tags.iter().any(|tag_on_shelf| {
                followed_tags_set.0.contains(tag_on_shelf)
            });

            if shelf_has_followed_tag {
                let maybe_shelf_public = SHELF_DATA.with(|sds_rc| sds_rc.borrow().get(&timeline_item_value.shelf_id).map(|sd| ShelfPublic::from_parts(&sd.metadata, &sd.content)));
                if let Some(shelf_public_item) = maybe_shelf_public {
                    result_shelves.push(shelf_public_item);
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

    let followed_users_set = FOLLOWED_USERS.with(|fu| fu.borrow().get(&caller).map(|v_ref| v_ref.clone()).unwrap_or_default());
    let followed_tags_set = FOLLOWED_TAGS.with(|ft| ft.borrow().get(&caller).map(|v_ref| v_ref.clone()).unwrap_or_default());

    if followed_users_set.0.is_empty() && followed_tags_set.0.is_empty() {
        return Ok(CursorPaginatedResult {
            items: Vec::new(),
            next_cursor: None,
            limit: pagination.limit,
        });
    }

    let mut result_shelves_public: Vec<ShelfPublic> = Vec::with_capacity(limit);
    let mut last_processed_timeline_key: Option<u64> = None;
    let mut items_fetched_count = 0;
    let mut unique_shelf_ids_in_page: std::collections::BTreeSet<ShelfId> = std::collections::BTreeSet::new();

    GLOBAL_TIMELINE.with(|timeline_rc| {
        let timeline_map = timeline_rc.borrow();
        let start_bound = match pagination.cursor {
            Some(cursor_ts) => Bound::Excluded(cursor_ts),
            None => Bound::Unbounded,
        };

        for (timestamp_key, timeline_item_value) in timeline_map.iter().rev().skip_while(|(ts, _)| match start_bound {
            Bound::Excluded(cursor_ts) => *ts >= cursor_ts,
            Bound::Unbounded => false,
            _ => unreachable!(),
        }) {
            last_processed_timeline_key = Some(timestamp_key);

            if unique_shelf_ids_in_page.contains(&timeline_item_value.shelf_id) {
                continue;
            }

            let owner_is_followed = !followed_users_set.0.is_empty() && 
                                      followed_users_set.0.contains(&timeline_item_value.owner);
            
            let mut tag_is_followed = false;
            if !followed_tags_set.0.is_empty() {
                for tag_on_shelf in &timeline_item_value.tags {
                    if followed_tags_set.0.contains(tag_on_shelf) {
                        tag_is_followed = true;
                        break;
                    }
                }
            }

            if owner_is_followed || tag_is_followed {
                let maybe_shelf_public = SHELF_DATA.with(|sds_rc| sds_rc.borrow().get(&timeline_item_value.shelf_id).map(|sd| ShelfPublic::from_parts(&sd.metadata, &sd.content)));

                if let Some(shelf_public_item) = maybe_shelf_public {
                    result_shelves_public.push(shelf_public_item);
                    unique_shelf_ids_in_page.insert(timeline_item_value.shelf_id.clone());
                    items_fetched_count += 1;
                    
                    if items_fetched_count >= limit_plus_one {
                        break;
                    }
                } else {
                    ic_cdk::println!("Warning: Shelf {} found in timeline's GlobalTimelineItemValue but not in SHELF_DATA map.", timeline_item_value.shelf_id);
                }
            }
        }
    });

    let next_cursor = if items_fetched_count == limit_plus_one {
        result_shelves_public.pop();
        last_processed_timeline_key
    } else {
        None
    };

    Ok(CursorPaginatedResult {
        items: result_shelves_public,
        next_cursor,
        limit: pagination.limit, 
    })
}



/// Get shelf IDs associated with a specific tag (Paginated).
/// Returns an empty list if the tag is not found.
#[ic_cdk::query]
pub fn get_shelves_by_tag(
    tag: String,
    pagination: CursorPaginationInput<TagShelfCreationTimelineKey>
) -> QueryResult<CursorPaginatedResult<ShelfPublic, TagShelfCreationTimelineKey>> {
    let normalized_tag = normalize_tag(&tag);
    if normalized_tag.is_empty() {
        return Ok(CursorPaginatedResult {
            items: Vec::new(),
            next_cursor: None,
            limit: pagination.limit,
        });
    }

    let limit = pagination.get_limit();
    let limit_plus_one = limit + 1;
    let mut result_keys: Vec<TagShelfCreationTimelineKey> = Vec::with_capacity(limit_plus_one);
    let mut shelf_public_items: Vec<ShelfPublic> = Vec::with_capacity(limit);

    TAG_SHELF_CREATION_TIMELINE_INDEX.with(|timeline_idx_rc| {
        let map = timeline_idx_rc.borrow();
        
        // Define the absolute end bound for this tag (oldest possible item for this tag)
        let end_bound_for_this_tag = Bound::Included(TagShelfCreationTimelineKey {
            tag: normalized_tag.clone(),
            reversed_created_at: u64::MAX,
            shelf_id: String::from_utf8(vec![0xFF; 255]).unwrap_or_else(|_| String::from("~")),
        });

        let start_bound = match pagination.cursor {
            Some(cursor_key) => {
                if cursor_key.tag != normalized_tag {
                    return Err(QueryError::InvalidCursor);
                }
                Bound::Excluded(cursor_key) // Start after the cursor, iterating towards older items
            },
            None => Bound::Included(TagShelfCreationTimelineKey { // No cursor, start from the absolute newest for this tag
                tag: normalized_tag.clone(),
                reversed_created_at: 0, // Newest
                shelf_id: String::new(), // Smallest shelf_id
            }),
        };

        for (key, _) in map.range((start_bound, end_bound_for_this_tag)) {
            // This check should ideally not be hit if bounds are correct and map is consistent for the tag.
            if key.tag != normalized_tag {
                break; 
            }
            result_keys.push(key.clone());
            if result_keys.len() >= limit_plus_one {
                break;
            }
        }
        Ok(())
    })?;

    let next_cursor = if result_keys.len() == limit_plus_one {
        result_keys.pop()
    } else {
        None
    };

    SHELF_DATA.with(|sds_rc| {
        let sds_map = sds_rc.borrow();
        for key in result_keys {
            if let Some(shelf_data_ref) = sds_map.get(&key.shelf_id) { 
                shelf_public_items.push(ShelfPublic::from_parts(&shelf_data_ref.metadata, &shelf_data_ref.content));
            } else {
                ic_cdk::println!("Warning: Shelf {} from TAG_SHELF_CREATION_TIMELINE_INDEX not found in SHELF_DATA.", key.shelf_id);
            }
        }
    });

    Ok(CursorPaginatedResult {
        items: shelf_public_items,
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
        return Ok(Vec::new());
    }

    let mut shelf_ids_for_tag: Vec<ShelfId> = Vec::new();

    TAG_SHELF_CREATION_TIMELINE_INDEX.with(|timeline_idx_rc| {
        let map = timeline_idx_rc.borrow();
        let start_key = TagShelfCreationTimelineKey {
            tag: normalized_tag.clone(),
            reversed_created_at: 0,
            shelf_id: String::new(),
        };
        let end_key = TagShelfCreationTimelineKey {
            tag: normalized_tag.clone(),
            reversed_created_at: u64::MAX,
            shelf_id: String::from_utf8(vec![0xFF; 255]).unwrap_or_else(|_| String::from("~")),
        };

        for (key, _) in map.range((Bound::Included(start_key), Bound::Included(end_key))) {
            if key.tag != normalized_tag {
                break;
            }
            shelf_ids_for_tag.push(key.shelf_id.clone());
        }
    });

    if shelf_ids_for_tag.is_empty() {
        return Ok(Vec::new());
    }

    let mut public_shelves: Vec<ShelfPublic> = Vec::new();
    SHELF_DATA.with(|sds_rc| {
        let sds_map = sds_rc.borrow();
        for shelf_id in shelf_ids_for_tag {
            if let Some(shelf_data_ref) = sds_map.get(&shelf_id) { 
                public_shelves.push(ShelfPublic::from_parts(&shelf_data_ref.metadata, &shelf_data_ref.content));
            } else {
                ic_cdk::println!("Warning: Shelf {} from TAG_SHELF_CREATION_TIMELINE_INDEX not found in SHELF_DATA (public).", shelf_id);
            }
        }
    });

    Ok(public_shelves)
}

#[ic_cdk::query]
pub fn get_user_publicly_editable_shelves(
    user: Principal,
    pagination: OffsetPaginationInput
) -> QueryResult<OffsetPaginatedResult<ShelfPublic>> {
    let limit = pagination.get_limit();
    let offset = pagination.get_offset();

    USER_SHELVES.with(|user_shelves_map_ref| {
        user_shelves_map_ref.borrow().get(&user).map(|v_ref| v_ref.clone()).ok_or(QueryError::UserNotFound)
            .and_then(|timestamped_shelf_ids| {
                let user_profile_opt: Option<UserProfileOrder> = USER_PROFILE_ORDER.with(|po_map| po_map.borrow().get(&user).map(|v_ref| v_ref.clone()));
                let has_custom_order = user_profile_opt.as_ref().map_or(false, |order| order.is_customized);

                let ordered_shelf_ids: Vec<ShelfId> = if has_custom_order {
                    let user_order = user_profile_opt.unwrap();
                    let custom_ordered_ids: Vec<ShelfId> = user_order.shelf_positions.get_ordered_entries().into_iter().map(|(id, _)| id).collect();
                    let custom_ordered_id_set: std::collections::HashSet<ShelfId> = custom_ordered_ids.iter().cloned().collect();
                    
                    let mut timestamp_fallback_ids: Vec<(u64, ShelfId)> = timestamped_shelf_ids.0.iter().filter(|(_, id)| !custom_ordered_id_set.contains(id)).cloned().collect();
                    timestamp_fallback_ids.sort_by(|a, b| b.0.cmp(&a.0));
                    let fallback_ids: Vec<ShelfId> = timestamp_fallback_ids.into_iter().map(|(_, id)| id).collect();
                    
                    custom_ordered_ids.into_iter().chain(fallback_ids.into_iter()).collect()
                } else {
                    let mut shelf_data_timestamps: Vec<(u64, ShelfId)> = timestamped_shelf_ids.0.iter().cloned().collect();
                    shelf_data_timestamps.sort_by(|a, b| b.0.cmp(&a.0));
                    shelf_data_timestamps.into_iter().map(|(_, id)| id).collect()
                };

                let publicly_editable_shelf_data: Vec<ShelfData> = SHELF_DATA.with(|sds_rc|{
                    let sds_map = sds_rc.borrow();
                    ordered_shelf_ids.iter()
                        .filter_map(|id| sds_map.get(id).filter(|sd_ref| sd_ref.metadata.public_editing).map(|sd_ref| sd_ref.clone())) 
                        .collect()
                });

                let total_count = publicly_editable_shelf_data.len();
                let paginated_shelf_data_list: Vec<ShelfData> = publicly_editable_shelf_data.into_iter().skip(offset).take(limit).collect();
                let items: Vec<ShelfPublic> = paginated_shelf_data_list.iter().map(|sd| ShelfPublic::from_parts(&sd.metadata, &sd.content)).collect();

                Ok(OffsetPaginatedResult { items, total_count: Nat::from(total_count), limit: limit as u64, offset: Nat::from(offset) })
            })
    })
}

#[ic_cdk::query]
pub fn get_nft_shelf_appearances(user_provided_id: String) -> Result<NFTAppearancesResult, String> {
    ic_cdk::println!("[get_nft_shelf_appearances] Received user_provided_id: {}", user_provided_id);
    let key_to_query = id_conversion::get_original_nft_id_for_storage(&user_provided_id);
    ic_cdk::println!("[get_nft_shelf_appearances] Derived key_to_query: {}", key_to_query);
    
    NFT_SHELVES.with(|nft_shelves_map_ref| {
        match nft_shelves_map_ref.borrow().get(&key_to_query) {
            Some(string_vec) => Ok(NFTAppearancesResult {
                shelves: string_vec.0.clone(),
                original_id_used: key_to_query.clone(),
            }),
            None => Ok(NFTAppearancesResult {
                shelves: Vec::new(),
                original_id_used: key_to_query.clone(), // Still return the ID that would have been used
            }),
        }
    })
}