use ic_cdk::api::{caller, time};
use ic_cdk_macros::update;
use candid::Principal;

use crate::errors::general::GeneralError;
use crate::store::{NODES, USER_NODES, get_and_increment_node_counter, add_node_to_user};
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

    let node_id = get_and_increment_node_counter();
    let node = Node::new(node_id, request.key, request.active, caller);
    
    // Store the node
    NODES.with(|nodes| {
        nodes.borrow_mut().insert(node_id, node.clone());
    });

    // Add to user's nodes
    add_node_to_user(&caller, node_id);

    Ok(node)
}

/// Updates an existing node's status
#[update]
pub fn update_node_status(request: UpdateNodeStatusRequest) -> Result<Node, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    NODES.with(|nodes| {
        let mut nodes = nodes.borrow_mut();
        
        let node = nodes.get(&request.id)
            .ok_or_else(|| GeneralError::NotFound("Node".to_string()).to_string())?;

        if node.owner != caller {
            return Err(GeneralError::NotAuthorized.to_string());
        }

        let mut updated_node = node.clone();
        updated_node.active = request.active;
        updated_node.updated_at = time();

        nodes.insert(request.id, updated_node.clone()).unwrap();
        Ok(updated_node)
    })
}

/// Deletes a node owned by the caller
#[update]
pub fn delete_node(id: u64) -> Result<(), String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    // First check ownership and remove the node
    let node_owner = NODES.with(|nodes| {
        let mut nodes = nodes.borrow_mut();
        let node = nodes.get(&id)
            .ok_or_else(|| GeneralError::NotFound("Node".to_string()).to_string())?;

        if node.owner != caller {
            return Err(GeneralError::NotAuthorized.to_string());
        }

        nodes.remove(&id);
        Ok(node.owner.clone())
    })?;

    // Remove from user's nodes
    USER_NODES.with(|user_nodes| {
        let mut user_nodes = user_nodes.borrow_mut();
        if let Some(mut list) = user_nodes.remove(&node_owner) {
            list.0.retain(|&x| x != id);
            user_nodes.insert(node_owner, list);
        }
    });

    Ok(())
}