use candid::{CandidType, Nat};
use ic_cdk:: query;
use ic_certified_map::AsHashTree;
use serde::Deserialize;
use ic_certified_map::Hash;

use crate::{Asset, AssetEncoding, ASSET_HASHES, STATE};
#[derive(Clone, Debug, CandidType, Deserialize)]
struct HeaderField(String, String);

#[query]
fn get_asset(asset_id: u64) -> Option<Asset> {
    STATE.with(|state| {
        state.borrow().assets.get(&asset_id).cloned()
    })
}

#[query]
fn get_asset_content_type(asset_id: u64) -> Option<String> {
    STATE.with(|state| {
        state.borrow().assets.get(&asset_id)
            .map(|asset| asset.content_type.clone())
    })
}

#[query]
fn is_owner(asset_id: u64) -> bool {
    let caller = ic_cdk::caller();
    STATE.with(|state| {
        state.borrow().assets.get(&asset_id)
            .map_or(false, |asset| asset.owner == caller)
    })
}


#[derive(Clone, Debug, CandidType, Deserialize)]
struct HttpHeader {
 pub   name: String,
   pub value: String,
}



#[derive(CandidType, Deserialize)]
pub struct HttpRequest {
    pub url: String,
    pub method: String,
    pub body: Vec<u8>,
    pub headers: Vec<HeaderField>,
}



// #[query]
// fn http_request(req: HttpRequest) -> HttpResponse {
//     let path = req.url.split('?').next().unwrap_or("");
    
//     // Get certification
//     let certification = STATE.with(|state| {
//         let state = state.borrow();
//         state.certified_data.clone()
//     });

//     // Create headers with certification
//     let mut headers = vec![
//         HeaderField("IC-Certificate".to_string(), 
//             certification.unwrap_or_default().to_string()),
//         HeaderField("Access-Control-Allow-Origin".to_string(), "*".to_string()),
//     ];

//     let parts: Vec<&str> = path.split('/').collect();
//     if parts.len() >= 2 && parts[0] == "asset" {
//         if let Ok(asset_id) = parts[1].parse::<u64>() {
//             return STATE.with(|state| {
//                 let state = state.borrow();
//                 if let Some(asset) = state.assets.get(&asset_id) {
//                     headers.push(HeaderField(
//                         "Content-Type".to_string(), 
//                         asset.content_type.clone()
//                     ));

//                     let body = match &asset.encoding {
//                         AssetEncoding::Raw(data) => data.clone(),
//                         AssetEncoding::Chunked { chunks, .. } => {
//                             let mut combined = Vec::new();
//                             for chunk in chunks {
//                                 combined.extend(chunk);
//                             }
//                             combined
//                         }
//                     };

//                     // Update certification for this asset
//                     update_certified_data(&path.to_string(), &body);

//                     HttpResponse {
//                         status_code: 200,
//                         headers,
//                         body,
//                     }
//                 } else {
//                     HttpResponse {
//                         status_code: 404,
//                         headers,
//                         body: "Asset not found".as_bytes().to_vec(),
//                     }
//                 }
//             });
//         }
//     }

//     HttpResponse {
//         status_code: 400,
//         headers,
//         body: "Invalid request".as_bytes().to_vec(),
//     }
// }

// fn update_certified_data(path: &String, content: &Vec<u8>) {
//     ASSET_HASHES.with(|asset_hashes| {
//         let mut asset_hashes = asset_hashes.borrow_mut();
//         let hashed = Hash(Sha256::digest(content).into());
//         asset_hashes.insert(path.clone(), hashed);
        
//         let root_hash = asset_hashes.root_hash();
//         ic_cdk::api::set_certified_data(&root_hash);
        
//         STATE.with(|state| {
//             let mut state = state.borrow_mut();
//             state.certified_data = Some(asset_hashes.witness(path).serialize_to_vec());
//         });
//     });
// }

// #[derive(Clone, Debug, CandidType, Deserialize)]
// struct HttpResponse {
//     status_code: u16,
//     headers: Vec<HeaderField>,
//     body: Vec<u8>,
// }