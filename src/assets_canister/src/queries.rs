use candid::Nat;
use ic_cdk::query;

use crate::{AssetError, AssetMetadata, ASSET_STORAGE};



#[query]
fn get_asset_metadata(token_id: Nat) -> Result<AssetMetadata, AssetError> {
    let asset_id = token_id.to_string();

    ASSET_STORAGE.with(|storage| {
        let storage = storage.borrow();
        let asset = storage.get(&asset_id).ok_or(AssetError::NotFound)?;

        Ok(AssetMetadata {
            content_type: asset.content_type.clone(),
            total_size: asset.total_size,
            chunk_count: asset.chunks.len(),
            owner: asset.owner,
            nft_token: asset.nft_token.clone(),
            created_at: asset.created_at,
            transaction: asset.transaction,
        })
    })
}

#[query]
fn get_chunk(token_id: Nat, chunk_index: usize) -> Result<Vec<u8>, AssetError> {
    let asset_id = token_id.to_string();

    ASSET_STORAGE.with(|storage| {
        let storage = storage.borrow();
        let asset = storage.get(&asset_id).ok_or(AssetError::NotFound)?;

        asset
            .chunks
            .get(chunk_index)
            .cloned()
            .ok_or(AssetError::InvalidChunkIndex)
    })
}

