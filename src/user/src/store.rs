use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use candid::Principal;
use crate::models::user::User;
use crate::{Engine, Node};

pub struct State {
    pub users: HashMap<Principal, User>,
    pub usernames: HashMap<String, Principal>,
    pub engines: HashMap<u64, Engine>,  // engine_id -> Engine
    pub engine_counter: u64,
    pub user_engines: HashMap<Principal, HashSet<u64>>,  // owner -> set of engine_ids

    pub nodes: HashMap<u64, Node>,  // node_id -> Node
    pub node_counter: u64,
    pub user_nodes: HashMap<Principal, HashSet<u64>>,  // owner -> set of node_ids
}

impl Default for State {
    fn default() -> Self {
        State {
            users: HashMap::new(),
            usernames: HashMap::new(),
            engines: HashMap::new(),
            engine_counter: 0,
            user_engines: HashMap::new(),
            nodes: HashMap::new(),
            node_counter: 0,
            user_nodes: HashMap::new(),
        }
    }
}

thread_local! {
    pub static STATE: RefCell<State> = RefCell::new(State::default());
}