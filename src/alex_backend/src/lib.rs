use crate::source_cards::SourceCard;

use ic_cdk;
use candid::Principal;

mod source_cards;
pub use source_cards::{save_sc, bookmark_sc, delete_sc, get_sc, get_bookmarks};

mod nft_users;
pub use nft_users::{UserNFTInfo, get_stored_nft_users};

mod wallet_keys;
pub use wallet_keys::*;

pub const ICRC7_CANISTER_ID: &str = "53ewn-qqaaa-aaaap-qkmqq-cai";
pub const ICRC7_SCION_CANISTER_ID: &str = "uxyan-oyaaa-aaaap-qhezq-cai";
pub const USER_CANISTER_ID: &str = "yo4hu-nqaaa-aaaap-qkmoq-cai";

pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

pub fn icrc7_principal() -> Principal {
    get_principal(ICRC7_CANISTER_ID)
}

pub fn icrc7_scion_principal() -> Principal {
    get_principal(ICRC7_SCION_CANISTER_ID)
}

pub fn user_principal() -> Principal {
    get_principal(USER_CANISTER_ID)
}

ic_cdk::export_candid!();


