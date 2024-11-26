use ic_cdk::api::caller;
use ic_cdk_macros::query;
use candid::Principal;

use crate::errors::general::GeneralError;
use crate::store::STATE;
use crate::models::engine::Engine;

/// Retrieves multiple engines by their ids
/// Returns a vector of engines, skipping any IDs that don't exist
#[query]
pub fn get_engines(ids: Vec<u64>) -> Result<Vec<Engine>, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    if ids.is_empty() {
        return Err(GeneralError::InvalidInput("No engine IDs provided".to_string()).to_string());
    }

    STATE.with(|state| {
        let state = state.borrow();
        Ok(ids.iter()
            .filter_map(|id| state.engines.get(id))
            .cloned()
            .collect())
    })
}

/// Retrieves multiple engines by their ids
/// Returns error if any of the requested engines don't exist
#[query]
pub fn get_engines_strict(ids: Vec<u64>) -> Result<Vec<Engine>, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    if ids.is_empty() {
        return Err(GeneralError::InvalidInput("No engine IDs provided".to_string()).to_string());
    }

    STATE.with(|state| {
        let state = state.borrow();

        // Check if all IDs exist first
        if ids.iter().any(|id| !state.engines.contains_key(id)) {
            return Err(GeneralError::NotFound("One or more engines not found".to_string()).to_string());
        }

        // Get all engines (we know they exist)
        Ok(ids.iter()
            .map(|id| state.engines.get(id).unwrap().clone())
            .collect())
    })
}

#[query]
pub fn get_user_engines(user: Principal) -> Vec<Engine> {
    STATE.with(|state| {
        let state = state.borrow();
        state.user_engines
            .get(&user)
            .map(|engine_ids| {
                engine_ids.iter()
                    .filter_map(|id| state.engines.get(id))
                    .cloned()
                    .collect()
            })
            .unwrap_or_default()
    })
}

#[query]
pub fn get_my_engines() -> Vec<Engine> {
    get_user_engines(caller())
}

/// Returns active engines for a specific user or all active engines if no user specified
#[query]
pub fn get_active_engines(user: Option<Principal>) -> Vec<Engine> {
    STATE.with(|state| {
        let state = state.borrow();
        match user {
            // Get specific user's active engines using the index
            Some(user) => state.user_engines
                .get(&user)
                .map(|engine_ids| {
                    engine_ids.iter()
                        .filter_map(|id| state.engines.get(id))
                        .filter(|engine| engine.active)
                        .cloned()
                        .collect()
                })
                .unwrap_or_default(),

            // Get all active engines
            None => state.engines
                .values()
                .filter(|engine| engine.active)
                .cloned()
                .collect()
        }
    })
}

#[query]
pub fn get_my_active_engines() -> Vec<Engine> {
    get_active_engines(Some(caller()))
}