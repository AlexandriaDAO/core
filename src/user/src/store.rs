use candid::{CandidType, Decode, Encode, Principal};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;
use serde::{Serialize, Deserialize};

use crate::models::user::User;
use crate::models::engine::Engine;
use crate::models::node::Node;
type Memory = VirtualMemory<DefaultMemoryImpl>;

// Memory IDs for different maps
const USERS_MEM_ID: MemoryId = MemoryId::new(0);
const USERNAMES_MEM_ID: MemoryId = MemoryId::new(1);
const ENGINES_MEM_ID: MemoryId = MemoryId::new(2);
const ENGINE_COUNTER_MEM_ID: MemoryId = MemoryId::new(3);
const USER_ENGINES_MEM_ID: MemoryId = MemoryId::new(4);
const NODES_MEM_ID: MemoryId = MemoryId::new(5);
const NODE_COUNTER_MEM_ID: MemoryId = MemoryId::new(6);
const USER_NODES_MEM_ID: MemoryId = MemoryId::new(7);

const MAX_VALUE_SIZE: u32 = 65536; // 64KB should be plenty for our structures

// Add this near the top with other types
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UserIdList(pub Vec<u64>);

#[derive(Debug, Clone)]
pub struct StorableString(pub String);

impl Storable for StorableString {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Decode!(bytes.as_ref(), String).unwrap())
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

#[derive(Debug, Clone)]
pub struct StorablePrincipal(pub Principal);

impl Storable for StorablePrincipal {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Decode!(bytes.as_ref(), Principal).unwrap())
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 29,
        is_fixed_size: false,
    };
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    pub static USERS: RefCell<StableBTreeMap<Principal, User, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(USERS_MEM_ID)))
    );

    pub static USERNAMES: RefCell<StableBTreeMap<String, Principal, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(USERNAMES_MEM_ID)))
    );

    pub static ENGINES: RefCell<StableBTreeMap<u64, Engine, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(ENGINES_MEM_ID)))
    );

    pub static ENGINE_COUNTER: RefCell<StableBTreeMap<(), u64, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(ENGINE_COUNTER_MEM_ID)))
    );

    pub static USER_ENGINES: RefCell<StableBTreeMap<Principal, UserIdList, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(USER_ENGINES_MEM_ID)))
    );

    pub static NODES: RefCell<StableBTreeMap<u64, Node, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(NODES_MEM_ID)))
    );

    pub static NODE_COUNTER: RefCell<StableBTreeMap<(), u64, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(NODE_COUNTER_MEM_ID)))
    );

    pub static USER_NODES: RefCell<StableBTreeMap<Principal, UserIdList, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(USER_NODES_MEM_ID)))
    );
}

// Implement Storable for our types
impl Storable for User {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

impl Storable for Engine {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

impl Storable for Node {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

impl Storable for UserIdList {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}


//
// Counter Management
//

/// Initialize counters for engines and nodes
pub fn init_counters() {
    ENGINE_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        let _ = counter.insert((), 0);
    });

    NODE_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        let _ = counter.insert((), 0);
    });
}

/// Get and increment the engine counter, returning the current value
pub fn get_and_increment_engine_counter() -> u64 {
    ENGINE_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        let current = counter.get(&()).unwrap_or(0);
        let next = current + 1;
        let _ = counter.insert((), next);
        current
    })
}

/// Get and increment the node counter, returning the current value
pub fn get_and_increment_node_counter() -> u64 {
    NODE_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        let current = counter.get(&()).unwrap_or(0);
        let next = current + 1;
        let _ = counter.insert((), next);
        current
    })
}

// Add a debug function to check counter state
pub fn debug_counter_state() -> (Option<u64>, Option<u64>) {
    let engine_count = ENGINE_COUNTER.with(|counter| counter.borrow().get(&()));
    let node_count = NODE_COUNTER.with(|counter| counter.borrow().get(&()));
    (engine_count, node_count)
}

//
// User Engine Management
//

/// Get all engine IDs associated with a user
pub fn get_user_engine_ids(principal: &Principal) -> Vec<u64> {
    USER_ENGINES.with(|user_engines| {
        user_engines.borrow()
            .get(principal)
            .map(|list| list.0)
            .unwrap_or_default()
    })
}

/// Associate an engine ID with a user
pub fn add_engine_to_user(principal: &Principal, engine_id: u64) {
    USER_ENGINES.with(|user_engines| {
        let mut user_engines = user_engines.borrow_mut();
        let mut ids = user_engines
            .get(principal)
            .map(|list| list.0)
            .unwrap_or_default();
        ids.push(engine_id);
        user_engines.insert(*principal, UserIdList(ids));
    });
}

//
// User Node Management
//

/// Get all node IDs associated with a user
pub fn get_user_node_ids(principal: &Principal) -> Vec<u64> {
    USER_NODES.with(|user_nodes| {
        user_nodes.borrow()
            .get(principal)
            .map(|list| list.0)
            .unwrap_or_default()
    })
}

/// Associate a node ID with a user
pub fn add_node_to_user(principal: &Principal, node_id: u64) {
    USER_NODES.with(|user_nodes| {
        let mut user_nodes = user_nodes.borrow_mut();
        let mut ids = user_nodes
            .get(principal)
            .map(|list| list.0)
            .unwrap_or_default();
        ids.push(node_id);
        user_nodes.insert(*principal, UserIdList(ids));
    });
}