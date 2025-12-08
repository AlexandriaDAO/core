use candid::Principal;
use ic_cdk::api::caller;
use ic_cdk_macros::update;

use crate::dialectica::errors::activity::{ActivityError, ActivityResult};
use crate::dialectica::models::activity::{Activity, ActivityType, ReactionType};
use crate::dialectica::store::{
    get_next_activity_id, ActivityIdList, StorableActivity, StorableActivityIdList,
    StorablePrincipal, StorableString, StorableUserReactionKey, StorableViewersList,
    UserReactionKey, ViewersList,
    ACTIVITIES, ARWEAVE_ACTIVITIES, IMPRESSIONS, USER_ACTIVITIES, USER_REACTIONS, VIEWS,
};

/// Add or update a reaction to an NFT
#[update]
pub fn add_reaction(arweave_id: String, reaction_type: ReactionType) -> ActivityResult<Activity> {
    let user = caller();
    
    if user == Principal::anonymous() {
        return Err(ActivityError::AnonymousNotAllowed);
    }

    if arweave_id.trim().is_empty() {
        return Err(ActivityError::InvalidArweaveId);
    }

    let reaction_key = UserReactionKey {
        arweave_id: arweave_id.clone(),
        user,
    };

    // Check if user already has a reaction for this NFT
    USER_REACTIONS.with(|user_reactions| {
        let mut user_reactions = user_reactions.borrow_mut();
        let existing_activity_id = user_reactions.get(&StorableUserReactionKey(reaction_key.clone()));

        match existing_activity_id {
            Some(activity_id) => {
                // Update existing reaction
                ACTIVITIES.with(|activities| {
                    let mut activities = activities.borrow_mut();
                    match activities.get(&activity_id) {
                        Some(mut activity) => {
                            activity.0.update(ActivityType::Reaction(reaction_type));
                            activities.insert(activity_id, activity.clone());
                            Ok(activity.0)
                        }
                        None => Err(ActivityError::NotFound(activity_id)),
                    }
                })
            }
            None => {
                // Create new reaction
                let activity_id = get_next_activity_id();
                let activity = Activity::new(
                    activity_id,
                    arweave_id.clone(),
                    user,
                    ActivityType::Reaction(reaction_type),
                );

                // Store the activity
                ACTIVITIES.with(|activities| {
                    let mut activities = activities.borrow_mut();
                    activities.insert(activity_id, StorableActivity(activity.clone()));
                });

                // Update user reactions index
                user_reactions.insert(StorableUserReactionKey(reaction_key), activity_id);

                // Update user activities index
                USER_ACTIVITIES.with(|user_activities| {
                    let mut user_activities = user_activities.borrow_mut();
                    let mut activity_ids = match user_activities.get(&StorablePrincipal(user)) {
                        Some(ids) => ids.0 .0,
                        None => Vec::new(),
                    };
                    activity_ids.push(activity_id);
                    user_activities.insert(
                        StorablePrincipal(user),
                        StorableActivityIdList(ActivityIdList(activity_ids)),
                    );
                });

                // Update arweave activities index
                ARWEAVE_ACTIVITIES.with(|arweave_activities| {
                    let mut arweave_activities = arweave_activities.borrow_mut();
                    let mut activity_ids = match arweave_activities.get(&StorableString(arweave_id.clone())) {
                        Some(ids) => ids.0 .0,
                        None => Vec::new(),
                    };
                    activity_ids.push(activity_id);
                    arweave_activities.insert(
                        StorableString(arweave_id),
                        StorableActivityIdList(ActivityIdList(activity_ids)),
                    );
                });

                Ok(activity)
            }
        }
    })
}

