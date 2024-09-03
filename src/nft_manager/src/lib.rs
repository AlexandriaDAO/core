use icrc_ledger_types::icrc1::transfer::BlockIndex;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc::generic_value::Value;
use std::collections::BTreeMap;

use candid::{Nat, Principal};


pub const ICRC7_CANISTER_ID: &str = "fjqb7-6qaaa-aaaak-qc7gq-cai";
pub const LBRY_CANISTER_ID: &str = "hdtfn-naaaa-aaaam-aciva-cai";
pub const ALEX_CANISTER_ID: &str = "7hcrm-4iaaa-aaaak-akuka-cai";
pub const FRONTEND_CANISTER_ID: &str = "xo3nl-yaaaa-aaaap-abl4q-cai";

pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

pub fn icrc7_principal() -> Principal {
    get_principal(ICRC7_CANISTER_ID)
}

pub fn lbry_principal() -> Principal {
    get_principal(LBRY_CANISTER_ID)
}

pub fn alex_principal() -> Principal {
    get_principal(ALEX_CANISTER_ID)
}

pub fn frontend_principal() -> Principal {
    get_principal(FRONTEND_CANISTER_ID)
}


mod init;
pub use init::*;

mod types;
pub use types::*;

mod utils;
pub use utils::*;

mod query;
pub use query::*;

mod wallets;
pub use wallets::*;

mod update;
pub use update::*;

mod dao;
pub use dao::*;

mod guard;
pub use guard::*;

// mod playground;
// pub use playground::*;

// mod tests;
// pub use tests::*;

ic_cdk::export_candid!();