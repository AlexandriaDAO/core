use candid::Principal;
use ic_cdk;
mod storage;
pub use storage::*;
mod queries;
pub use queries::*;
mod update;
pub use update::*;
mod guard;
pub use guard::*;
mod utils;
use ic_cdk::api::call::CallResult;
pub use utils::*;


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