/// Remove a user's reaction from an NFT
#[update]
pub fn remove_reaction(arweave_id: String) -> ActivityResult<()> {
    let user = caller();
    
    if user == Principal::anonymous() {
        return Err(ActivityError::AnonymousNotAllowed);
    }

    if arweave_id.trim().is_empty() {
        return Err(ActivityError::InvalidArweaveId);
    }

    let reaction_key = UserReactionKey {
        arweave_id: arweave_id.clone(),
        user,
    };

    USER_REACTIONS.with(|user_reactions| {
        let mut user_reactions = user_reactions.borrow_mut();
        match user_reactions.get(&StorableUserReactionKey(reaction_key.clone())) {
            Some(activity_id) => {
                // Remove from user reactions index
                user_reactions.remove(&StorableUserReactionKey(reaction_key));

                // Remove from main activities storage
                ACTIVITIES.with(|activities| {
                    let mut activities = activities.borrow_mut();
                    activities.remove(&activity_id);
                });

                // Remove from user activities index
                USER_ACTIVITIES.with(|user_activities| {
                    let mut user_activities = user_activities.borrow_mut();
                    if let Some(mut ids) = user_activities.get(&StorablePrincipal(user)) {
                        ids.0 .0.retain(|&id| id != activity_id);
                        user_activities.insert(
                            StorablePrincipal(user),
                            StorableActivityIdList(ActivityIdList(ids.0 .0)),
                        );
                    }
                });

                // Remove from arweave activities index
                ARWEAVE_ACTIVITIES.with(|arweave_activities| {
                    let mut arweave_activities = arweave_activities.borrow_mut();
                    if let Some(mut ids) = arweave_activities.get(&StorableString(arweave_id.clone())) {
                        ids.0 .0.retain(|&id| id != activity_id);
                        arweave_activities.insert(
                            StorableString(arweave_id),
                            StorableActivityIdList(ActivityIdList(ids.0 .0)),
                        );
                    }
                });

                Ok(())
            }
            None => Err(ActivityError::NotFound(0)), // No reaction to remove
        }
    })
}

/// Add a comment to an NFT
#[update]
pub fn add_comment(arweave_id: String, comment: String) -> ActivityResult<Activity> {
    let user = caller();
    
    if user == Principal::anonymous() {
        return Err(ActivityError::AnonymousNotAllowed);
    }

    if arweave_id.trim().is_empty() {
        return Err(ActivityError::InvalidArweaveId);
    }

    let comment = comment.trim().to_string();
    if comment.is_empty() {
        return Err(ActivityError::InvalidComment("Comment cannot be empty".to_string()));
    }

    if comment.len() > 1000 {
        return Err(ActivityError::InvalidComment("Comment too long (max 1000 characters)".to_string()));
    }

    let activity_id = get_next_activity_id();
    let activity = Activity::new(
        activity_id,
        arweave_id.clone(),
        user,
        ActivityType::Comment(comment),
    );

    // Store the activity
    ACTIVITIES.with(|activities| {
        let mut activities = activities.borrow_mut();
        activities.insert(activity_id, StorableActivity(activity.clone()));
    });

    // Update user activities index
    USER_ACTIVITIES.with(|user_activities| {
        let mut user_activities = user_activities.borrow_mut();
        let mut activity_ids = match user_activities.get(&StorablePrincipal(user)) {
            Some(ids) => ids.0 .0,
            None => Vec::new(),
        };
        activity_ids.push(activity_id);
        user_activities.insert(
            StorablePrincipal(user),
            StorableActivityIdList(ActivityIdList(activity_ids)),
        );
    });

    // Update arweave activities index
    ARWEAVE_ACTIVITIES.with(|arweave_activities| {
        let mut arweave_activities = arweave_activities.borrow_mut();
        let mut activity_ids = match arweave_activities.get(&StorableString(arweave_id.clone())) {
            Some(ids) => ids.0 .0,
            None => Vec::new(),
        };
        activity_ids.push(activity_id);
        arweave_activities.insert(
            StorableString(arweave_id),
            StorableActivityIdList(ActivityIdList(activity_ids)),
        );
    });

    Ok(activity)
}

