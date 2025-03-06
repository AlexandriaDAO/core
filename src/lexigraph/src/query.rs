use candid::{CandidType, Principal};
use ic_cdk;

use crate::storage::{SHELVES, USER_SHELVES, GLOBAL_TIMELINE, Shelf, Slot};

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
pub fn get_shelf_slots(shelf_id: String) -> QueryResult<Vec<Slot>> {
    get_shelf(shelf_id).map(|shelf| shelf.get_ordered_slots())
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
                
                SHELVES.with(|shelves| {
                    let shelves_ref = shelves.borrow();
                    shelf_ids
                        .iter()
                        .filter_map(|id| shelves_ref.get(id))
                        .collect()
                })
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