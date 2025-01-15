// // use ic_certified_map::{AsHashTree, Hash, RbTree};
// // use std::{cell::RefCell, collections::HashMap};

// // use candid::{CandidType, Principal};
// // use serde::{Deserialize, Serialize};
// use serde_cbor;

// #[derive(CandidType, Serialize, Deserialize, Clone)]
// pub struct Asset {
//     pub content_type: String,
//     pub encoding: AssetEncoding,
//     pub owner: Principal,
//     pub created_at: u64,
//     pub modified_at: u64,
// }
// #[derive(CandidType, Serialize, Deserialize, Clone)]
// pub enum AssetEncoding {
//     Raw(Vec<u8>),
//     Chunked {
//         chunks: Vec<Vec<u8>>,
//         total_length: usize,
//     },
// }

// #[derive(CandidType, Serialize, Deserialize)]
// pub struct StoreAssetArgs {
//     pub content_type: String,
//     pub content: Vec<u8>,
// }

// #[derive(CandidType, Serialize, Deserialize)]
// pub struct InitUploadArgs {
//     pub content_type: String,
//     pub total_chunks: u32,
// }

// #[derive(CandidType, Serialize, Deserialize)]
// pub struct ChunkUploadArgs {
//     pub chunk_index: u32,
//     pub content: Vec<u8>,
// }

// // thread_local! {
// //    pub static STATE: RefCell<State> = RefCell::new(State::default());
// //  pub   static ASSET_HASHES: RefCell<RbTree<String, Hash>> = RefCell::new(RbTree::new());

// // }

// // pub struct State {
// //     pub assets: HashMap<u64, Asset>,
// //     pub temp_uploads: HashMap<Principal, TempUpload>,
// //     pub next_asset_id: u64,
// //    pub certified_data: Option<Vec<u8>>,
// // }

// pub struct TempUpload {
//     pub content_type: String,
//     pub chunks: Vec<Option<Vec<u8>>>,
//     pub total_chunks: u32,
// }

// use std::{cell::RefCell, collections::HashMap};

// use candid::{CandidType, Nat, Principal};
// // impl Default for State {
// //     fn default() -> Self {
// //         State {
// //             assets: HashMap::new(),
// //             temp_uploads: HashMap::new(),
// //             next_asset_id: 1,
// //             certified_data: None,
// //         }
// //     }
// // }
// use ic_cdk::{
//     api::management_canister::http_request::{
//         http_request as management_http_request, CanisterHttpRequestArgument, HttpHeader,
//         HttpMethod, HttpResponse,
//     },
//     query, update,
// };
// use ic_certified_map::{AsHashTree, Hash, RbTree};
// use serde::{Deserialize, Serialize};
// use sha2::{Digest, Sha256};

// use crate::HttpRequest;

// thread_local! {
//    pub static STATE: RefCell<State> = RefCell::new(State::default());
//     pub static ASSET_HASHES: RefCell<RbTree<String, Hash>> = RefCell::new(RbTree::new());
// }

// pub struct State {
//     pub assets: HashMap<u64, Asset>,
//     pub temp_uploads: HashMap<Principal, TempUpload>,
//     pub next_asset_id: u64,
//     pub certified_data: Option<Vec<u8>>,
// }

// impl Default for State {
//     fn default() -> Self {
//         State {
//             assets: HashMap::new(),
//             temp_uploads: HashMap::new(),
//             next_asset_id: 1,
//             certified_data: None,
//         }
//     }
// }

// const CHUNK_SIZE: usize = 2000000; // 2MB chunks

// #[derive(Clone, Debug, CandidType, Deserialize)]
// pub struct StreamingCallbackToken {
//     asset_id: u64,
//     chunk_index: usize,
// }

// #[derive(Clone, Debug, CandidType, Deserialize)]
// pub struct StreamingCallbackHttpResponse {
//     body: Vec<u8>,
//     token: Option<StreamingCallbackToken>,
// }

// #[query]
// fn http_request_streaming_callback(token: StreamingCallbackToken) -> StreamingCallbackHttpResponse {
//     let asset_result = STATE.with(|state| {
//         let state = state.borrow();
//         state.assets.get(&token.asset_id).cloned()
//     });

//     match asset_result {
//         Some(asset) => {
//             let content = match &asset.encoding {
//                 AssetEncoding::Raw(data) => data.clone(),
//                 AssetEncoding::Chunked { chunks, .. } => {
//                     chunks.iter().flatten().cloned().collect()
//                 }
//             };

