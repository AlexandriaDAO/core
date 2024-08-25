use icrc_ledger_types::icrc1::transfer::BlockIndex;

use ic_cdk;
use candid::{Nat, Principal};

mod init;
pub use init::*;

mod wallets;
pub use wallets::*;

mod nft;
pub use nft::*;

mod tests;
pub use tests::*;

ic_cdk::export_candid!();