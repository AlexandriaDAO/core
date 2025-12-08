pub mod api;
pub mod errors;
pub mod models;
pub mod store;

// Re-export main types
pub use api::queries::*;
pub use api::updates::*;
pub use errors::activity::{ActivityError, ActivityResult};
pub use models::activity::{
    Activity, ActivityType, CommentInfo, ReactionCounts, ReactionType
};
pub use models::types::{
    AddCommentRequest, AddReactionRequest, ActivityResponse, UpdateCommentRequest
};

// Initialize dialectica counters - call this from main init
pub fn init() {
    store::init_counters();
}
