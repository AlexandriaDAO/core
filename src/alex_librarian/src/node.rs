use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::caller;
use ic_cdk::{query, update};
use std::cell::RefCell;
use std::convert::TryFrom;


// Helper function to determine if the caller is anonymous
fn is_anonymous(caller: Principal) -> bool {
    caller == Principal::anonymous()
}

#[derive(Clone, Copy, Debug, CandidType, Deserialize)]
pub enum NodeStatus {
    InActive = 0,
    Active = 1,
}

impl TryFrom<u8> for NodeStatus {
    type Error = String;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(NodeStatus::InActive),
            1 => Ok(NodeStatus::Active),
            _ => Err("Invalid node status".to_string()),
        }
    }
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Node {
    pub id: String,  // Unique identifier for the node
    pub owner: String,  // Principal to which this node belongs

    pub pvt_key: String,
    pub status: NodeStatus,
}

thread_local! {
    static NODES: RefCell<Vec<Node>> = RefCell::new(Vec::new());
    static ID_COUNTER: RefCell<u64> = RefCell::new(0);  // Counter for generating unique IDs
}

// Function to add a new node
#[update]
pub fn add_node(owner: String, pvt_key: String, status: Option<u8>) -> Node {

    // Step 1: Setup status for node
    let node_status = match status {
        Some(value) => NodeStatus::try_from(value).unwrap_or(NodeStatus::Active),
        None => NodeStatus::Active,
    };

    // Step 2: Fetch new id for the new node
    let new_id = ID_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        *counter += 1;
        counter.to_string()
    });

    // Step 3: Create new Node
    let new_node = Node {
        id: new_id.clone(),  // Assign the new unique ID
        owner,
        pvt_key,
        status: node_status,
    };

    // Step 4: Push to storage
    NODES.with(|nodes| {
        nodes.borrow_mut().push(new_node.clone());
    });

    new_node
}


// Function to add a new node
#[update]
pub fn add_my_node(pvt_key: String, status: Option<u8>) -> Result<Node, String> {

    // Step 1: Make sure its not an anonymous user trying to add node
    let caller_principal = caller();
    if is_anonymous(caller_principal) {
        return Err("Anonymous users are not allowed to update node status.".to_string());
    }

    // Step 2: Basic field validations
    if pvt_key.trim().is_empty() {
        return Err("Private key is required.".to_string());
    }

    // Step 3: Setup status for node
    let node_status = match status {
        Some(value) => NodeStatus::try_from(value).unwrap_or(NodeStatus::Active),
        None => NodeStatus::Active,
    };


    // Step 4: Fetch new id for the new node
    let new_id = ID_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        *counter += 1;
        counter.to_string()
    });

    // Step 5: Create new Node
    let new_node = Node {
        id: new_id.clone(),  // Assign the new unique ID
        owner: caller_principal.to_text(),
        pvt_key,
        status: node_status,
    };

    // Step 6: Push to storage
    NODES.with(|nodes| {
        nodes.borrow_mut().push(new_node.clone());
    });

    Ok(new_node)
}



#[update]
pub fn update_node_status(node_id: String, new_status: u8) -> Result<Node, String> {


    // Step 1: Check if its a valid status
    let node_status = NodeStatus::try_from(new_status).map_err(|_| "Invalid status code provided.".to_string())?;

    // Step 2: Make sure its not an anonymous user trying to edit node
    let caller_principal = caller();
    if is_anonymous(caller_principal) {
        return Err("Anonymous users are not allowed to update node status.".to_string());
    }

    // Step 3: Find the node by ID and check authorization
    NODES.with(|nodes| {
        let mut nodes = nodes.borrow_mut();

        if let Some(node) = nodes.iter_mut().find(|e| e.id == node_id) {
            // Step 4: Check if the caller is the owner of the node
            if node.owner != caller_principal.to_text() {
                return Err("Unauthorized access: You do not own this node.".to_string());
            }

            // Step 5: Update the node's status
            node.status = node_status;
            Ok(node.clone()) // Return a clone of the updated node
        } else {
            Err("Node not found.".to_string())
        }
    })

}

// Function to delete a node by ID
#[update]
pub fn delete_node(node_id: String) -> bool {
    NODES.with(|nodes| {
        let mut nodes = nodes.borrow_mut();
        let initial_len = nodes.len();
        nodes.retain(|node| node.id != node_id);
        initial_len != nodes.len()
    })
}

// Function to retrieve all nodes
#[query]
pub fn get_nodes() -> Vec<Node> {
    NODES.with(|nodes| {
        nodes.borrow().clone()
    })
}

// Function to get nodes by a specific owner
#[query]
pub fn get_nodes_by_owner(owner: String) -> Vec<Node> {
    NODES.with(|nodes| {
        nodes.borrow()
            .iter()
            .filter(|node| node.owner == owner)
            .cloned()
            .collect()
    })
}

// Function to get a specific node by ID
#[query]
pub fn get_node_by_id(node_id: String) -> Option<Node> {
    NODES.with(|nodes| {
        nodes.borrow()
            .iter()
            .find(|node| node.id == node_id)
            .cloned()
    })
}

// Function to get nodes of the calling principal, or return None if the caller is anonymous
#[query]
pub fn get_my_nodes() -> Vec<Node> {
    let my_principal = caller();

    if is_anonymous(my_principal) {  // Check if the principal is anonymous
        Vec::new()
    } else {
        get_nodes_by_owner(my_principal.to_text())
    }
}

#[query]
pub fn get_nodes_not_owned_by(owner: String) -> Vec<Node> {
    NODES.with(|nodes| {
        nodes.borrow()
            .iter()
            .filter(|node| node.owner != owner)
            .cloned()
            .collect()
    })
}

#[query]
pub fn get_nodes_not_owned_by_me() -> Vec<Node> {
    let my_principal = caller();
    if is_anonymous(my_principal) {
        get_nodes()
    }else{
        NODES.with(|nodes| {
            nodes.borrow()
                .iter()
                .filter(|node| node.owner != my_principal.to_text())
                .cloned()
                .collect()
        })
    }
}
