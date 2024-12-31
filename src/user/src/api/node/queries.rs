use ic_cdk::api::caller;
use ic_cdk_macros::query;
use candid::Principal;

use crate::errors::general::GeneralError;
use crate::store::{NODES, USER_NODES};
use crate::models::node::Node;

/// Retrieves multiple nodes by their ids
/// Returns a vector of nodes, skipping any IDs that don't exist
#[query]
pub fn get_nodes(ids: Vec<u64>) -> Result<Vec<Node>, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    if ids.is_empty() {
        return Err(GeneralError::InvalidInput("No node IDs provided".to_string()).to_string());
    }

    Ok(NODES.with(|nodes| {
        let nodes = nodes.borrow();
        ids.iter()
            .filter_map(|id| nodes.get(id).map(|n| n.clone()))
            .collect()
    }))
}

/// Retrieves multiple nodes by their ids
/// Returns error if any of the requested nodes don't exist
#[query]
pub fn get_nodes_strict(ids: Vec<u64>) -> Result<Vec<Node>, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    if ids.is_empty() {
        return Err(GeneralError::InvalidInput("No node IDs provided".to_string()).to_string());
    }

    NODES.with(|nodes| {
        let nodes = nodes.borrow();
        
        // Check if all IDs exist first
        if ids.iter().any(|id| !nodes.contains_key(id)) {
            return Err(GeneralError::NotFound("One or more nodes not found".to_string()).to_string());
        }

        // Get all nodes (we know they exist)
        Ok(ids.iter()
            .map(|id| nodes.get(id).unwrap().clone())
            .collect())
    })
}

#[query]
pub fn get_user_nodes(user: Principal) -> Vec<Node> {
    NODES.with(|nodes| {
        let nodes = nodes.borrow();
        USER_NODES.with(|user_nodes| {
            user_nodes.borrow()
                .get(&user)
                .map(|list| {
                    list.0.iter()
                        .filter_map(|id| nodes.get(id).map(|n| n.clone()))
                        .collect()
                })
                .unwrap_or_default()
        })
    })
}

#[query]
pub fn get_my_nodes() -> Vec<Node> {
    get_user_nodes(caller())
}

/// Returns active nodes for a specific user or all active nodes if no user specified
#[query]
pub fn get_active_nodes(user: Option<Principal>) -> Vec<Node> {
    match user {
        Some(user) => {
            // Get specific user's active nodes
            NODES.with(|nodes| {
                let nodes = nodes.borrow();
                USER_NODES.with(|user_nodes| {
                    user_nodes.borrow()
                        .get(&user)
                        .map(|list| {
                            list.0.iter()
                                .filter_map(|id| nodes.get(id))
                                .filter(|node| node.active)
                                .map(|n| n.clone())
                                .collect()
                        })
                        .unwrap_or_default()
                })
            })
        },
        None => {
            // Get all active nodes
            NODES.with(|nodes| {
                nodes.borrow()
                    .iter()
                    .filter(|(_, node)| node.active)
                    .map(|(_, node)| node.clone())
                    .collect()
            })
        }
    }
}

#[query]
pub fn get_my_active_nodes() -> Vec<Node> {
    get_active_nodes(Some(caller()))
}