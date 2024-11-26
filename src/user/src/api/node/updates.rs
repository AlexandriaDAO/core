use std::collections::HashSet;

use ic_cdk::api::{caller, time};
use ic_cdk_macros::update;
use candid::Principal;

use crate::errors::general::GeneralError;
use crate::store::STATE;
use crate::models::node::{Node, CreateNodeRequest, UpdateNodeStatusRequest};
use crate::validations::node::validate_key;

/// Creates a new node for the authenticated user
#[update]
pub fn create_node(request: CreateNodeRequest) -> Result<Node, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    // Validate private key
    if let Err(err) = validate_key(&request.key) {
        return Err(err.to_string());
    }

    STATE.with(|state| {
        let mut state = state.borrow_mut();

        let node_id = state.node_counter;
        state.node_counter += 1;

        let node = Node::new(node_id, request.key, caller);
        state.nodes.insert(node_id, node.clone());

        // Update the user index
        state.user_nodes
            .entry(caller)
            .or_insert_with(HashSet::new)
            .insert(node_id);

        Ok(node)
    })
}

/// Updates an existing node's status
#[update]
pub fn update_node_status(request: UpdateNodeStatusRequest) -> Result<Node, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    STATE.with(|state| {
        let mut state = state.borrow_mut();

        let node = state.nodes.get_mut(&request.id)
            .ok_or_else(|| GeneralError::NotFound("Node".to_string()).to_string())?;

        if node.owner != caller {
            return Err(GeneralError::NotAuthorized.to_string());
        }

        node.active = request.active;
        node.updated_at = time();

        Ok(node.clone())
    })
}

/// Deletes a node owned by the caller
#[update]
pub fn delete_node(id: u64) -> Result<(), String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    STATE.with(|state| {
        let mut state = state.borrow_mut();

        let node = state.nodes.get(&id)
            .ok_or_else(|| GeneralError::NotFound("Node".to_string()).to_string())?;

        if node.owner != caller {
            return Err(GeneralError::NotAuthorized.to_string());
        }

        // Remove from nodes
        state.nodes.remove(&id);

        // Remove from user index
        if let Some(user_nodes) = state.user_nodes.get_mut(&caller) {
            user_nodes.remove(&id);
        }

        Ok(())
    })
}