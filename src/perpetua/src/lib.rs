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
pub mod update;
pub mod query;
pub mod utils;

pub use storage::{Slot, Shelf};
pub use update::{ShelfUpdate, store_shelf, SlotReorderInput, reorder_shelf_slot, AddSlotInput, rebalance_shelf_slots};
pub use query::*;

ic_cdk::export_candid!();