//             let start = token.chunk_index * CHUNK_SIZE;
//             let end = std::cmp::min(start + CHUNK_SIZE, content.len());
            
//             let chunk = content[start..end].to_vec();
//             let next_token = if end < content.len() {
//                 Some(StreamingCallbackToken {
//                     asset_id: token.asset_id,
//                     chunk_index: token.chunk_index + 1,
//                 })
//             } else {
//                 None
//             };

//             StreamingCallbackHttpResponse {
//                 body: chunk,
//                 token: next_token,
//             }
//         }
//         None => StreamingCallbackHttpResponse {
//             body: vec![],
//             token: None,
//         },
//     }
// }


// const MAX_RESPONSE_BYTES: usize = 2_000_000; // 2MB limit for responses

// #[ic_cdk::query]
// fn http_request(req: HttpRequest) -> HttpResponse {
//     let query_params: Vec<(&str, &str)> = req.url.split('?')
//         .nth(1)
//         .unwrap_or("")
//         .split('&')
//         .filter_map(|s| {
//             let mut parts = s.splitn(2, '=');
//             Some((parts.next()?, parts.next()?))
//         })
//         .collect();

//     let asset_id = query_params.iter()
//         .find(|&&(key, _)| key == "id")
//         .and_then(|&(_, value)| value.parse::<u64>().ok());

//     match asset_id {
//         Some(id) => {
//             let asset_result = STATE.with(|state| {
//                 let state = state.borrow();
//                 state.assets.get(&id).cloned()
//             });

//             match asset_result {
//                 Some(asset) => {
//                     let content = match &asset.encoding {
//                         AssetEncoding::Raw(data) => data.clone(),
//                         AssetEncoding::Chunked { chunks, .. } => {
//                             chunks.iter().flatten().cloned().collect()
//                         }
//                     };

//                     // Check if content exceeds size limit
//                     if content.len() > MAX_RESPONSE_BYTES {
//                         HttpResponse {
//                             status: Nat::from(413u64), // Payload Too Large
//                             headers: vec![HttpHeader {
//                                 name: "Content-Type".to_string(),
//                                 value: "text/plain".to_string(),
//                             }],
//                             body: "Content too large for direct download. Please implement range requests or split into smaller chunks.".as_bytes().to_vec(),
//                         }
//                     } else {
//                         HttpResponse {
//                             status: Nat::from(200u64),
//                             headers: vec![
//                                 HttpHeader {
//                                     name: "Content-Type".to_string(),
//                                     value: asset.content_type,
//                                 },
//                                 HttpHeader {
//                                     name: "Content-Length".to_string(),
//                                     value: content.len().to_string(),
//                                 },
//                             ],
//                             body: content,
//                         }
//                     }
//                 }
//                 None => HttpResponse {
//                     status: Nat::from(404u64),
//                     headers: vec![HttpHeader {
//                         name: "Content-Type".to_string(),
//                         value: "text/plain".to_string(),
//                     }],
//                     body: "Asset not found".as_bytes().to_vec(),
//                 }
//             }
//         }
//         None => HttpResponse {
//             status: Nat::from(400u64),
//             headers: vec![HttpHeader {
//                 name: "Content-Type".to_string(),
//                 value: "text/plain".to_string(),
//             }],
//             body: "Invalid asset ID".as_bytes().to_vec(),
//         }
//     }
// }


// fn update_certified_data(path: &String, content: &Vec<u8>) {
//     ASSET_HASHES.with(|asset_hashes| {
//         let mut asset_hashes = asset_hashes.borrow_mut();

//         // Compute the hash
//         let hash = Sha256::digest(content).into();
//         asset_hashes.insert(path.clone(), hash);

//         // Update the root hash
//         let root_hash = asset_hashes.root_hash();
//         ic_cdk::api::set_certified_data(&root_hash);

//         // Update certified data in the state
//         STATE.with(|state| {
//             let mut state = state.borrow_mut();

//             // Use serde_cbor to serialize the witness
//             state.certified_data =
//                 Some(serde_cbor::to_vec(&asset_hashes.witness(path.as_bytes())).unwrap());
//         });
//     });
// }

// // #[derive(Clone, Debug, CandidType, Deserialize)]
// // struct HttpResponse {
// //     status_code: u16,
// //     headers: Vec<HeaderField>,
// //     body: Vec<u8>,
// // }

// #[derive(Clone, Debug, CandidType, Deserialize)]
// struct HeaderField(String, String);
