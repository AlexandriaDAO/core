use candid::{CandidType, Principal};
use ic_cdk::{caller, update};
use serde::Deserialize;

use super::store::{ArweaveKey, StoredEmbedding, EMBEDDING_DIM, EMBEDDINGS};

/// Single embedding entry for batch storage
#[derive(CandidType, Deserialize, Clone)]
pub struct EmbeddingEntry {
    pub arweave_id: String,
    pub embedding: Vec<f32>,
}

/// Result of a store operation
#[derive(CandidType)]
pub struct StoreResult {
    pub stored: u64,
    pub errors: Vec<String>,
}

fn is_controller() -> Result<(), String> {
    // ic_cdk::api::is_controller checks if caller is a canister controller
    if ic_cdk::api::is_controller(&caller()) {
        Ok(())
    } else {
        Err("Only controllers can call this method".to_string())
    }
}

/// Store embeddings for NFT images. Controller only.
#[update(guard = "is_controller")]
fn store_embeddings(entries: Vec<EmbeddingEntry>) -> StoreResult {
    let mut stored: u64 = 0;
    let mut errors: Vec<String> = Vec::new();

    for entry in entries {
        if entry.embedding.len() != EMBEDDING_DIM {
            errors.push(format!(
                "{}: expected {} dimensions, got {}",
                entry.arweave_id,
                EMBEDDING_DIM,
                entry.embedding.len()
            ));
            continue;
        }

        if entry.arweave_id.is_empty() || entry.arweave_id.len() > 43 {
            errors.push(format!("{}: invalid arweave_id length", entry.arweave_id));
            continue;
        }

        EMBEDDINGS.with(|emb| {
            emb.borrow_mut().insert(
                ArweaveKey(entry.arweave_id),
                StoredEmbedding {
                    embedding: entry.embedding,
                },
            );
        });
        stored += 1;
    }

    StoreResult {
        stored,
        errors,
    }
}

/// Remove embeddings. Controller only.
#[update(guard = "is_controller")]
fn remove_embeddings(arweave_ids: Vec<String>) -> u64 {
    let mut removed: u64 = 0;
    EMBEDDINGS.with(|emb| {
        let mut map = emb.borrow_mut();
        for id in arweave_ids {
            if map.remove(&ArweaveKey(id)).is_some() {
                removed += 1;
            }
        }
    });
    removed
}

/// Clear all embeddings. Controller only.
#[update(guard = "is_controller")]
fn clear_embeddings() -> u64 {
    EMBEDDINGS.with(|emb| {
        let mut map = emb.borrow_mut();
        let count = map.len();
        let keys: Vec<ArweaveKey> = map.iter().map(|(k, _)| k.clone()).collect();
        for key in keys {
            map.remove(&key);
        }
        count
    })
}

/// Reset embeddings by reinitializing the BTreeMap. Use if data is corrupted. Controller only.
#[update(guard = "is_controller")]
fn reset_embeddings() -> String {
    use crate::MEMORY_MANAGER;
    use super::store::EMBEDDINGS_MEM_ID;

    EMBEDDINGS.with(|emb| {
        let old_count = emb.borrow().len();
        *emb.borrow_mut() = ic_stable_structures::StableBTreeMap::new(
            MEMORY_MANAGER.with(|m| m.borrow().get(EMBEDDINGS_MEM_ID))
        );
        let new_count = emb.borrow().len();
        format!("Reset done. Old count: {}, New count: {}", old_count, new_count)
    })
}
