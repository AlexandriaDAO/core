use candid::{CandidType, Decode, Encode};
use ic_stable_structures::memory_manager::{MemoryId, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::cell::RefCell;

use crate::MEMORY_MANAGER;

type Memory = VirtualMemory<DefaultMemoryImpl>;

// Memory IDs starting from 30 to avoid conflicts (10=supply, 20-26=dialectica)
pub const EMBEDDINGS_MEM_ID: MemoryId = MemoryId::new(30);

// CLIP ViT-B-32 produces 512-dimensional vectors
pub const EMBEDDING_DIM: usize = 512;

// Max size: 43 bytes arweave_id key + 512 * 4 bytes floats + overhead
const MAX_EMBEDDING_SIZE: u32 = 4096;

/// Stored embedding for a single NFT image
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct StoredEmbedding {
    pub embedding: Vec<f32>,
}

impl Storable for StoredEmbedding {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound =
        ic_stable_structures::storable::Bound::Bounded {
            max_size: MAX_EMBEDDING_SIZE,
            is_fixed_size: false,
        };
}

/// Key wrapper for arweave IDs (max 43 chars)
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct ArweaveKey(pub String);

impl Storable for ArweaveKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Decode!(bytes.as_ref(), String).unwrap())
    }

    const BOUND: ic_stable_structures::storable::Bound =
        ic_stable_structures::storable::Bound::Bounded {
            max_size: 64,
            is_fixed_size: false,
        };
}

thread_local! {
    pub static EMBEDDINGS: RefCell<StableBTreeMap<ArweaveKey, StoredEmbedding, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(EMBEDDINGS_MEM_ID))
        )
    );
}

pub fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let mut dot: f32 = 0.0;
    let mut norm_a: f32 = 0.0;
    let mut norm_b: f32 = 0.0;

    for i in 0..a.len().min(b.len()) {
        dot += a[i] * b[i];
        norm_a += a[i] * a[i];
        norm_b += b[i] * b[i];
    }

    let denom = norm_a.sqrt() * norm_b.sqrt();
    if denom == 0.0 {
        0.0
    } else {
        dot / denom
    }
}
