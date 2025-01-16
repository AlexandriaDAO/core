use candid::Nat;
use ic_cdk::{caller, update};

use crate::{utils::is_owner, Asset, AssetError, Tag, Transaction, ASSET_STORAGE, MAX_ASSET_SIZE, MAX_CHUNK_SIZE};

#[update]
pub async fn initialize_asset(
    token_id: Nat,
    content_type: String,
    total_size: usize,
    nft_token: String,
    owner: String,
    tags: Vec<Tag>,
) -> Result<String, AssetError> {
    if total_size > MAX_ASSET_SIZE {
        return Err(AssetError::AssetTooLarge);
    }

    let asset_id = token_id.to_string(); 
    // check ownership
    match is_owner(caller(), token_id.clone()).await {
        Ok(true) => {}
        Ok(false) => return Err(AssetError::Unauthorized),
        Err(_) => return Err(AssetError::SomethingWentWrong),
    };

    let timestamp = ic_cdk::api::time();

    let transaction = Transaction {
        owner,
        size: total_size,
        date: timestamp,
        tags,
    };

    let asset = Asset {
        content_type,
        chunks: Vec::new(),
        total_size,
        owner: caller(),
        nft_token: nft_token.clone(),
        created_at: timestamp,
        updated_at: timestamp,
        transaction,
    };

    // Store the asset in the storage
    ASSET_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        if storage.get(&asset_id).is_some() {
            return Err(AssetError::AlreadyExists); // Prevent duplicate asset IDs
        }
        storage.insert(asset_id.clone(), asset);
        Ok(())
    })?;

    Ok(asset_id)
}

#[update]
pub async fn store_chunk(token_id: Nat, chunk_index: usize, chunk: Vec<u8>) -> Result<(), AssetError> {
    if chunk.len() > MAX_CHUNK_SIZE {
        return Err(AssetError::ChunkTooLarge);
    }
    let asset_id = token_id.to_string();
    match is_owner(caller(), token_id.clone()).await {
        Ok(true) => {}
        Ok(false) => return Err(AssetError::Unauthorized),
        Err(_) => return Err(AssetError::SomethingWentWrong),
    };
    ASSET_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        let mut asset = storage.get(&asset_id).ok_or(AssetError::NotFound)?;

        if asset.owner != caller() {
            return Err(AssetError::Unauthorized);
        }

        while asset.chunks.len() <= chunk_index {
            asset.chunks.push(Vec::new());
        }

        asset.chunks[chunk_index] = chunk;
        asset.updated_at = ic_cdk::api::time();
        storage.insert(asset_id, asset);
        Ok(())
    })
}

#[update]
fn delete_asset(token_id: Nat) -> Result<(), AssetError> {
    let asset_id = token_id.to_string();

    ASSET_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        let asset = storage.get(&asset_id).ok_or(AssetError::NotFound)?;

        if asset.owner != caller() {
            return Err(AssetError::Unauthorized);
        }

        storage.remove(&asset_id);
        Ok(())
    })
}