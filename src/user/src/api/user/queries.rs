use candid::Principal;
use ic_cdk::api::caller;
use ic_cdk_macros::query;

use crate::errors::general::GeneralError;
use crate::store::STATE;
use crate::models::user::{User, UsernameAvailabilityResponse};
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
    STATE.with(|state| {
        state
            .borrow()
            .users
            .get(&principal)
            .cloned()
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

    // First validate the username format
    if let Err(error) = validate_username(&username) {
        return Ok(UsernameAvailabilityResponse {
            username: username.clone(),
            available: false,
            message: error.to_string(),
        });
    }

    // Then check availability
    STATE.with(|state| {
        let available = !state.borrow().usernames.contains_key(&username);
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