use candid::{CandidType, Principal};
use ic_cdk::api::time;
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Engine {
    pub id: u64,
    pub title: String,
    pub host: String,
    pub key: String,
    pub index: String,
    pub owner: Principal,
    pub active: bool,
    pub created_at: u64,
    pub updated_at: u64,
}

impl Engine {
    pub fn new(id: u64, title: String, host: String, key: String, index: String, owner: Principal, active: bool) -> Self {
        let now = time();
        Self {
            id,
            title,
            host,
            key,
            index,
            owner,
            active,
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CreateEngineRequest {
    pub title: String,
    pub host: String,
    pub key: String,
    pub index: String,
    pub active: bool,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UpdateEngineStatusRequest {
    pub id: u64,
    pub active: bool,
}