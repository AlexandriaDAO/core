use candid::Principal;
use ic_cdk::api::caller;
use ic_cdk_macros::query;

use crate::errors::general::GeneralError;
use crate::store::{USERS, USERNAMES};
use crate::models::user::{User, UsernameAvailabilityResponse, UserPrincipalInfo};
use crate::validations::user::validate_username;

#[query]
pub fn whoami() -> Principal {
    caller()
}

#[query]
pub fn get_user(principal: Principal) -> Result<User, String> {
    if principal == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string())
    }
    USERS.with(|users| {
        users.borrow()
            .get(&principal)
            .ok_or_else(|| GeneralError::NotFound("User".to_string()).to_string())
    })
}

#[query]
pub fn get_current_user() -> Result<User, String> {
    get_user(caller())
}

#[query]
pub fn check_username_availability(username: String) -> Result<UsernameAvailabilityResponse, String> {
    let username = username.trim().to_lowercase();

    if let Err(error) = validate_username(&username) {
        return Ok(UsernameAvailabilityResponse {
            username: username.clone(),
            available: false,
            message: error.to_string(),
        });
    }

    USERNAMES.with(|usernames| {
        let available = !usernames.borrow().contains_key(&username);
        let message = if available {
            "Username is available".to_string()
        } else {
            "Username is already taken".to_string()
        };

        Ok(UsernameAvailabilityResponse {
            username,
            available,
            message,
        })
    })
}

#[query]
pub fn get_all_users() -> Vec<UserPrincipalInfo> {
    USERS.with(|users| {
        users.borrow()
            .iter()
            .map(|(principal, user)| UserPrincipalInfo {
                principal,
                username: user.username.clone(),
            })
            .collect()
    })
}