/// Remove a comment (only by the comment author)
#[update]
pub fn remove_comment(activity_id: u64) -> ActivityResult<()> {
    let user = caller();
    
    if user == Principal::anonymous() {
        return Err(ActivityError::AnonymousNotAllowed);
    }

    ACTIVITIES.with(|activities| {
        let mut activities = activities.borrow_mut();
        match activities.get(&activity_id) {
            Some(activity) => {
                // Check if the user is the author of the comment
                if activity.0.user != user {
                    return Err(ActivityError::Unauthorized);
                }

                // Check if it's actually a comment
                if !matches!(activity.0.activity_type, ActivityType::Comment(_)) {
                    return Err(ActivityError::InvalidComment("Activity is not a comment".to_string()));
                }

                let arweave_id = activity.0.arweave_id.clone();

                // Remove from main activities storage
                activities.remove(&activity_id);

                // Remove from user activities index
                USER_ACTIVITIES.with(|user_activities| {
                    let mut user_activities = user_activities.borrow_mut();
                    if let Some(mut ids) = user_activities.get(&StorablePrincipal(user)) {
                        ids.0 .0.retain(|&id| id != activity_id);
                        user_activities.insert(
                            StorablePrincipal(user),
                            StorableActivityIdList(ActivityIdList(ids.0 .0)),
                        );
                    }
                });

                // Remove from arweave activities index
                ARWEAVE_ACTIVITIES.with(|arweave_activities| {
                    let mut arweave_activities = arweave_activities.borrow_mut();
                    if let Some(mut ids) = arweave_activities.get(&StorableString(arweave_id.clone())) {
                        ids.0 .0.retain(|&id| id != activity_id);
                        arweave_activities.insert(
                            StorableString(arweave_id),
                            StorableActivityIdList(ActivityIdList(ids.0 .0)),
                        );
                    }
                });

                Ok(())
            }
            None => Err(ActivityError::NotFound(activity_id)),
        }
    })
}

/// Update a comment (only by the comment author)
#[update]
pub fn update_comment(activity_id: u64, new_comment: String) -> ActivityResult<Activity> {
    let user = caller();
    
    if user == Principal::anonymous() {
        return Err(ActivityError::AnonymousNotAllowed);
    }

    let new_comment = new_comment.trim().to_string();
    if new_comment.is_empty() {
        return Err(ActivityError::InvalidComment("Comment cannot be empty".to_string()));
    }

    if new_comment.len() > 1000 {
        return Err(ActivityError::InvalidComment("Comment too long (max 1000 characters)".to_string()));
    }

    ACTIVITIES.with(|activities| {
        let mut activities = activities.borrow_mut();
        match activities.get(&activity_id) {
            Some(mut activity) => {
                // Check if the user is the author of the comment
                if activity.0.user != user {
                    return Err(ActivityError::Unauthorized);
                }

                // Check if it's actually a comment
                if !matches!(activity.0.activity_type, ActivityType::Comment(_)) {
                    return Err(ActivityError::InvalidComment("Activity is not a comment".to_string()));
                }

                // Update the comment
                activity.0.update(ActivityType::Comment(new_comment));
                activities.insert(activity_id, activity.clone());

                Ok(activity.0)
            }
            None => Err(ActivityError::NotFound(activity_id)),
        }
    })
}

/// Record an impression for an article (article appeared in feed)
/// Anyone can call, always increments counter
#[update]
pub fn record_impression(arweave_id: String) -> ActivityResult<u64> {
    if arweave_id.trim().is_empty() || arweave_id.len() != 43 {
        return Err(ActivityError::InvalidArweaveId);
    }

    IMPRESSIONS.with(|impressions| {
        let mut impressions = impressions.borrow_mut();
        let current = impressions.get(&StorableString(arweave_id.clone())).unwrap_or(0);
        let new_count = current + 1;
        impressions.insert(StorableString(arweave_id), new_count);
        Ok(new_count)
    })
}

/// Record a view for an article (user opened full article)
/// Anyone can call
/// - Authenticated users: deduplicated (only counted once per user)
/// - Anonymous users: always added
#[update]
pub fn record_view(arweave_id: String) -> ActivityResult<u64> {
    let caller = caller();

    if arweave_id.trim().is_empty() || arweave_id.len() != 43 {
        return Err(ActivityError::InvalidArweaveId);
    }

    VIEWS.with(|views| {
        let mut views = views.borrow_mut();
        let mut viewers = match views.get(&StorableString(arweave_id.clone())) {
            Some(list) => list.0.0,
            None => Vec::new(),
        };

        if caller == Principal::anonymous() {
            // Anonymous: always add None
            viewers.push(None);
        } else {
            // Authenticated: check if already viewed
            let already_viewed = viewers.iter().any(|v| match v {
                Some(p) => *p == caller,
                None => false,
            });

            if !already_viewed {
                viewers.push(Some(caller));
            }
        }

        let count = viewers.len() as u64;
        views.insert(
            StorableString(arweave_id),
            StorableViewersList(ViewersList(viewers)),
        );
        Ok(count)
    })
}