use candid::CandidType;
use serde::{Deserialize, Serialize};

/// Request to add a reaction to an NFT
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct AddReactionRequest {
    pub arweave_id: String,
    pub reaction_type: super::activity::ReactionType,
}

/// Request to add a comment to an NFT
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct AddCommentRequest {
    pub arweave_id: String,
    pub comment: String,
}

/// Request to update an existing comment
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UpdateCommentRequest {
    pub activity_id: u64,
    pub new_comment: String,
}

/// Response for activity operations
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ActivityResponse {
    pub success: bool,
    pub message: String,
    pub activity: Option<super::activity::Activity>,
}