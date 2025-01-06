use ic_cdk::api::{caller, time};
use ic_cdk_macros::update;
use candid::Principal;

use crate::errors::general::GeneralError;
use crate::store::{ENGINES, USER_ENGINES, get_and_increment_engine_counter, add_engine_to_user};
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

    let engine_id = get_and_increment_engine_counter();
    let engine = Engine::new(
        engine_id,
        request.title,
        request.host,
        request.key,
        request.index,
        caller,
        request.active
    );
    
    // Store the engine
    ENGINES.with(|engines| {
        engines.borrow_mut().insert(engine_id, engine.clone());
    });

    // Add to user's engines
    add_engine_to_user(&caller, engine_id);

    Ok(engine)
}

/// Updates an existing engine's status
#[update]
pub fn update_engine_status(request: UpdateEngineStatusRequest) -> Result<Engine, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    ENGINES.with(|engines| {
        let mut engines = engines.borrow_mut();
        
        let engine = engines.get(&request.id)
            .ok_or_else(|| GeneralError::NotFound("Engine".to_string()).to_string())?;

        if engine.owner != caller {
            return Err(GeneralError::NotAuthorized.to_string());
        }

        let mut updated_engine = engine.clone();
        updated_engine.active = request.active;
        updated_engine.updated_at = time();

        engines.insert(request.id, updated_engine.clone()).unwrap();
        Ok(updated_engine)
    })
}

/// Deletes a engine owned by the caller
#[update]
pub fn delete_engine(id: u64) -> Result<(), String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    // First check ownership
    ENGINES.with(|engines| {
        let engines = engines.borrow();
        let engine = engines.get(&id)
            .ok_or_else(|| GeneralError::NotFound("Engine".to_string()).to_string())?;

        if engine.owner != caller {
            return Err(GeneralError::NotAuthorized.to_string());
        }
        Ok(())
    })?;

    // Then delete the engine
    ENGINES.with(|engines| {
        engines.borrow_mut().remove(&id);
    });

    // Remove from user's engines
    USER_ENGINES.with(|user_engines| {
        if let Some(mut list) = user_engines.borrow_mut().get(&caller).map(|list| list.clone()) {
            list.0.retain(|&x| x != id);
            user_engines.borrow_mut().insert(caller, list).unwrap();
        }
    });

    Ok(())
}