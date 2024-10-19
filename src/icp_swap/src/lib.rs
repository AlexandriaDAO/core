use candid::Principal;
use serde::{Deserialize, Serialize};

use ic_cdk;
use ic_ledger_types::{
     BlockIndex as BlockIndexIC, Subaccount
};
use icrc_ledger_types::icrc1::transfer::BlockIndex;

mod storage;
pub use storage::{*};

mod update;
pub use update::{*};

mod queries;
pub use queries::{*};

mod guard;
pub use guard::{*};

mod script;
pub use script::{*};
pub mod utils;

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


ic_cdk::export_candid!();
