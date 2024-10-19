use icrc_ledger_types::icrc1::transfer::BlockIndex;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc::generic_value::Value;
use std::collections::BTreeMap;

use candid::{Nat, Principal};

pub const REGISTRY_CANISTER_ID: &str = "uxyan-oyaaa-aaaap-qhezq-cai";

pub async fn get_canister_id(canister_name: &str) -> Principal {
    // Call get_registry_principal from registry canister
    ic_cdk::call::<(String,), (Principal,)>(
        Principal::from_text(REGISTRY_CANISTER_ID).unwrap(),
        "get_registry_principal",
        (canister_name.to_string(),),
    )
    .await
    .expect("Failed to get canister ID")
    .0
}

pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

mod init;
pub use init::*;

mod types;
pub use types::*;

mod utils;
pub use utils::*;

mod id_converter;
pub use id_converter::*;

mod query;
pub use query::*;

mod wallets;
pub use wallets::*;

mod update;
pub use update::*;

mod guard;
pub use guard::*;

// mod dao;
// pub use dao::*;

// mod playground;
// pub use playground::*;

// mod tests;
// pub use tests::*;

ic_cdk::export_candid!();