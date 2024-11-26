use std::collections::HashSet;

use ic_cdk::api::{caller, time};
use ic_cdk_macros::update;
use candid::Principal;

use crate::errors::general::GeneralError;
use crate::store::STATE;
use crate::models::engine::{Engine, CreateEngineRequest, UpdateEngineStatusRequest};
use crate::validations::engine::validate_create_engine_request;

/// Creates a new engine for the authenticated user
#[update]
pub fn create_engine(request: CreateEngineRequest) -> Result<Engine, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    // Validate all request fields
    if let Err(err) = validate_create_engine_request(&request) {
        return Err(err.to_string());
    }

    STATE.with(|state| {
        let mut state = state.borrow_mut();

        let engine_id = state.engine_counter;
        state.engine_counter += 1;

        let engine = Engine::new(
            engine_id,
            request.title,
            request.host,
            request.key,
            request.index,
            caller,
            request.active
        );
        state.engines.insert(engine_id, engine.clone());

        // Update the user index
        state.user_engines
            .entry(caller)
            .or_insert_with(HashSet::new)
            .insert(engine_id);

        Ok(engine)
    })
}

/// Updates an existing engine's status
#[update]
pub fn update_engine_status(request: UpdateEngineStatusRequest) -> Result<Engine, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    STATE.with(|state| {
        let mut state = state.borrow_mut();

        let engine = state.engines.get_mut(&request.id)
            .ok_or_else(|| GeneralError::NotFound("Engine".to_string()).to_string())?;

        if engine.owner != caller {
            return Err(GeneralError::NotAuthorized.to_string());
        }

        engine.active = request.active;
        engine.updated_at = time();

        Ok(engine.clone())
    })
}

/// Deletes a engine owned by the caller
#[update]
pub fn delete_engine(id: u64) -> Result<(), String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    STATE.with(|state| {
        let mut state = state.borrow_mut();

        let engine = state.engines.get(&id)
            .ok_or_else(|| GeneralError::NotFound("Engine".to_string()).to_string())?;

        if engine.owner != caller {
            return Err(GeneralError::NotAuthorized.to_string());
        }

        // Remove from engines
        state.engines.remove(&id);

        // Remove from user index
        if let Some(user_engines) = state.user_engines.get_mut(&caller) {
            user_engines.remove(&id);
        }

        Ok(())
    })
}