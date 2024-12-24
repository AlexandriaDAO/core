use candid::Principal;

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


mod burn;
mod utils;
pub use utils::*;
pub use burn::*;

ic_cdk::export_candid!();















