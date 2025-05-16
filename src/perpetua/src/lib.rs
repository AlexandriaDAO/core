use ic_cdk::{self, spawn};
use candid::{Principal};
use std::time::Duration;

// Re-added constants
pub const ICRC7_CANISTER_ID: &str = "53ewn-qqaaa-aaaap-qkmqq-cai";
pub const ICRC7_SCION_CANISTER_ID: &str = "uxyan-oyaaa-aaaap-qhezq-cai";

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
    pub mod restore;
    pub mod debug;
}
pub mod query {
    pub mod shelves;
    pub mod follows;
}
pub mod utils;
pub mod types;

pub use storage::{Item, Shelf, ShelfId, NormalizedTag, ItemId, ShelfPublic, ShelfBackupData, TagShelfCreationTimelineKey};
pub use types::{TagPopularityKey, /* TagShelfAssociationKey, */ GlobalTimelineBackupChunk, ShelvesEssentialBackupChunk, BackupPaginationInput};
pub use update::shelf::{store_shelf, update_shelf_metadata};
pub use update::item::{
    AddItemInput, add_item_to_shelf, remove_item_from_shelf, 
};
pub use update::profile::{reorder_profile_shelf, reset_profile_order};
pub use update::tags::{TagOperationInput, add_tag_to_shelf, remove_tag_from_shelf};
pub use query::follows::{
    get_tag_shelf_count, get_popular_tags, get_tags_with_prefix,
    get_my_followed_tags, get_my_followed_users,
    QueryResult, QueryError,
    OffsetPaginationInput,
    CursorPaginationInput,
    OffsetPaginatedResult,
    CursorPaginatedResult,
};
pub use query::shelves::{
    get_shelf, get_shelf_items, get_shelf_position_metrics, get_shelves_by_tag,
    get_shelves_containing_nft,
    get_user_shelves, get_recent_shelves, get_shuffled_by_hour_feed,
    get_followed_users_feed, get_followed_tags_feed,
    ShelfPositionMetrics
};
pub use update::follow::*;

pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

pub fn icrc7_principal() -> Principal {
    get_principal(ICRC7_CANISTER_ID)
}

pub fn icrc7_scion_principal() -> Principal {
    get_principal(ICRC7_SCION_CANISTER_ID)
}

ic_cdk::export_candid!();