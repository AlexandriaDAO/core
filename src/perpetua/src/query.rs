use candid::{CandidType, Principal};
use ic_cdk;

use crate::storage::{SHELVES, USER_SHELVES, GLOBAL_TIMELINE, USER_PROFILE_ORDER, Shelf, Item};

#[derive(CandidType, Debug)]
pub enum QueryError {
    ShelfNotFound,
    UserNotFound,
    NftNotFound,
    InvalidTimeRange,
    UnauthorizedAccess,
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
                    needs_rebalance: false,
                    rebalance_count: shelf.rebalance_count,
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
                needs_rebalance: shelf.needs_rebalance,
                rebalance_count: shelf.rebalance_count,
            })
        } else {
            Err("Shelf not found".to_string())
        }
    })
}

#[derive(CandidType)]
pub struct ShelfPositionMetrics {
    pub item_count: usize,
    pub min_gap: f64,
    pub avg_gap: f64,
    pub max_gap: f64, 
    pub needs_rebalance: bool,
    pub rebalance_count: u32,
}