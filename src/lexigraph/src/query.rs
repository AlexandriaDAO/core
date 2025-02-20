use candid::{CandidType, Principal};
use ic_cdk;

use crate::storage::{SHELVES, USER_SHELVES, Shelf, Slot};

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