use candid::Principal;
use ic_cdk;

use crate::storage::{
    FOLLOWED_USERS, FOLLOWED_TAGS, 
    PrincipalSet, NormalizedTagSet, 
    validate_tag_format, NormalizedTag
};
use crate::utils::normalize_tag;
// Assuming the guard function is in src/guards.rs
// If not, adjust the path accordingly.
// use crate::guards::not_anon;

// Placeholder for the guard if it doesn't exist yet.
// Remove this if you have a real guard function.
fn not_anon() -> Result<(), String> {
    if ic_cdk::caller() == Principal::anonymous() {
        Err("Anonymous callers are not allowed.".to_string())
    } else {
        Ok(())
    }
}

pub type UpdateResult = Result<(), String>;

#[ic_cdk::update(guard = "not_anon")]
pub fn follow_user(user_to_follow: Principal) -> UpdateResult {
    let caller = ic_cdk::caller();

    // Prevent following self
    if caller == user_to_follow {
        return Err("Cannot follow yourself.".to_string());
    }

    FOLLOWED_USERS.with(|followed| {
        let mut map = followed.borrow_mut();
        let mut followed_set = map.get(&caller).unwrap_or_default();
        
        // Add the user to the set
        if followed_set.0.insert(user_to_follow) {
             // If insert returned true, the set was modified
            map.insert(caller, followed_set);
        }
        Ok(())
    })
}

#[ic_cdk::update(guard = "not_anon")]
pub fn unfollow_user(user_to_unfollow: Principal) -> UpdateResult {
    let caller = ic_cdk::caller();

    FOLLOWED_USERS.with(|followed| {
        let mut map = followed.borrow_mut();
        if let Some(mut followed_set) = map.get(&caller) {
            // Remove the user from the set
            if followed_set.0.remove(&user_to_unfollow) {
                 // If remove returned true, the set was modified
                map.insert(caller, followed_set);
            }
        }
        // Always Ok, even if user wasn't followed (idempotent)
        Ok(())
    })
}

#[ic_cdk::update(guard = "not_anon")]
pub fn follow_tag(tag: String) -> UpdateResult {
    let caller = ic_cdk::caller();
    let normalized_tag = normalize_tag(&tag);

    // Validate the normalized tag format
    validate_tag_format(&normalized_tag)?;
    // Add any other tag-specific validations (e.g., existence in TAG_METADATA?)
    // For now, just validating format.

    FOLLOWED_TAGS.with(|followed| {
        let mut map = followed.borrow_mut();
        let mut followed_set = map.get(&caller).unwrap_or_default();
        
        // Add the tag to the set
        if followed_set.0.insert(normalized_tag) {
            map.insert(caller, followed_set);
        }
        Ok(())
    })
}

#[ic_cdk::update(guard = "not_anon")]
pub fn unfollow_tag(tag: String) -> UpdateResult {
    let caller = ic_cdk::caller();
    let normalized_tag = normalize_tag(&tag);

    // No need to validate format for removal

    FOLLOWED_TAGS.with(|followed| {
        let mut map = followed.borrow_mut();
        if let Some(mut followed_set) = map.get(&caller) {
            // Remove the tag from the set
            if followed_set.0.remove(&normalized_tag) {
                map.insert(caller, followed_set);
            }
        }
        // Always Ok, even if tag wasn't followed (idempotent)
        Ok(())
    })
} 