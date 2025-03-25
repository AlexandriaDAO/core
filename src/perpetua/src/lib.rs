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
pub mod update {
    pub mod shelf;
    pub mod slot;
    pub mod access;
    pub mod utils;
}
pub mod query;
pub mod utils;

pub use storage::{Slot, Shelf};
pub use update::shelf::{ShelfUpdate, store_shelf, update_shelf_metadata, rebalance_shelf_slots};
pub use update::slot::{
    SlotReorderInput, reorder_shelf_slot, 
    AddSlotInput, add_slot_to_shelf, remove_slot_from_shelf, 
    create_and_add_shelf_slot
};
pub use update::access::{add_shelf_editor, remove_shelf_editor, list_shelf_editors};
pub use query::*;

ic_cdk::export_candid!();


