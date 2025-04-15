use candid::{CandidType, Nat, Principal, Deserialize};
use ic_cdk;
use std::convert::TryInto;
use std::ops::Bound;

use crate::storage::{
    SHELVES, USER_SHELVES, GLOBAL_TIMELINE, USER_PROFILE_ORDER, 
    TAG_SHELF_ASSOCIATIONS, TAG_POPULARITY_INDEX, TAG_LEXICAL_INDEX, TAG_METADATA,
    Shelf, Item, ShelfId, NormalizedTag, ItemId,
    TagMetadata
};
use crate::types::{TagPopularityKey, TagShelfAssociationKey};
use crate::utils::normalize_tag;

// --- Pagination Defaults ---
const DEFAULT_PAGE_LIMIT: usize = 20;
const MAX_PAGE_LIMIT: usize = 50;

// --- Pagination Input Types ---

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct OffsetPaginationInput {
    pub offset: Nat,
    pub limit: Nat,
}

impl OffsetPaginationInput {
    fn get_limit(&self) -> usize {
        self.limit.clone().0.try_into().unwrap_or(DEFAULT_PAGE_LIMIT).min(MAX_PAGE_LIMIT)
    }

    fn get_offset(&self) -> usize {
        self.offset.clone().0.try_into().unwrap_or(0)
    }
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct CursorPaginationInput<C: CandidType + Clone> {
    pub cursor: Option<C>,
    pub limit: Nat,
}

impl<C: CandidType + Clone> CursorPaginationInput<C> {
    fn get_limit(&self) -> usize {
        self.limit.clone().0.try_into().unwrap_or(DEFAULT_PAGE_LIMIT).min(MAX_PAGE_LIMIT)
    }
}

// --- Pagination Result Types ---

#[derive(CandidType, Debug, Clone)]
pub struct OffsetPaginatedResult<T: CandidType + Clone> {
    pub items: Vec<T>,
    pub total_count: Nat,
    pub limit: Nat,
    pub offset: Nat,
}

#[derive(CandidType, Debug, Clone)]
pub struct CursorPaginatedResult<T: CandidType + Clone, C: CandidType + Clone> {
    pub items: Vec<T>,
    pub next_cursor: Option<C>,
    pub limit: Nat,
}

#[derive(CandidType, Debug)]
pub enum QueryError {
    ShelfNotFound,
    UserNotFound,
    InvalidTimeRange,
    TagNotFound,
    InvalidCursor,
}

pub type QueryResult<T> = Result<T, QueryError>;

// Shelf queries
#[ic_cdk::query]
pub fn get_shelf(shelf_id: ShelfId) -> QueryResult<Shelf> {
    SHELVES.with(|shelves| {
        shelves
            .borrow()
            .get(&shelf_id)
            .map(|shelf| shelf.clone())
            .ok_or(QueryError::ShelfNotFound)
    })
}

#[ic_cdk::query]
pub fn get_shelf_items(
    shelf_id: ShelfId, 
    pagination: CursorPaginationInput<ItemId> // Use ItemId as cursor
) -> QueryResult<CursorPaginatedResult<Item, ItemId>> {
    let limit = pagination.get_limit();

    // 1. Get the full shelf
    let shelf = get_shelf(shelf_id)?;

    // 2. Get all items ordered by their position
    let ordered_items = shelf.get_ordered_items(); // This returns Vec<Item>
    let total_items = ordered_items.len();

    if total_items == 0 {
        return Ok(CursorPaginatedResult {
            items: Vec::new(),
            next_cursor: None,
            limit: Nat::from(limit),
        });
    }

    // 3. Find the starting index based on the cursor
    let start_index = match pagination.cursor {
        Some(cursor_id) => {
            // Find the index of the item AFTER the cursor
            ordered_items
                .iter()
                .position(|item| item.id == cursor_id)
                .map(|idx| idx + 1) // Start from the item *after* the cursor
                .unwrap_or(0) // If cursor not found, start from beginning (or error?)
                // Consider returning InvalidCursor if cursor_id is not found?
                // For now, starting from 0 provides resilience.
        }
        None => 0, // No cursor, start from the beginning
    };

    // 4. Slice the vector to get the current page's items
    let end_index = (start_index + limit).min(total_items);
    let items_page: Vec<Item> = if start_index >= total_items {
        Vec::new() // Cursor pointed past the end
    } else {
        ordered_items[start_index..end_index].to_vec()
    };

    // 5. Determine the next cursor
    let next_cursor = if end_index < total_items {
        // The ID of the last item on *this* page is the cursor for the *next* page
        items_page.last().map(|item| item.id)
    } else {
        None // No more items
    };

    Ok(CursorPaginatedResult {
        items: items_page,
        next_cursor,
        limit: Nat::from(limit),
    })
}

// User queries (Refactored for Offset Pagination)
#[ic_cdk::query]
pub fn get_user_shelves(
    user: Principal, 
    pagination: OffsetPaginationInput
) -> QueryResult<OffsetPaginatedResult<Shelf>> {
    let limit = pagination.get_limit();
    let offset = pagination.get_offset();

    USER_SHELVES.with(|user_shelves| {
        user_shelves
            .borrow()
            .get(&user)
            .ok_or(QueryError::UserNotFound)
            .and_then(|timestamped| {
                let has_custom_order = USER_PROFILE_ORDER.with(|profile_order| {
                    profile_order.borrow().get(&user)
                        .map_or(false, |order| order.is_customized)
                });

                let combined_ids: Vec<ShelfId> = if has_custom_order {
                    USER_PROFILE_ORDER.with(|profile_order| {
                        let order_ref = profile_order.borrow();
                        // Assume user exists based on the outer check
                        let user_order = order_ref.get(&user).unwrap(); 
                        
                        let mut ordered_positions: Vec<(ShelfId, f64)> = user_order.shelf_positions
                            .iter()
                            .map(|(id, &pos)| (id.clone(), pos))
                            .collect();
                        ordered_positions.sort_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
                        
                        let ordered_ids: Vec<ShelfId> = ordered_positions.into_iter().map(|(id, _)| id).collect();
                        let ordered_id_set: std::collections::HashSet<ShelfId> = ordered_ids.iter().cloned().collect();

                        let mut timestamp_ordered_ids: Vec<(u64, ShelfId)> = timestamped.0
                            .iter()
                            .filter(|(_, id)| !ordered_id_set.contains(id))
                            .map(|&(ts, ref id)| (ts, id.clone()))
                            .collect();
                        timestamp_ordered_ids.sort_by(|a, b| b.0.cmp(&a.0)); // Newest first
                        
                        let non_ordered_ids: Vec<ShelfId> = timestamp_ordered_ids.into_iter().map(|(_, id)| id).collect();
                        
                        // Combine: custom order first, then timestamp order
                        ordered_ids.into_iter().chain(non_ordered_ids.into_iter()).collect()
                    })
                } else {
                    // Default: Sort by timestamp (newest first)
                    let mut shelf_data: Vec<(u64, ShelfId)> = timestamped.0.iter().cloned().collect();
                    shelf_data.sort_by(|a, b| b.0.cmp(&a.0)); // Newest first
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
                    let items: Vec<Shelf> = final_ids
                        .iter()
                        .filter_map(|id| shelves_ref.get(id))
                        .collect();

                    Ok(OffsetPaginatedResult {
                        items,
                        total_count: Nat::from(total_count),
                        limit: Nat::from(limit),
                        offset: Nat::from(offset),
                    })
                })
            })
    })
}

