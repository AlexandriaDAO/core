use candid::Principal;

mod storage;
pub use storage::*;
mod update;
pub use update::*;

mod queries;
pub use queries::*;
mod utlis;
pub use utlis::*;
use candid::Nat;

ic_cdk::export_candid!();
