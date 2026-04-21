use candid::CandidType;
use ic_cdk::query;
use serde::Serialize;

use super::store::{cosine_similarity, ArweaveKey, EMBEDDINGS};

/// A single similarity result
#[derive(CandidType, Serialize, Clone)]
pub struct SimilarityResult {
    pub arweave_id: String,
    pub score: f32,
}

/// Search for NFTs with similar images to the given arweave_id
#[query]
fn search_similar(arweave_id: String, top_k: u32) -> Result<Vec<SimilarityResult>, String> {
    let top_k = top_k.min(100) as usize;

    let query_embedding = EMBEDDINGS.with(|emb| {
        emb.borrow()
            .get(&ArweaveKey(arweave_id.clone()))
            .map(|e| e.embedding.clone())
    });

    let query_vec = query_embedding.ok_or_else(|| format!("{} not indexed", arweave_id))?;

    let mut results: Vec<SimilarityResult> = EMBEDDINGS.with(|emb| {
        let map = emb.borrow();
        let mut scored = Vec::new();

        for (key, stored) in map.iter() {
            if key.0 == arweave_id {
                continue;
            }
            let score = cosine_similarity(&query_vec, &stored.embedding);
            scored.push(SimilarityResult {
                arweave_id: key.0.clone(),
                score,
            });
        }
        scored
    });

    results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
    results.truncate(top_k);
    Ok(results)
}

/// Search by a pre-computed embedding vector (for text-to-image search)
#[query]
fn search_by_vector(embedding: Vec<f32>, top_k: u32) -> Result<Vec<SimilarityResult>, String> {
    let top_k = top_k.min(100) as usize;

    if embedding.len() != super::store::EMBEDDING_DIM {
        return Err(format!(
            "Expected {} dimensions, got {}",
            super::store::EMBEDDING_DIM,
            embedding.len()
        ));
    }

    let mut results: Vec<SimilarityResult> = EMBEDDINGS.with(|emb| {
        let map = emb.borrow();
        let mut scored = Vec::new();

        for (key, stored) in map.iter() {
            let score = cosine_similarity(&embedding, &stored.embedding);
            scored.push(SimilarityResult {
                arweave_id: key.0.clone(),
                score,
            });
        }
        scored
    });

    results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
    results.truncate(top_k);
    Ok(results)
}

/// Get total number of indexed embeddings
#[query]
fn get_embedding_count() -> u64 {
    EMBEDDINGS.with(|emb| emb.borrow().len())
}

/// Check if an arweave_id has been indexed
#[query]
fn is_indexed(arweave_id: String) -> bool {
    EMBEDDINGS.with(|emb| emb.borrow().contains_key(&ArweaveKey(arweave_id)))
}

/// Get all indexed arweave IDs
#[query]
fn get_indexed_ids() -> Vec<String> {
    EMBEDDINGS.with(|emb| {
        emb.borrow().iter().map(|(key, _)| key.0.clone()).collect()
    })
}
