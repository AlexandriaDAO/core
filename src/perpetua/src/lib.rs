use ic_cdk::{self, init, spawn};
use candid::{Principal, Nat};
use std::time::Duration;

pub const ICRC7_CANISTER_ID: &str = "53ewn-qqaaa-aaaap-qkmqq-cai";
pub const ICRC7_SCION_CANISTER_ID: &str = "uxyan-oyaaa-aaaap-qhezq-cai";

pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

pub fn icrc7_principal() -> Principal {
    get_principal(ICRC7_CANISTER_ID)
}

pub fn icrc7_scion_principal() -> Principal {
    get_principal(ICRC7_SCION_CANISTER_ID)
}

pub mod guard;
pub mod auth;
pub mod storage;
pub mod ordering;
pub mod update {
    pub mod shelf;
    pub mod item;
    pub mod access;
    pub mod utils;
    pub mod profile;
    pub mod tags;
    pub mod follow;
}
pub mod query;
pub mod utils;
pub mod types;

pub use storage::{Item, Shelf, ShelfId, NormalizedTag, ItemId};
pub use types::{TagPopularityKey, TagShelfAssociationKey};
pub use update::shelf::{store_shelf, update_shelf_metadata};
pub use update::item::{
    AddItemInput, add_item_to_shelf, remove_item_from_shelf, 
    create_and_add_shelf_item
};
pub use update::access::{add_shelf_editor, remove_shelf_editor, list_shelf_editors};
pub use update::profile::{reorder_profile_shelf, reset_profile_order};
pub use update::tags::{TagOperationInput, add_tag_to_shelf, remove_tag_from_shelf};
pub use query::{
    get_shelf, get_shelf_items, get_user_shelves, get_recent_shelves, 
    get_shelf_position_metrics, 
    get_shelves_by_tag, get_tag_shelf_count, get_popular_tags, get_tags_with_prefix,
    QueryResult, QueryError,
    ShelfPositionMetrics,
    OffsetPaginationInput,
    CursorPaginationInput,
    OffsetPaginatedResult,
    CursorPaginatedResult
};
pub use update::follow::*;

#[init]
fn init() {
    let gc_interval = Duration::from_secs(60 * 60 * 24);
    ic_cdk_timers::set_timer_interval(gc_interval, || {
        spawn(async {
             ic_cdk::println!("Running scheduled tag garbage collection...");
             update::tags::gc_orphaned_tags();
        });
    });
    ic_cdk::println!("Perpetua canister initialized with GC timer set for interval: {:?}", gc_interval);
}

ic_cdk::export_candid!();


