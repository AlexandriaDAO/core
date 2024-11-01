use icrc_ledger_types::icrc1::transfer::BlockIndex;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc::generic_value::Value;
use std::collections::BTreeMap;

use candid::{Nat, Principal};


pub const ICRC7_CANISTER_ID: &str = "53ewn-qqaaa-aaaap-qkmqq-cai";
pub const LBRY_CANISTER_ID: &str = "y33wz-myaaa-aaaap-qkmna-cai";
pub const ALEX_CANISTER_ID: &str = "ysy5f-2qaaa-aaaap-qkmmq-cai";
pub const FRONTEND_CANISTER_ID: &str = "yj5ba-aiaaa-aaaap-qkmoa-cai";

pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

pub fn icrc7_principal() -> Principal {
    get_principal(ICRC7_CANISTER_ID)
}

pub fn alex_principal() -> Principal {
    get_principal(ALEX_CANISTER_ID)
}

pub fn lbry_principal() -> Principal {
    get_principal(LBRY_CANISTER_ID)
}

// use icrc_ledger_types::icrc1::account::Subaccount;
pub fn frontend_principal() -> Principal {
    get_principal(FRONTEND_CANISTER_ID)
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