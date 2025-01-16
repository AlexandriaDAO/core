use candid::{CandidType, Nat, Principal};
use ic_cdk::{caller, query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable};
use serde::Deserialize;
use std::cell::RefCell;

pub const MAX_CHUNK_SIZE: usize = 2 * 1024 * 1024; // 2MB
pub const MAX_ASSET_SIZE: usize = 20 * 1024 * 1024; // 20MB
pub const MAX_VALUE_SIZE: u32 = 20 * 1024 * 1024; // 20MB

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Asset {
    pub content_type: String,
    pub chunks: Vec<Vec<u8>>,
    pub total_size: usize,
    pub owner: Principal,
    pub nft_token: String,
    pub created_at: u64,
    pub updated_at: u64,
    pub transaction: Transaction,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Transaction {
    pub owner: String,  // Arweave
    pub size: usize,    // Size of the asset (bytes)
    pub date: u64,      // Transaction date (Unix timestamp)
    pub tags: Vec<Tag>, // List of tags
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Tag {
    pub name: String,
    pub value: String,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct AssetMetadata {
    pub content_type: String,
    pub total_size: usize,
    pub chunk_count: usize,
    pub owner: Principal,
    pub nft_token: String,
    pub transaction: Transaction,
    pub created_at: u64,
}

#[derive(CandidType, Debug)]
pub enum AssetError {
    NotFound,
    AlreadyExists,
    Unauthorized,
    ChunkTooLarge,
    AssetTooLarge,
    SomethingWentWrong,
    InvalidChunkIndex,
}

pub const ASSET_STORAGE_MEM_ID: MemoryId = MemoryId::new(0);

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

  pub  static ASSET_STORAGE: RefCell<StableBTreeMap<String, Asset, VirtualMemory<DefaultMemoryImpl>>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(ASSET_STORAGE_MEM_ID))
        )
    );
}

impl Storable for Asset {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        let bytes = candid::encode_one(self).unwrap();
        std::borrow::Cow::Owned(bytes)
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}
