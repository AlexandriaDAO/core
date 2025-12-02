use icrc_ledger_types::icrc1::transfer::BlockIndex;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::account::Subaccount;
use icrc_ledger_types::icrc::generic_value::Value;
use std::collections::BTreeMap;

use candid::{Nat, Principal};

pub const ICRC7_CANISTER_ID: &str = "53ewn-qqaaa-aaaap-qkmqq-cai";
pub const ICRC7_SCION_CANISTER_ID: &str = "uxyan-oyaaa-aaaap-qhezq-cai";
pub const LBRY_CANISTER_ID: &str = "y33wz-myaaa-aaaap-qkmna-cai";
pub const ALEX_CANISTER_ID: &str = "ysy5f-2qaaa-aaaap-qkmmq-cai";
pub const FRONTEND_CANISTER_ID: &str = "yj5ba-aiaaa-aaaap-qkmoa-cai";
pub const ICP_SWAP: &str = "54fqz-5iaaa-aaaap-qkmqa-cai";
pub const NFT_MANAGER: &str = "5sh5r-gyaaa-aaaap-qkmra-cai";
pub const EMPORIUM: &str = "zdcg2-dqaaa-aaaap-qpnha-cai";
pub const KAIROS: &str = "be2us-64aaa-aaaaa-qaabq-cai";

pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

pub fn icrc7_principal() -> Principal {
    get_principal(ICRC7_CANISTER_ID)
}

pub fn icrc7_scion_principal() -> Principal {
    get_principal(ICRC7_SCION_CANISTER_ID)
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

pub fn icp_swap_principal() -> Principal {
    get_principal(ICP_SWAP)
}

pub fn nft_manager_principal() -> Principal {
    get_principal(NFT_MANAGER)
}

pub fn emporium_principal() -> Principal {
    get_principal(EMPORIUM)
}

pub fn kairos_principal() -> Principal {
    get_principal(KAIROS)
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

mod nft_wallets;
pub use nft_wallets::*;

mod topup_wallet;
pub use topup_wallet::*;

mod topup_app;
pub use topup_app::*;

mod update;
pub use update::*;

mod guard;
pub use guard::*;

mod coordinate_mint;
pub use coordinate_mint::*;

mod action_fees;
pub use action_fees::*;

ic_cdk::export_candid!();