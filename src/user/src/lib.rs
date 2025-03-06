use candid::Principal;
use ic_cdk_macros::init;
use crate::store::init_counters;

pub mod api;
pub mod errors;
pub mod store;
pub mod models;
pub mod validations;

pub use api::node::queries as node_queries;
pub use api::node::updates as node_updates;
pub use api::user::queries as user_queries;
pub use api::user::updates as user_updates;

pub use errors::general::*;
pub use errors::user::UserError;
pub use errors::node::NodeError;
pub use errors::engine::EngineError;

pub use models::user::*;
pub use models::node::*;
pub use models::engine::*;
pub use validations::user::*;

ic_cdk::export_candid!();

#[init]
fn init() {
    ic_cdk::setup();
    init_counters();
}
