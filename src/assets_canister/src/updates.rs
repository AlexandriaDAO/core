use candid::Principal;
use ic_cdk::{init, update};
use ic_certified_map::{AsHashTree, RbTree};

use crate::{Asset, AssetEncoding, ChunkUploadArgs, InitUploadArgs, StoreAssetArgs, TempUpload, ASSET_HASHES, STATE};
use sha2::Digest;

#[ic_cdk::init]
fn init() {
    let mock_asset = Asset {
        content_type: "image/png".to_string(),
        encoding: AssetEncoding::Raw(vec![1, 2, 3, 4]), // Example content
        owner: Principal::anonymous(),
        created_at: 0,
        modified_at: 0,
    };

    STATE.with(|state| {
        let mut state = state.borrow_mut();
        state.assets.insert(1, mock_asset); // Insert mock asset with ID 1
    });
}


#[update]
async fn store_asset(args: StoreAssetArgs) -> u64 {
    let caller = ic_cdk::caller();
    let asset_id = STATE.with(|state| {
        let mut state = state.borrow_mut();
        let asset_id = state.next_asset_id;
        state.next_asset_id += 1;

        let asset = Asset {
            content_type: args.content_type,
            encoding: AssetEncoding::Raw(args.content.clone()),
            owner: caller,
            created_at: ic_cdk::api::time(),
            modified_at: ic_cdk::api::time(),
        };

        state.assets.insert(asset_id, asset);
        asset_id
    });

    // Update certification for the newly added asset
    let asset_path = format!("/asset/{}", asset_id);
    ASSET_HASHES.with(|asset_hashes| {
        let mut asset_hashes = asset_hashes.borrow_mut();
        let hash = sha2::Sha256::digest(&args.content).into(); // Compute hash of asset content
        asset_hashes.insert(asset_path.clone(), hash);

        let root_hash = asset_hashes.root_hash();
        ic_cdk::api::set_certified_data(&root_hash);
    });

    asset_id
}

#[update]
async fn init_chunked_upload(args: InitUploadArgs) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    STATE.with(|state| {
        let mut state = state.borrow_mut();
        if state.temp_uploads.contains_key(&caller) {
            return Err("Upload already in progress".to_string());
        }

        let temp_upload = TempUpload {
            content_type: args.content_type,
            chunks: vec![None; args.total_chunks as usize],
            total_chunks: args.total_chunks,
        };

        state.temp_uploads.insert(caller, temp_upload);
        Ok(())
    })
}

#[update]
async fn upload_chunk(args: ChunkUploadArgs) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    STATE.with(|state| {
        let mut state = state.borrow_mut();
        let temp_upload = state.temp_uploads.get_mut(&caller)
            .ok_or("No upload in progress")?;

        if args.chunk_index >= temp_upload.total_chunks {
            return Err("Invalid chunk index".to_string());
        }

        temp_upload.chunks[args.chunk_index as usize] = Some(args.content);
        Ok(())
    })
}
#[update]
async fn finalize_upload() -> Result<u64, String> {
    let caller = ic_cdk::caller();

    // Declare variables to store results from the STATE.with block
    let (asset_id, asset, chunks): (u64, Asset, Vec<Vec<u8>>) = STATE.with(|state| {
        let mut state = state.borrow_mut();

        // Get the temporary upload
        let temp_upload = state.temp_uploads.remove(&caller)
            .ok_or("No upload in progress")?;

        // Verify all chunks are present
        if temp_upload.chunks.iter().any(|chunk| chunk.is_none()) {
            return Err("Missing chunks".to_string());
        }

        // Combine chunks
        let chunks: Vec<Vec<u8>> = temp_upload.chunks.into_iter()
            .map(|chunk| chunk.unwrap())
            .collect();

        let total_length: usize = chunks.iter().map(|chunk| chunk.len()).sum();

        // Create the asset
        let asset = Asset {
            content_type: temp_upload.content_type,
            encoding: AssetEncoding::Chunked {
                chunks: chunks.clone(),
                total_length,
            },
            owner: caller,
            created_at: ic_cdk::api::time(),
            modified_at: ic_cdk::api::time(),
        };

        let asset_id = state.next_asset_id;
        state.next_asset_id += 1;

        Ok((asset_id, asset, chunks))
    })?;

    // Store the finalized asset in STATE
    STATE.with(|state| {
        let mut state = state.borrow_mut();
        state.assets.insert(asset_id, asset);
    });

    // Update certification for the newly added asset
    let asset_path = format!("/asset/{}", asset_id);
    ASSET_HASHES.with(|asset_hashes| {
        let mut asset_hashes = asset_hashes.borrow_mut();

        // Compute a hash for the entire asset using the combined content
        let combined_content: Vec<u8> = chunks.into_iter().flatten().collect();
        let hash = sha2::Sha256::digest(&combined_content).into();

        asset_hashes.insert(asset_path.clone(), hash);

        let root_hash = asset_hashes.root_hash();
        ic_cdk::api::set_certified_data(&root_hash);
    });

    Ok(asset_id)
}

