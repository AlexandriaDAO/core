use candid::Principal;
use ic_cdk::api::caller;
use ic_cdk_macros::query;

use crate::errors::activity::{ActivityError, ActivityResult};
use crate::models::activity::{Activity, ActivityType, CommentInfo, ReactionCounts, ReactionType};
use crate::store::{
    ACTIVITIES, ARWEAVE_ACTIVITIES, USER_ACTIVITIES, USER_REACTIONS,
    StorableString, StorablePrincipal, StorableUserReactionKey, UserReactionKey
};

/// Get the caller's principal
#[query]
pub fn whoami() -> Principal {
    caller()
}

/// Get all activities for a specific NFT
#[query]
pub fn get_activities(arweave_id: String) -> ActivityResult<Vec<Activity>> {
    if arweave_id.trim().is_empty() {
        return Err(ActivityError::InvalidArweaveId);
    }

    ARWEAVE_ACTIVITIES.with(|arweave_activities| {
        let arweave_activities = arweave_activities.borrow();
        match arweave_activities.get(&StorableString(arweave_id)) {
            Some(activity_ids) => {
                ACTIVITIES.with(|activities| {
                    let activities = activities.borrow();
                    let mut result = Vec::new();
                    
                    for activity_id in activity_ids.0 .0.iter() {
                        if let Some(activity) = activities.get(activity_id) {
                            result.push(activity.0);
                        }
                    }
                    
                    // Sort by creation time (newest first)
                    result.sort_by(|a, b| b.created_at.cmp(&a.created_at));
                    Ok(result)
                })
            }
            None => Ok(Vec::new()),
        }
    })
}

/// Get all activities by a specific user
#[query]
pub fn get_user_activities(user: Principal) -> ActivityResult<Vec<Activity>> {
    if user == Principal::anonymous() {
        return Err(ActivityError::AnonymousNotAllowed);
    }

    USER_ACTIVITIES.with(|user_activities| {
        let user_activities = user_activities.borrow();
        match user_activities.get(&StorablePrincipal(user)) {
            Some(activity_ids) => {
                ACTIVITIES.with(|activities| {
                    let activities = activities.borrow();
                    let mut result = Vec::new();
                    
                    for activity_id in activity_ids.0 .0.iter() {
                        if let Some(activity) = activities.get(activity_id) {
                            result.push(activity.0);
                        }
                    }
                    
                    // Sort by creation time (newest first)
                    result.sort_by(|a, b| b.created_at.cmp(&a.created_at));
                    Ok(result)
                })
            }
            None => Ok(Vec::new()),
        }
    })
}

/// Get all comments for a specific NFT
#[query]
pub fn get_comments(arweave_id: String) -> ActivityResult<Vec<CommentInfo>> {
    if arweave_id.trim().is_empty() {
        return Err(ActivityError::InvalidArweaveId);
    }

    ARWEAVE_ACTIVITIES.with(|arweave_activities| {
        let arweave_activities = arweave_activities.borrow();
        match arweave_activities.get(&StorableString(arweave_id)) {
            Some(activity_ids) => {
                ACTIVITIES.with(|activities| {
                    let activities = activities.borrow();
                    let mut comments = Vec::new();
                    
                    for activity_id in activity_ids.0 .0.iter() {
                        if let Some(activity) = activities.get(activity_id) {
                            if let ActivityType::Comment(comment_text) = &activity.0.activity_type {
                                comments.push(CommentInfo {
                                    id: activity.0.id,
                                    user: activity.0.user,
                                    comment: comment_text.clone(),
                                    created_at: activity.0.created_at,
                                });
                            }
                        }
                    }
                    
                    // Sort by creation time (newest first)
                    comments.sort_by(|a, b| b.created_at.cmp(&a.created_at));
                    Ok(comments)
                })
            }
            None => Ok(Vec::new()),
        }
    })
}

/// Get aggregated reaction counts for a specific NFT
#[query]
pub fn get_reaction_counts(arweave_id: String) -> ActivityResult<ReactionCounts> {
    if arweave_id.trim().is_empty() {
        return Err(ActivityError::InvalidArweaveId);
    }

    ARWEAVE_ACTIVITIES.with(|arweave_activities| {
        let arweave_activities = arweave_activities.borrow();
        match arweave_activities.get(&StorableString(arweave_id)) {
            Some(activity_ids) => {
                ACTIVITIES.with(|activities| {
                    let activities = activities.borrow();
                    let mut counts = ReactionCounts::default();
                    
                    for activity_id in activity_ids.0 .0.iter() {
                        if let Some(activity) = activities.get(activity_id) {
                            match &activity.0.activity_type {
                                ActivityType::Reaction(ReactionType::Like) => counts.likes += 1,
                                ActivityType::Reaction(ReactionType::Dislike) => counts.dislikes += 1,
                                ActivityType::Comment(_) => counts.total_comments += 1,
                            }
                        }
                    }
                    
                    Ok(counts)
                })
            }
            None => Ok(ReactionCounts::default()),
        }
    })
}

/// Get the current user's reaction for a specific NFT
#[query]
pub fn get_user_reaction(arweave_id: String) -> ActivityResult<Option<ReactionType>> {
    get_user_reaction_for_principal(arweave_id, caller())
}

/// Get a specific user's reaction for a specific NFT
#[query]
pub fn get_user_reaction_for_principal(arweave_id: String, user: Principal) -> ActivityResult<Option<ReactionType>> {
    if arweave_id.trim().is_empty() {
        return Err(ActivityError::InvalidArweaveId);
    }

    if user == Principal::anonymous() {
        return Ok(None);
    }

    USER_REACTIONS.with(|user_reactions| {
        let user_reactions = user_reactions.borrow();
        let key = UserReactionKey { arweave_id, user };
        
        match user_reactions.get(&StorableUserReactionKey(key)) {
            Some(activity_id) => {
                ACTIVITIES.with(|activities| {
                    let activities = activities.borrow();
                    match activities.get(&activity_id) {
                        Some(activity) => {
                            if let ActivityType::Reaction(reaction_type) = &activity.0.activity_type {
                                Ok(Some(reaction_type.clone()))
                            } else {
                                Ok(None)
                            }
                        }
                        None => Ok(None),
                    }
                })
            }
            None => Ok(None),
        }
    })
}

/// Get a specific activity by ID
#[query]
pub fn get_activity(activity_id: u64) -> ActivityResult<Activity> {
    ACTIVITIES.with(|activities| {
        let activities = activities.borrow();
        match activities.get(&activity_id) {
            Some(activity) => Ok(activity.0),
            None => Err(ActivityError::NotFound(activity_id)),
        }
    })
}