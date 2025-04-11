use candid::{CandidType, Nat, Principal};
use ic_cdk;
use std::convert::TryInto;

use crate::storage::{
    SHELVES, USER_SHELVES, GLOBAL_TIMELINE, USER_PROFILE_ORDER, 
    TAG_SHELF_ASSOCIATIONS, TAG_POPULARITY_INDEX, TAG_LEXICAL_INDEX,
    Shelf, Item, ShelfId, NormalizedTag,
    TagShelfAssociationKey, TagPopularityKey
};
use crate::utils::normalize_tag;

#[derive(CandidType, Debug)]
pub enum QueryError {
    ShelfNotFound,
    UserNotFound,
    InvalidTimeRange,
    TagNotFound,
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
pub fn get_shelf_items(shelf_id: ShelfId) -> QueryResult<Vec<Item>> {
    get_shelf(shelf_id).map(|shelf| shelf.get_ordered_items())
}

// User queries
#[ic_cdk::query]
pub fn get_user_shelves(user: Principal, range: Option<Nat>) -> QueryResult<Vec<Shelf>> {
    let limit: Option<usize> = range.and_then(|n| n.0.try_into().ok());

    USER_SHELVES.with(|user_shelves| {
        user_shelves
            .borrow()
            .get(&user)
            .ok_or(QueryError::UserNotFound)
            .map(|timestamped| {
                let has_custom_order = USER_PROFILE_ORDER.with(|profile_order| {
                    profile_order.borrow().get(&user)
                        .map_or(false, |order| order.is_customized)
                });
                
                if has_custom_order {
                    USER_PROFILE_ORDER.with(|profile_order| {
                        let order_ref = profile_order.borrow();
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
                        timestamp_ordered_ids.sort_by(|a, b| b.0.cmp(&a.0));
                        
                        let non_ordered_ids: Vec<ShelfId> = timestamp_ordered_ids.into_iter().map(|(_, id)| id).collect();
                        
                        let combined_ids: Vec<ShelfId> = ordered_ids.into_iter().chain(non_ordered_ids.into_iter()).collect();
                        
                        let final_ids: Vec<ShelfId> = match limit {
                             Some(l) => combined_ids.into_iter().take(l).collect(),
                             None => combined_ids,
                        };
                        
                        SHELVES.with(|shelves| {
                            let shelves_ref = shelves.borrow();
                            final_ids.iter().filter_map(|id| shelves_ref.get(id)).collect()
                        })
                    })
                } else {
                    let mut shelf_data: Vec<(u64, ShelfId)> = timestamped.0.iter().cloned().collect();
                    shelf_data.sort_by(|a, b| b.0.cmp(&a.0));

                    let final_ids: Vec<ShelfId> = match limit {
                        Some(l) => shelf_data.into_iter().take(l).map(|(_, id)| id).collect(),
                        None => shelf_data.into_iter().map(|(_, id)| id).collect(),
                    };

                    SHELVES.with(|shelves| {
                        let shelves_ref = shelves.borrow();
                        final_ids.iter().filter_map(|id| shelves_ref.get(id)).collect()
                    })
                }
            })
    })
}

// Global timeline query
#[ic_cdk::query]
pub fn get_recent_shelves(limit: Option<Nat>, before_timestamp: Option<u64>) -> QueryResult<Vec<Shelf>> {
    let max_limit = 50;
    let limit_usize: usize = limit.and_then(|n| n.0.try_into().ok()).unwrap_or(20).min(max_limit);
    let max_ts = before_timestamp.unwrap_or(u64::MAX);
    
    GLOBAL_TIMELINE.with(|timeline| {
        let timeline_ref = timeline.borrow();
        
        let shelf_ids: Vec<ShelfId> = timeline_ref
            .range(..=max_ts)
            .rev()
            .take(limit_usize)
            .map(|(_, id)| id.clone())
            .collect();
        
        if shelf_ids.is_empty() {
            return Ok(Vec::new());
        }
        
        SHELVES.with(|shelves| {
            let shelves_ref = shelves.borrow();
            let result: Vec<Shelf> = shelf_ids
                .iter()
                .filter_map(|id| shelves_ref.get(id))
                .collect();
            
            Ok(result)
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

/// Get shelf IDs associated with a specific tag.
/// Returns an empty vec if the tag is not found.
#[ic_cdk::query]
pub fn get_shelves_by_tag(tag: String) -> Vec<ShelfId> {
    let normalized_tag = normalize_tag(&tag);
    let mut shelf_ids = Vec::new();

    TAG_SHELF_ASSOCIATIONS.with(|assoc| {
        let map = assoc.borrow();
        let start_key = TagShelfAssociationKey(normalized_tag.clone(), String::new());

        for (TagShelfAssociationKey(current_tag, shelf_id), _) in map.range(start_key..) {
            if current_tag == normalized_tag {
                 shelf_ids.push(shelf_id.clone());
            } else {
                break;
            }
        }
    });

    shelf_ids
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

/// Get popular tags (most associated shelves first).
#[ic_cdk::query]
pub fn get_popular_tags(limit: Nat) -> Vec<NormalizedTag> {
    let limit_usize: usize = limit.0.try_into().unwrap_or(usize::MAX);
    let mut popular_tags = Vec::new();

    TAG_POPULARITY_INDEX.with(|pop| {
        let map = pop.borrow();
        for (TagPopularityKey(_count, tag), _) in map.iter().rev().take(limit_usize) {
             popular_tags.push(tag.clone());
        }
    });

    popular_tags
}

/// Get tags starting with a given prefix (case-insensitive).
#[ic_cdk::query]
pub fn get_tags_with_prefix(prefix: String) -> Vec<NormalizedTag> {
    let normalized_prefix = normalize_tag(&prefix);
    if normalized_prefix.is_empty() {
        return Vec::new();
    }

    let mut matching_tags = Vec::new();
    let limit = 50;

    TAG_LEXICAL_INDEX.with(|lex| {
        let map = lex.borrow();
        let start_key = normalized_prefix.clone();
        for (tag, _) in map.range(start_key..) {
            if tag.starts_with(&normalized_prefix) {
                 matching_tags.push(tag.clone());
                 if matching_tags.len() >= limit {
                     break;
                 }
            } else {
                break; 
            }
        }
    });

    matching_tags
}

#[derive(CandidType)]
pub struct ShelfPositionMetrics {
    pub item_count: usize,
    pub min_gap: f64,
    pub avg_gap: f64,
    pub max_gap: f64, 
}