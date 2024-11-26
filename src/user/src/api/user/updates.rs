use ic_cdk::api::{caller, time};
use ic_cdk_macros::update;
use candid::Principal;

use crate::errors::general::GeneralError;
use crate::errors::user::UserError;
use crate::store::STATE;
use crate::models::user::{SignupRequest, UpdateUserRequest, User};
use crate::validations::user::{validate_username, validate_name, validate_avatar_url};

#[update]
pub fn signup(request: SignupRequest) -> Result<User, String> {
    let caller = caller();

    // Check for anonymous user
    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    let username = request.username.trim().to_lowercase();

    // Validate username
    if let Err(err) = validate_username(&username) {
        return Err(err.to_string());
    }

    STATE.with(|state| {
        let mut state = state.borrow_mut();

        // Check if user already exists
        if state.users.contains_key(&caller) {
            return Err(GeneralError::AlreadyExists("User with this principal".to_string()).to_string());
        }

        // Check if username is taken
        if state.usernames.contains_key(&username) {
            return Err(UserError::UsernameTaken.to_string());
        }

        let user = User::new(caller, username.clone());

        state.usernames.insert(username, caller);
        state.users.insert(caller, user.clone());

        Ok(user)
    })
}

#[update]
pub fn update_profile(request: UpdateUserRequest) -> Result<User, String> {
    let caller = caller();

    // Check for anonymous user
    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    STATE.with(|state| {
        let mut state = state.borrow_mut();

        let user = state.users.get_mut(&caller)
            .ok_or_else(|| GeneralError::NotFound("User".to_string()).to_string())?;

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
        Ok(user.clone())
    })
}

#[update]
pub fn upgrade_to_librarian() -> Result<User, String> {
    let caller = caller();

    // Check for anonymous user
    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    STATE.with(|state| {
        let mut state = state.borrow_mut();

        let user = state.users.get_mut(&caller)
            .ok_or_else(|| GeneralError::NotFound("User".to_string()).to_string())?;

        // You might want to add authorization check here
        // if !is_authorized(caller) {
        //     return Err(UserError::NotAuthorized.to_string());
        // }

        user.librarian = true;
        user.updated_at = time();

        Ok(user.clone())
    })
}

// Optional: Helper function for future use
// fn is_authorized(principal: Principal) -> bool {
//     // Add authorization logic here
//     false
// }