// use std::collections::BTreeMap;

// use crate::icrc7_principal;
// use crate::guard::*;
// use crate::types::*;
// use crate::utils::*;
// use crate::query::*;

// use ic_cdk::update;
// use candid::{Principal, Nat};
// use ic_cdk::api::call::CallResult;
// use icrc_ledger_types::{icrc::generic_value::Value, icrc1::account::Account};

// #[update]
// async fn verify_nfts(minting_numbers: Vec<Nat>, owner: Principal) -> Result<String, String> {
//     check_update_batch_size(&minting_numbers)?;

//     let original_count = minting_numbers.len();

//     let exists_results = batch_nft_exists(minting_numbers.clone()).await?;
//     let verified_results = batch_is_verified(minting_numbers.clone()).await?;

//     let valid_nfts: Vec<(Nat, bool)> = minting_numbers.into_iter()
//         .zip(exists_results.into_iter())
//         .zip(verified_results.into_iter())
//         .filter_map(|((nft, exists), verified)| {
//             if exists && !verified {
//                 Some((nft, exists))
//             } else {
//                 None
//             }
//         })
//         .collect();

//     if valid_nfts.is_empty() {
//         return Ok("No valid NFTs to verify.".to_string());
//     }

//     let valid_minting_numbers: Vec<Nat> = valid_nfts.iter().map(|(nft, _)| nft.clone()).collect();

//     let metadata_call_result: CallResult<(Vec<Option<BTreeMap<String, Value>>>,)> = ic_cdk::call(
//         icrc7_principal(),
//         "icrc7_token_metadata",
//         (valid_minting_numbers.clone(),)
//     ).await;

//     let metadata = match metadata_call_result {
//         Ok((metadata,)) => metadata,
//         Err((code, msg)) => return Err(format!("Error fetching metadata: {:?} - {}", code, msg)),
//     };

//     let nft_requests: Vec<SetNFTItemRequest> = valid_minting_numbers.iter().zip(metadata.iter()).filter_map(|(token_id, token_metadata)| {
//         let description = token_metadata.as_ref().and_then(|metadata| {
//             metadata.get("icrc7:metadata:uri:transactionId")
//                 .and_then(|value| match value {
//                     Value::Text(s) => Some(s.clone()),
//                     _ => None,
//                 })
//         });

//         description.map(|desc| SetNFTItemRequest {
//             token_id: token_id.clone(),
//             owner: Some(Account::from(owner)),
//             metadata: NFTInput::Class(vec![
//                 PropertyShared {
//                     name: "icrc7:metadata:uri:transactionId".to_string(),
//                     value: CandyShared::Text(desc),
//                     immutable: true,
//                 },
//                 PropertyShared {
//                     name: "icrc7:metadata:verified".to_string(),
//                     value: CandyShared::Bool(true),
//                     immutable: true,
//                 },
//             ]),
//             override_: true,
//             created_at_time: Some(ic_cdk::api::time()),
//         })
//     }).collect();

//     if nft_requests.is_empty() {
//         return Ok("No valid NFTs to verify after metadata check.".to_string());
//     }

//     let nft_requests_count = nft_requests.len();

//     let call_result: CallResult<()> = ic_cdk::call(
//         icrc7_principal(),
//         "icrcX_mint",
//         (nft_requests,)
//     ).await;

//     match call_result {
//         Ok(_) => {
//             let verified_count = nft_requests_count;
//             let skipped_count = original_count - verified_count;
//             Ok(format!("{} NFTs successfully verified. {} NFTs skipped (already verified or non-existent).", verified_count, skipped_count))
//         },
//         Err((code, msg)) => Err(format!("Error calling icrcX_mint: {:?} - {}", code, msg))
//     }
// }



// #[update(guard = "is_frontend")]
// pub async fn batch_is_verified(token_ids: Vec<Nat>) -> Result<Vec<bool>, String> {
//     check_query_batch_size(&token_ids)?;
//     ic_cdk::println!("Checking verification status for token_ids: {:?}", token_ids);

//     let exists_results = batch_nft_exists(token_ids.clone()).await?;
//     if exists_results.iter().any(|&exists| !exists) {
//         return Err(format!("One or more NFTs in {:?} do not exist", token_ids));
//     }

//     ic_cdk::println!("Calling icrc7_token_metadata for token_ids: {:?}", token_ids);
//     let metadata_call_result: CallResult<(Vec<Option<BTreeMap<String, Value>>>,)> = ic_cdk::call(
//         icrc7_principal(),
//         "icrc7_token_metadata",
//         (token_ids.clone(),)
//     ).await;

//     match metadata_call_result {
//         Ok((metadata,)) => {
//             ic_cdk::println!("Received raw metadata: {:?}", metadata);
//             let verified_statuses: Vec<bool> = metadata.into_iter()
//                 .map(|token_metadata| {
//                     if let Some(token_metadata) = token_metadata {
//                         if let Some(Value::Blob(blob)) = token_metadata.get("icrc7:metadata:verified") {
//                             !blob.is_empty() && blob[0] == 1
//                         } else {
//                             false
//                         }
//                     } else {
//                         false
//                     }
//                 })
//                 .collect();
//             ic_cdk::println!("Parsed verified statuses: {:?}", verified_statuses);
//             Ok(verified_statuses)
//         },
//         Err((code, msg)) => {
//             ic_cdk::println!("Error fetching metadata: code={:?}, msg={}", code, msg);
//             Err(format!("Error fetching metadata for tokens {:?}: {:?} - {}", token_ids, code, msg))
//         }
//     }
// }



// #[update(guard = "is_frontend")]
// pub async fn batch_nft_exists(token_ids: Vec<Nat>) -> Result<Vec<bool>, String> {
//     check_query_batch_size(&token_ids)?;

//     let owner_call_result: CallResult<(Vec<Option<Account>>,)> = ic_cdk::call(
//       icrc7_principal(),
//       "icrc7_owner_of",
//       (token_ids.clone(),)
//   ).await;

//   match owner_call_result {
//       Ok((owner_results,)) => {
//           let exists_vec: Vec<bool> = owner_results.into_iter()
//               .map(|result| result.is_some())
//               .collect();
//           Ok(exists_vec)
//       },
//       Err((code, msg)) => {
//           Err(format!("Error checking if NFTs exist: {:?} - {}", code, msg))
//       }
//   }
// }