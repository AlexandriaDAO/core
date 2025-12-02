use candid::Principal;
use ic_cdk_macros::init;
use crate::store::init_counters;

pub mod api;
pub mod errors;
pub mod models;
pub mod store;

// Re-export main types for use in export_candid!()
pub use api::queries::*;
pub use api::updates::*;
pub use errors::activity::{ActivityError, ActivityResult};
pub use models::activity::{
    Activity, ActivityType, CommentInfo, ReactionCounts, ReactionType
};
pub use models::types::{
    AddCommentRequest, AddReactionRequest, ActivityResponse, UpdateCommentRequest
};

ic_cdk::export_candid!();

#[init]
fn init() {
    ic_cdk::setup();
    init_counters();
}