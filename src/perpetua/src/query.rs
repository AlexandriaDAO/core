use candid::{CandidType, Principal};
use ic_cdk;

use crate::storage::{SHELVES, USER_SHELVES, GLOBAL_TIMELINE, USER_PROFILE_ORDER, TAG_SHELVES, TAG_POPULARITY, TAG_PREFIXES, Shelf, Item, StringVec, normalize_tag, PREFIX_LENGTH};

#[derive(CandidType, Debug)]
pub enum QueryError {
    ShelfNotFound,
    UserNotFound,
    NftNotFound,
    InvalidTimeRange,
    UnauthorizedAccess,
    TagNotFound,
}

pub type QueryResult<T> = Result<T, QueryError>;

// Shelf queries
#[ic_cdk::query]
pub fn get_shelf(shelf_id: String) -> QueryResult<Shelf> {
    SHELVES.with(|shelves| {
        shelves
            .borrow()
            .get(&shelf_id)
            .map(|shelf| shelf.clone())
            .ok_or(QueryError::ShelfNotFound)
    })
}

#[ic_cdk::query]
pub fn get_shelf_items(shelf_id: String) -> QueryResult<Vec<Item>> {
    get_shelf(shelf_id).map(|shelf| shelf.get_ordered_items())
}

// User queries
#[ic_cdk::query]
pub fn get_user_shelves(user: Principal, range: Option<usize>) -> QueryResult<Vec<Shelf>> {
    USER_SHELVES.with(|user_shelves| {
        user_shelves
            .borrow()
            .get(&user)
            .ok_or(QueryError::UserNotFound)
            .map(|timestamped| {
                // Check if the user has a customized profile order
                let has_custom_order = USER_PROFILE_ORDER.with(|profile_order| {
                    profile_order.borrow().get(&user)
                        .map_or(false, |order| order.is_customized)
                });
                
                // Different collection strategy based on whether there's custom ordering
                if has_custom_order {
                    // For customized profiles, we need to combine ordered and non-ordered shelves
                    USER_PROFILE_ORDER.with(|profile_order| {
                        let order_ref = profile_order.borrow();
                        let user_order = order_ref.get(&user).unwrap();  // Safe because we checked above
                        
                        // 2. Prepare ordered shelf IDs
                        let mut ordered_positions: Vec<(String, f64)> = user_order.shelf_positions
                            .iter()
                            .map(|(id, &pos)| (id.clone(), pos))
                            .collect();
                        
                        // Sort by position
                        ordered_positions.sort_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap());
                        
                        // Get IDs in order
                        let ordered_ids: Vec<String> = ordered_positions
                            .into_iter()
                            .map(|(id, _)| id)
                            .collect();
                        
                        // 3. Collect non-ordered shelf IDs (those without custom positions)
                        // These will be added after the ordered ones, in reverse timestamp order
                        let mut timestamp_ordered_ids: Vec<(u64, String)> = timestamped.0
                            .iter()
                            .filter(|(_, id)| !ordered_ids.contains(id))
                            .map(|&(ts, ref id)| (ts, id.clone()))
                            .collect();
                        
                        // Sort by timestamp descending (newest first)
                        timestamp_ordered_ids.sort_by(|a, b| b.0.cmp(&a.0));
                        
                        // Take only the IDs
                        let non_ordered_ids: Vec<String> = timestamp_ordered_ids
                            .into_iter()
                            .map(|(_, id)| id)
                            .collect();
                        
                        // 4. Combine the two lists: ordered first, then non-ordered
                        let mut combined_ids = Vec::new();
                        combined_ids.extend(ordered_ids);
                        combined_ids.extend(non_ordered_ids);
                        
                        // Apply range limit if specified
                        let limit_ids = if let Some(limit) = range {
                            combined_ids.into_iter().take(limit).collect()
                        } else {
                            combined_ids
                        };
                        
                        // 5. Fetch the actual shelves
                        SHELVES.with(|shelves| {
                            let shelves_ref = shelves.borrow();
                            limit_ids
                                .iter()
                                .filter_map(|id| shelves_ref.get(id))
                                .collect()
                        })
                    })
                } else {
                    // For non-customized profiles, use the original timestamp-based ordering
                    let shelf_ids: Vec<String> = match range {
                        Some(limit) => timestamped.0
                            .iter()
                            .rev() // Most recent first
                            .take(limit)
                            .map(|(_, id)| id.clone())
                            .collect(),
                        None => timestamped.0
                            .iter()
                            .map(|(_, id)| id.clone())
                            .collect(),
                    };
                    
                    // Fetch the actual shelves
                    SHELVES.with(|shelves| {
                        let shelves_ref = shelves.borrow();
                        shelf_ids
                            .iter()
                            .filter_map(|id| shelves_ref.get(id))
                            .collect()
                    })
                }
            })
    })
}