// Global timeline query (Refactored for Cursor Pagination)
#[ic_cdk::query]
pub fn get_recent_shelves(
    pagination: CursorPaginationInput<u64>
) -> QueryResult<CursorPaginatedResult<Shelf, u64>> {
    let limit = pagination.get_limit();
    let limit_plus_one = limit + 1; // Fetch one extra to determine next_cursor

    GLOBAL_TIMELINE.with(|timeline| {
        let timeline_ref = timeline.borrow();
        
        // Determine the starting bound based on the cursor
        let start_bound = match pagination.cursor {
            Some(cursor_ts) => Bound::Excluded(cursor_ts),
            None => Bound::Unbounded, // Start from the beginning (latest)
        };

        // Iterate in reverse chronological order
        let mut shelf_ids_with_ts: Vec<(u64, ShelfId)> = timeline_ref
            .iter()
            .rev() // Iterate newest first
            .skip_while(|(ts, _)| match start_bound {
                Bound::Excluded(cursor_ts) => *ts > cursor_ts, // Skip items newer than or at cursor
                Bound::Unbounded => false, // Don't skip if no cursor
                _ => unreachable!(), // We only use Excluded or Unbounded
            })
            .take(limit_plus_one)
            .map(|(ts, id)| (ts, id.clone()))
            .collect();

        // Determine the next cursor
        let next_cursor = if shelf_ids_with_ts.len() == limit_plus_one {
            // The last item fetched is the key for the next page
            shelf_ids_with_ts.pop().map(|(ts, _)| ts)
        } else {
            None
        };

        // Get the actual Shelf data for the current page
        let shelf_ids: Vec<ShelfId> = shelf_ids_with_ts.into_iter().map(|(_, id)| id).collect();

        SHELVES.with(|shelves| {
            let shelves_ref = shelves.borrow();
            let items: Vec<Shelf> = shelf_ids
                .iter()
                .filter_map(|id| shelves_ref.get(id))
                .collect();
            
            Ok(CursorPaginatedResult {
                items,
                next_cursor,
                limit: Nat::from(limit),
            })
        })
    })
}

