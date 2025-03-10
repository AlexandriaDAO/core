use candid::Principal;
use ic_cdk_macros::init;

pub mod crypto;
pub mod store;
pub mod model;
pub mod updates;
pub mod queries;
pub mod errors;
pub mod validations;
pub mod utilities;

pub use crypto::*;
pub use store::*;
pub use model::*;
pub use updates::*;
pub use queries::*;
pub use errors::*;
pub use validations::*;
pub use utilities::*;

ic_cdk::export_candid!();

#[init]
fn init() {
    ic_cdk::setup();
    init_counter();
}