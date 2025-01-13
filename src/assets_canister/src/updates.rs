// use ic_cdk::update;

// use crate::{Asset, AssetEncoding, ChunkUploadArgs, InitUploadArgs, StoreAssetArgs, TempUpload, STATE};

// #[update]
// async fn finalize_upload() -> Result<u64, String> {
//     let caller = ic_cdk::caller();
    
//     let (asset_id, asset) = STATE.with(|state| {
//         let mut state = state.borrow_mut();
        
//         let temp_upload = state.temp_uploads.remove(&caller)
//             .ok_or("No upload in progress")?;

//         // Verify all chunks are present
//         if temp_upload.chunks.iter().any(|chunk| chunk.is_none()) {
//             return Err("Missing chunks".to_string());
//         }

//         // Combine chunks
//         let chunks: Vec<Vec<u8>> = temp_upload.chunks.into_iter()
//             .map(|chunk| chunk.unwrap())
//             .collect();

//         let total_length: usize = chunks.iter().map(|chunk| chunk.len()).sum();

//         let asset = Asset {
//             content_type: temp_upload.content_type,
//             encoding: AssetEncoding::Chunked {
//                 chunks,
//                 total_length,
//             },
//             owner: caller,
//             created_at: ic_cdk::api::time(),
//             modified_at: ic_cdk::api::time(),
//         };

//         let asset_id = state.next_asset_id;
//         state.next_asset_id += 1;
        
//         Ok((asset_id, asset))
//     })?;

//     STATE.with(|state| {
//         let mut state = state.borrow_mut();
//         state.assets.insert(asset_id, asset);
//     });

//     Ok(asset_id)
// }
