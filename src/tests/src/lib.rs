use candid::Principal;
use ic_cdk::println;

pub const LBRY_CANISTER_ID: &str = "y33wz-myaaa-aaaap-qkmna-cai";
pub const ALEX_CANISTER_ID: &str = "ysy5f-2qaaa-aaaap-qkmmq-cai";
pub const ICP_SWAP: &str = "54fqz-5iaaa-aaaap-qkmqa-cai";
pub const TOKENOMICS: &str = "5abki-kiaaa-aaaap-qkmsa-cai";
pub const TESTS: &str = "yn33w-uaaaa-aaaap-qpk5q-cai";

pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

pub fn alex_principal() -> Principal {
    get_principal(ALEX_CANISTER_ID)
}

pub fn lbry_principal() -> Principal {
    get_principal(LBRY_CANISTER_ID)
}

pub fn icp_swap_principal() -> Principal {
    get_principal(ICP_SWAP)
}

pub fn tokenomics_principal() -> Principal {
    get_principal(TOKENOMICS)
}

pub fn tests_principal() -> Principal {
    get_principal(TESTS)
}


mod utils;
mod swap;
mod burn;
mod stake;
mod balances;
pub mod claim;
mod triggers;
pub use utils::*;
pub use swap::*;
pub use burn::*;
pub use stake::*;
pub use balances::*;
pub use claim::*;
pub use triggers::*;

ic_cdk::export_candid!();

#[ic_cdk::init]
pub fn init() {
    println!("🎯 Canister initialized");
    triggers::setup_automated_testing();
}

#[ic_cdk::post_upgrade]
pub fn post_upgrade() {
    println!("🔄 Canister upgraded");
    triggers::setup_automated_testing();
}

// Update exports to only include the public functions we're actually using
pub use crate::triggers::init_automated_testing;

















