use candid::{CandidType, Principal};
use ic_cdk::api::time;
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Node {
    pub id: u64,
    pub key: String,
    pub owner: Principal,
    pub active: bool,
    pub created_at: u64,
    pub updated_at: u64,
}

impl Node {
    pub fn new(id: u64, key: String, owner: Principal) -> Self {
        let now = time();
        Self {
            id,
            key,
            owner,
            active: true,
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CreateNodeRequest {
    pub key: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UpdateNodeStatusRequest {
    pub id: u64,
    pub active: bool,
}