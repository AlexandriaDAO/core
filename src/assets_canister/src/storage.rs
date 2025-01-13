use std::{cell::RefCell, collections::HashMap};

use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Asset {
    pub content_type: String,
    pub encoding: AssetEncoding,
    pub owner: Principal,
    pub created_at: u64,
    pub modified_at: u64,
}
#[derive(CandidType, Serialize, Deserialize, Clone)]
pub enum AssetEncoding {
    Raw(Vec<u8>),
    Chunked {
        chunks: Vec<Vec<u8>>,
        total_length: usize,
    },
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct StoreAssetArgs {
   pub  content_type: String,
   pub  content: Vec<u8>,
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct InitUploadArgs {
   pub content_type: String,
   pub total_chunks: u32,
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct ChunkUploadArgs {
   pub chunk_index: u32,
   pub content: Vec<u8>,
}

thread_local! {
   pub static STATE: RefCell<State> = RefCell::new(State::default());
}

struct State {
   pub assets: HashMap<u64, Asset>,
   pub temp_uploads: HashMap<Principal, TempUpload>,
   pub next_asset_id: u64,
}

pub struct TempUpload {
   pub content_type: String,
   pub chunks: Vec<Option<Vec<u8>>>,
   pub total_chunks: u32,
}

impl Default for State {
    fn default() -> Self {
        State {
            assets: HashMap::new(),
            temp_uploads: HashMap::new(),
            next_asset_id: 1,
        }
    }
}