// Global timeline query
#[ic_cdk::query]
pub fn get_recent_shelves(limit: Option<usize>, before_timestamp: Option<u64>) -> QueryResult<Vec<Shelf>> {
    let max_limit = 50; // Set a reasonable maximum limit
    let limit = limit.unwrap_or(20).min(max_limit); // Default to 20, cap at max_limit
    let max_ts = before_timestamp.unwrap_or(u64::MAX);
    
    GLOBAL_TIMELINE.with(|timeline| {
        let timeline_ref = timeline.borrow();
        
        // Get shelf IDs from timeline, limited by timestamp and count
        let shelf_ids: Vec<String> = timeline_ref
            .range(0..=max_ts)
            .rev() // Newest first
            .take(limit)
            .map(|(_, id)| id.clone())
            .collect();
        
        if shelf_ids.is_empty() {
            return Ok(Vec::new());
        }
        
        // Fetch the actual shelves
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
pub fn get_shelf_position_metrics(shelf_id: String) -> Result<ShelfPositionMetrics, String> {
    SHELVES.with(|shelves| {
        let shelves_map = shelves.borrow();
        
        if let Some(shelf) = shelves_map.get(&shelf_id) {
            // Build metrics
            let position_count = shelf.item_positions.len();
            
            // Calculate min, max, and average gap
            if position_count < 2 {
                return Ok(ShelfPositionMetrics {
                    item_count: position_count,
                    min_gap: 0.0,
                    avg_gap: 0.0,
                    max_gap: 0.0,
                });
            }
            
            // Get ordered positions
            let mut positions: Vec<f64> = shelf.item_positions.values().cloned().collect();
            positions.sort_by(|a, b| a.partial_cmp(b).unwrap());
            
            // Calculate gaps
            let mut min_gap = f64::MAX;
            let mut max_gap = 0.0;
            let mut sum_gap = 0.0;
            
            for i in 1..positions.len() {
                let gap = positions[i] - positions[i-1];
                min_gap = f64::min(min_gap, gap);
                max_gap = f64::max(max_gap, gap);
                sum_gap += gap;
            }
            
            let avg_gap = sum_gap / (positions.len() - 1) as f64;
            
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

/// Get shelves by tag with pagination
#[ic_cdk::query]
pub fn get_shelves_by_tag(tag: String, offset: u64, limit: u32) -> QueryResult<Vec<Shelf>> {
    // Get shelf IDs for this tag
    let shelf_ids = TAG_SHELVES.with(|tag_shelves| {
        tag_shelves.borrow().get(&tag)
            .map(|shelves| shelves.0.clone())
            .ok_or(QueryError::TagNotFound)
    })?;
    
    // Skip to offset and take limit
    let page_ids: Vec<String> = shelf_ids.into_iter()
        .skip(offset as usize)
        .take(limit as usize)
        .collect();
    
    if page_ids.is_empty() {
        return Ok(Vec::new());
    }
    
    // Get shelves by ID
    let result = SHELVES.with(|shelves| {
        let shelves_map = shelves.borrow();
        page_ids.iter()
            .filter_map(|id| shelves_map.get(id).map(|shelf| shelf.clone()))
            .collect()
    });
    
    Ok(result)
}

/// Get most popular tags with pagination
#[ic_cdk::query]
pub fn get_popular_tags(offset: u64, limit: u32) -> Vec<(String, u64)> {
    TAG_POPULARITY.with(|popularity| {
        let pop_map = popularity.borrow();
        let mut result = Vec::new();
        
        for (count, tag) in pop_map.iter().skip(offset as usize).take(limit as usize) {
            // Convert reversed count back to actual count
            let actual_count = u64::MAX - count;
            result.push((tag.clone(), actual_count));
        }
        
        result
    })
}

/// Get tags matching a prefix (for autocomplete)
#[ic_cdk::query]
pub fn get_tags_with_prefix(prefix: String, limit: u32) -> Vec<String> {
    let normalized_prefix = normalize_tag(&prefix);
    
    // For prefixes long enough, we can use the prefix index
    if normalized_prefix.len() >= PREFIX_LENGTH {
        let search_prefix = normalized_prefix.chars().take(PREFIX_LENGTH).collect::<String>();
        
        // Use the prefix index to get candidate tags
        return TAG_PREFIXES.with(|prefixes| {
            let prefix_map = prefixes.borrow();
            
            if let Some(tags) = prefix_map.get(&search_prefix) {
                // Filter the candidates by the full prefix
                tags.0.iter()
                    .filter(|tag| tag.starts_with(&normalized_prefix))
                    .take(limit as usize)
                    .cloned()
                    .collect()
            } else {
                Vec::new()
            }
        });
    }
    
    // For very short prefixes, we still need to scan all tags
    TAG_SHELVES.with(|tag_shelves| {
        let tag_map = tag_shelves.borrow();
        let mut result = Vec::new();
        
        for (tag, _) in tag_map.iter() {
            if tag.starts_with(&normalized_prefix) {
                result.push(tag.clone());
                if result.len() >= limit as usize {
                    break;
                }
            }
        }
        
        result
    })
}

/// Get count of shelves with a specific tag
#[ic_cdk::query]
pub fn get_tag_shelf_count(tag: String) -> u64 {
    TAG_SHELVES.with(|tag_shelves| {
        tag_shelves.borrow().get(&tag)
            .map(|shelves| shelves.0.len() as u64)
            .unwrap_or(0)
    })
}

#[derive(CandidType)]
pub struct ShelfPositionMetrics {
    pub item_count: usize,
    pub min_gap: f64,
    pub avg_gap: f64,
    pub max_gap: f64, 
}

/// Structure for tag system health metrics
#[derive(CandidType)]
pub struct TagSystemMetrics {
    pub total_unique_tags: usize,
    pub total_tag_references: usize,
    pub most_popular_tags: Vec<(String, u64)>,
    pub avg_tag_per_shelf: f64,
    pub unused_tags_count: usize,
}

/// Get health metrics for the tag system
#[ic_cdk::query]
pub fn get_tag_system_metrics() -> TagSystemMetrics {
    // Count unique tags and total references
    let (total_tags, total_refs, unused_count) = TAG_SHELVES.with(|tag_shelves| {
        let shelves_map = tag_shelves.borrow();
        let total = shelves_map.len() as usize; // Ensure usize type
        
        let mut total_refs: usize = 0;
        let mut unused: usize = 0;
        
        for (_, shelves) in shelves_map.iter() {
            let count = shelves.0.len();
            total_refs += count;
            
            if count <= 1 {
                unused += 1;
            }
        }
        
        (total, total_refs, unused)
    });
    
    // Get top 5 popular tags
    let popular_tags: Vec<(String, u64)> = get_popular_tags(0, 5);
    
    // Calculate average tags per shelf
    let avg_tags = SHELVES.with(|shelves| {
        let shelves_map = shelves.borrow();
        let total_shelves = shelves_map.len();
        
        if total_shelves == 0 {
            return 0.0;
        }
        
        let total_tags: usize = shelves_map
            .iter()
            .map(|(_, shelf)| shelf.tags.len())
            .sum();
            
        total_tags as f64 / total_shelves as f64
    });
    
    TagSystemMetrics {
        total_unique_tags: total_tags,
        total_tag_references: total_refs,
        most_popular_tags: popular_tags,
        avg_tag_per_shelf: avg_tags,
        unused_tags_count: unused_count,
    }
}