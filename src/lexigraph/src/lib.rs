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

pub mod storage;
pub use storage::{Slot, Shelf};

pub mod update;
pub use update::{ShelfUpdate, update_shelf, store_shelf, SlotReorderInput, reorder_shelf_slot, AddSlotInput, add_shelf_slot, delete_shelf};

pub mod query;
pub use query::*;

pub mod utils;
pub use utils::generate_shelf_id;

pub mod guard;
pub use guard::not_anon;

ic_cdk::export_candid!();