/// Get optimization metrics for a shelf's positions
/// This helps frontend clients identify when a shelf needs rebalancing
#[ic_cdk::query]
pub fn get_shelf_position_metrics(shelf_id: ShelfId) -> Result<ShelfPositionMetrics, String> {
    SHELVES.with(|shelves| {
        let shelves_map = shelves.borrow();
        
        if let Some(shelf) = shelves_map.get(&shelf_id) {
            let position_count = shelf.item_positions.len();
            
            if position_count < 2 {
                return Ok(ShelfPositionMetrics {
                    item_count: position_count,
                    min_gap: 0.0,
                    avg_gap: 0.0,
                    max_gap: 0.0,
                });
            }
            
            let mut positions: Vec<f64> = shelf.item_positions.values().cloned().collect();
            positions.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
            
            let mut min_gap = f64::MAX;
            let mut max_gap = 0.0;
            let mut sum_gap = 0.0;
            
            for i in 1..positions.len() {
                let gap = positions[i] - positions[i-1];
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
            Err("Shelf not found".to_string())
        }
    })
}

/// Get shelf IDs associated with a specific tag (Paginated).
/// Returns an empty list if the tag is not found.
#[ic_cdk::query]
pub fn get_shelves_by_tag(
    tag: String, 
    pagination: CursorPaginationInput<TagShelfAssociationKey>
) -> QueryResult<CursorPaginatedResult<ShelfId, TagShelfAssociationKey>> {
    let normalized_tag = normalize_tag(&tag);
    if normalized_tag.is_empty() {
        // Return empty result for empty tag
        return Ok(CursorPaginatedResult {
            items: Vec::new(),
            next_cursor: None,
            limit: Nat::from(pagination.get_limit()),
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
    let items: Vec<ShelfId> = result_keys.into_iter().map(|key| key.1).collect();

    Ok(CursorPaginatedResult {
        items,
        next_cursor,
        limit: Nat::from(limit),
    })
}

/// Get the number of shelves associated with a specific tag.
#[ic_cdk::query]
pub fn get_tag_shelf_count(tag: String) -> u64 {
     let normalized_tag = normalize_tag(&tag);
     
     crate::storage::TAG_METADATA.with(|meta| {
         meta.borrow()
             .get(&normalized_tag)
             .map_or(0, |m| m.current_shelf_count)
     })
}

/// Get popular tags (most associated shelves first - Paginated).
#[ic_cdk::query]
pub fn get_popular_tags(
    pagination: CursorPaginationInput<TagPopularityKey>
) -> QueryResult<CursorPaginatedResult<NormalizedTag, TagPopularityKey>> {
    let limit = pagination.get_limit();
    let limit_plus_one = limit + 1;
    let mut result_keys: Vec<TagPopularityKey> = Vec::with_capacity(limit_plus_one);

    TAG_POPULARITY_INDEX.with(|pop| {
        let map = pop.borrow();

        // Determine the starting bound for reverse iteration based on the cursor
        let start_bound = match pagination.cursor {
            Some(cursor_key) => Bound::Excluded(cursor_key), // Start exclusively before the cursor (higher popularity)
            None => Bound::Unbounded, // Start from the highest popularity
        };
        
        // Iterate in reverse (highest count first)
        for (key, _) in map.iter().rev() // Use iter().rev() for descending order
            .skip_while(|(k, _)| match start_bound {
                Bound::Excluded(ref cursor_key) => k >= cursor_key, // Skip keys >= cursor
                Bound::Unbounded => false,
                _ => unreachable!(), // Should only be Excluded or Unbounded
            })
            .take(limit_plus_one) 
        {
            result_keys.push(key.clone());
        }
    });

    // Determine the next cursor
    let next_cursor = if result_keys.len() == limit_plus_one {
        result_keys.pop() // Remove the extra item and use its key as the cursor
    } else {
        None
    };

    // Extract tags from the keys
    let items: Vec<NormalizedTag> = result_keys.into_iter().map(|key| key.1).collect();

    Ok(CursorPaginatedResult {
        items,
        next_cursor,
        limit: Nat::from(limit),
    })
}

/// Get tags starting with a given prefix (case-insensitive - Paginated).
#[ic_cdk::query]
pub fn get_tags_with_prefix(
    prefix: String, 
    pagination: CursorPaginationInput<NormalizedTag>
) -> QueryResult<CursorPaginatedResult<NormalizedTag, NormalizedTag>> {
    let normalized_prefix = normalize_tag(&prefix);
    if normalized_prefix.is_empty() {
        // Return empty result for empty prefix
        return Ok(CursorPaginatedResult {
            items: Vec::new(),
            next_cursor: None,
            limit: Nat::from(pagination.get_limit()),
        });
    }

    let limit = pagination.get_limit();
    let limit_plus_one = limit + 1;
    let mut matching_tags = Vec::with_capacity(limit_plus_one);

    TAG_LEXICAL_INDEX.with(|lex| {
        let map = lex.borrow();

        // Determine the start bound based on the cursor
        let start_bound = match pagination.cursor {
            Some(cursor_tag) => {
                // Basic validation: cursor must start with the prefix
                if !cursor_tag.starts_with(&normalized_prefix) {
                    return Err(QueryError::InvalidCursor); 
                }
                Bound::Excluded(cursor_tag)
            },
            None => Bound::Included(normalized_prefix.clone()), // Start from the prefix itself
        };

        // Iterate through tags starting from the bound
        for (tag, _) in map.range((start_bound, Bound::Unbounded)) {
            // Stop if the tag no longer starts with the prefix
            if !tag.starts_with(&normalized_prefix) {
                break;
            }

            matching_tags.push(tag.clone());

            // Stop if we have fetched enough tags for pagination
            if matching_tags.len() >= limit_plus_one {
                break;
            }
        }
        Ok(())
    })?;

    // Determine the next cursor
    let next_cursor = if matching_tags.len() == limit_plus_one {
        matching_tags.pop() // The last tag fetched is the cursor for the next page
    } else {
        None
    };

    // `matching_tags` now contains only the items for the current page
    let items = matching_tags;

    Ok(CursorPaginatedResult {
        items,
        next_cursor,
        limit: Nat::from(limit),
    })
}

#[derive(CandidType)]
pub struct ShelfPositionMetrics {
    pub item_count: usize,
    pub min_gap: f64,
    pub avg_gap: f64,
    pub max_gap: f64, 
}