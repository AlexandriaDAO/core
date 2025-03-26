use ic_cdk;
use candid::Principal;

pub const ICRC7_CANISTER_ID: &str = "53ewn-qqaaa-aaaap-qkmpq-cai";
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
}
pub mod query;
pub mod utils;

pub use storage::{Item, Shelf};
pub use update::shelf::{ShelfUpdate, store_shelf, update_shelf_metadata, rebalance_shelf_items};
pub use update::item::{
    ItemReorderInput, reorder_shelf_item, 
    AddItemInput, add_item_to_shelf, remove_item_from_shelf, 
    create_and_add_shelf_item
};
pub use update::access::{add_shelf_editor, remove_shelf_editor, list_shelf_editors};
pub use update::profile::{reorder_profile_shelf, reset_profile_order};
pub use query::*;

ic_cdk::export_candid!();


