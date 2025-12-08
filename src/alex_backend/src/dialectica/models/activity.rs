use candid::{CandidType, Principal};
use ic_cdk::api::time;
use serde::{Deserialize, Serialize};

/// Represents different types of reactions users can have
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum ReactionType {
    Like,
    Dislike,
    // Future additions:
    // Heart,
    // Smile,
    // Sad,
    // Angry,
}

/// Represents the type of activity a user performed
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ActivityType {
    Reaction(ReactionType),
    Comment(String),
}

/// Main activity structure representing user interactions with NFTs
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Activity {
    pub id: u64,
    pub arweave_id: String,      // NFT identifier (Arweave transaction ID)
    pub user: Principal,          // User who created the activity
    pub activity_type: ActivityType,
    pub created_at: u64,
    pub updated_at: u64,
}

impl Activity {
    /// Creates a new activity with the current timestamp
    pub fn new(id: u64, arweave_id: String, user: Principal, activity_type: ActivityType) -> Self {
        let now = time();
        Self {
            id,
            arweave_id,
            user,
            activity_type,
            created_at: now,
            updated_at: now,
        }
    }
    
    /// Updates the activity with a new timestamp
    pub fn update(&mut self, activity_type: ActivityType) {
        self.activity_type = activity_type;
        self.updated_at = time();
    }
}

/// Aggregated reaction counts for an NFT
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, Default)]
pub struct ReactionCounts {
    pub likes: u64,
    pub dislikes: u64,
    pub total_comments: u64,
}

/// Comment with user and timestamp information
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CommentInfo {
    pub id: u64,
    pub user: Principal,
    pub comment: String,
    pub created_at: u64,
}