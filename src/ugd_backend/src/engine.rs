// ToDO. 
// The engine should not expose user principals, but store the hash as the id.
// Engine key needs to be encrypted. And maybe the host too.
// I'm not sure how, but it's not clear to me how to change existing engines, or choose their slot. We may also want to put a cap on those slots.
// Only the owner should be able to delete an engine.


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
pub enum EngineStatus {
    Draft = 0,
    Published = 1,
}

impl TryFrom<u8> for EngineStatus {
    type Error = String;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(EngineStatus::Draft),
            1 => Ok(EngineStatus::Published),
            _ => Err("Invalid engine status".to_string()),
        }
    }
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Engine {
    pub id: String,  // Unique identifier for the engine
    pub owner: String,  // Principal to which this engine belongs
    pub title: String,
    pub host: String,
    pub key: String,
    pub index: String,
    pub status: EngineStatus,
}

thread_local! {
    static ENGINES: RefCell<Vec<Engine>> = RefCell::new(Vec::new());
    static ID_COUNTER: RefCell<u64> = RefCell::new(0);  // Counter for generating unique IDs
}

// Function to add a new engine
#[update]
pub fn add_engine(owner: String, title: String, host: String, key: String, index: String, status: Option<u8>) -> Engine {

    // Step 1: Setup status for engine
    let engine_status = match status {
        Some(value) => EngineStatus::try_from(value).unwrap_or(EngineStatus::Draft),
        None => EngineStatus::Draft,
    };

    // Step 2: Fetch new id for the new engine
    let new_id = ID_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        *counter += 1;
        counter.to_string()
    });

    // Step 3: Create new Engine
    let new_engine = Engine {
        id: new_id.clone(),  // Assign the new unique ID
        owner,
        title,
        host,
        key,
        index,
        status: engine_status,
    };

    // Step 4: Push to storage
    ENGINES.with(|engines| {
        engines.borrow_mut().push(new_engine.clone());
    });

    new_engine
}


// Function to add a new engine
#[update]
pub fn add_my_engine(title: String, host: String, key: String, index: String, status: Option<u8>) -> Result<Engine, String> {

    // Step 1: Make sure its not an anonymous user trying to add engine
    let caller_principal = caller();
    if is_anonymous(caller_principal) {
        return Err("Anonymous users are not allowed to update engine status.".to_string());
    }

    // Step 2: Basic field validations
    if host.trim().is_empty() {
        return Err("Host is required.".to_string());
    }

    if key.trim().is_empty() {
        return Err("Key is required.".to_string());
    }

    if index.trim().is_empty() {
        return Err("Index is required.".to_string());
    }

    // Step 3: Setup status for engine
    let engine_status = match status {
        Some(value) => EngineStatus::try_from(value).unwrap_or(EngineStatus::Draft),
        None => EngineStatus::Draft,
    };


    // Step 4: Fetch new id for the new engine
    let new_id = ID_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        *counter += 1;
        counter.to_string()
    });

    // Step 5: Create new Engine
    let new_engine = Engine {
        id: new_id.clone(),  // Assign the new unique ID
        owner: caller_principal.to_text(),
        title,
        host,
        key,
        index,
        status: engine_status,
    };

    // Step 6: Push to storage
    ENGINES.with(|engines| {
        engines.borrow_mut().push(new_engine.clone());
    });

    Ok(new_engine)
}



#[update]
pub fn update_engine_status(engine_id: String, new_status: u8) -> Result<Engine, String> {


    // Step 1: Check if its a valid status
    let engine_status = EngineStatus::try_from(new_status).map_err(|_| "Invalid status code provided.".to_string())?;

    // Step 2: Make sure its not an anonymous user trying to edit engine
    let caller_principal = caller();
    if is_anonymous(caller_principal) {
        return Err("Anonymous users are not allowed to update engine status.".to_string());
    }

    // Step 3: Find the engine by ID and check authorization
    ENGINES.with(|engines| {
        let mut engines = engines.borrow_mut();

        if let Some(engine) = engines.iter_mut().find(|e| e.id == engine_id) {
            // Step 4: Check if the caller is the owner of the engine
            if engine.owner != caller_principal.to_text() {
                return Err("Unauthorized access: You do not own this engine.".to_string());
            }

            // Step 5: Update the engine's status
            engine.status = engine_status;
            Ok(engine.clone()) // Return a clone of the updated engine
        } else {
            Err("Engine not found.".to_string())
        }
    })

}

// Function to delete a engine by ID
#[update]
pub fn delete_engine(engine_id: String) -> bool {
    ENGINES.with(|engines| {
        let mut engines = engines.borrow_mut();
        let initial_len = engines.len();
        engines.retain(|engine| engine.id != engine_id);
        initial_len != engines.len()
    })
}

// Function to retrieve all engines
#[query]
pub fn get_engines() -> Vec<Engine> {
    ENGINES.with(|engines| {
        engines.borrow().clone()
    })
}

// Function to get engines by a specific owner
#[query]
pub fn get_engines_by_owner(owner: String) -> Vec<Engine> {
    ENGINES.with(|engines| {
        engines.borrow()
            .iter()
            .filter(|engine| engine.owner == owner)
            .cloned()
            .collect()
    })
}

// Function to get a specific engine by ID
#[query]
pub fn get_engine_by_id(engine_id: String) -> Option<Engine> {
    ENGINES.with(|engines| {
        engines.borrow()
            .iter()
            .find(|engine| engine.id == engine_id)
            .cloned()
    })
}

// Function to get engines of the calling principal, or return None if the caller is anonymous
#[query]
pub fn get_my_engines() -> Vec<Engine> {
    let my_principal = caller();

    if is_anonymous(my_principal) {  // Check if the principal is anonymous
        Vec::new()
    } else {
        get_engines_by_owner(my_principal.to_text())
    }
}

#[query]
pub fn get_engines_not_owned_by(owner: String) -> Vec<Engine> {
    ENGINES.with(|engines| {
        engines.borrow()
            .iter()
            .filter(|engine| engine.owner != owner)
            .cloned()
            .collect()
    })
}

#[query]
pub fn get_engines_not_owned_by_me() -> Vec<Engine> {
    let my_principal = caller();
    if is_anonymous(my_principal) {
        get_engines()
    }else{
        ENGINES.with(|engines| {
            engines.borrow()
                .iter()
                .filter(|engine| engine.owner != my_principal.to_text())
                .cloned()
                .collect()
        })
    }
}
