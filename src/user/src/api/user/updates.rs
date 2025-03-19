use ic_cdk::api::{caller, time};
use ic_cdk_macros::update;
use candid::Principal;

use crate::errors::general::GeneralError;
use crate::errors::user::UserError;
use crate::store::{USERS, USERNAMES};
use crate::models::user::{SignupRequest, UpdateUserRequest, User};
use crate::validations::user::{validate_username, validate_name, validate_avatar_url};

#[update]
pub fn signup(request: SignupRequest) -> Result<User, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    let username = request.username.trim().to_lowercase();

    if let Err(err) = validate_username(&username) {
        return Err(err.to_string());
    }

    // Check if user exists
    USERS.with(|users| {
        if users.borrow().contains_key(&caller) {
            return Err(GeneralError::AlreadyExists("User with this principal".to_string()).to_string());
        }
        Ok::<(), String>(())
    })?;

    // Check if username is taken
    USERNAMES.with(|usernames| {
        if usernames.borrow().contains_key(&username) {
            return Err(UserError::UsernameTaken.to_string());
        }
        Ok::<(), String>(())
    })?;

    let user = User::new(caller, username.clone());

    // Insert user data
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        users.insert(caller, user.clone());
        Ok::<(), String>(())
    })?;

    USERNAMES.with(|usernames| {
        let mut usernames = usernames.borrow_mut();
        usernames.insert(username.clone(), caller);
        Ok::<(), String>(())
    })?;

    Ok(user)
}

#[update]
pub fn update_profile(request: UpdateUserRequest) -> Result<User, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let mut user = users.get(&caller)
            .map(|user| user.clone())
            .ok_or_else(|| GeneralError::NotFound("User".to_string()).to_string())?;

        // Update username if other than current username
        let new_username = request.username.trim().to_lowercase();
        if new_username != user.username {
            // Validate the new username
            if let Err(err) = validate_username(&new_username) {
                return Err(err.to_string());
            }
            
            // Check if username is taken
            let username_available = USERNAMES.with(|usernames| {
                let usernames = usernames.borrow();
                !usernames.contains_key(&new_username)
            });
            
            if !username_available {
                return Err(UserError::UsernameTaken.to_string());
            }
            
            // Update USERNAMES mapping
            let old_username = user.username.clone();
            USERNAMES.with(|usernames| {
                let mut usernames = usernames.borrow_mut();
                usernames.remove(&old_username);
                usernames.insert(new_username.clone(), caller);
            });
            
            // Update the user's username
            user.username = new_username;
        }

        // Update name if provided
        if let Some(name) = request.name {
            let name = name.trim();
            if let Err(err) = validate_name(name) {
                return Err(err.to_string());
            }
            user.name = name.to_string();
        }

        // Update avatar if provided
        if let Some(avatar) = request.avatar {
            let avatar = avatar.trim();
            if let Err(err) = validate_avatar_url(avatar) {
                return Err(err.to_string());
            }
            user.avatar = avatar.to_string();
        }

        user.updated_at = time();
        users.insert(caller, user.clone());
        Ok(user)
    })
}

#[update]
pub fn upgrade_to_librarian() -> Result<User, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let mut user = users.get(&caller)
            .map(|user| user.clone())
            .ok_or_else(|| GeneralError::NotFound("User".to_string()).to_string())?;

        user.librarian = true;
        user.updated_at = time();
        users.insert(caller, user.clone());
        
        Ok(user)
    })
}

// Optional: Helper function for future use
// fn is_authorized(principal: Principal) -> bool {
//     // Add authorization logic here
//     false
// }