// // Single query versions that got booted: 
// #[update(guard = "is_frontend")]
// pub async fn nft_exists(token_id: Nat) -> Result<bool, String> {

//   let owner_call_result: CallResult<(Vec<Option<Account>>,)> = ic_cdk::call(
//       icrc7_principal(),
//       "icrc7_owner_of",
//       (vec![token_id.clone()],)
//   ).await;

//   match owner_call_result {
//       Ok((owner_results,)) => {
//           if let Some(Some(_)) = owner_results.first() {
//               Ok(true)
//           } else {
//               Ok(false)
//           }
//       },
//       Err((code, msg)) => {
//           Err(format!("Error checking if NFT exists for token {}: {:?} - {}", token_id, code, msg))
//       }
//   }
// }






// #[update(guard = "is_frontend")]
// pub async fn is_verified(token_id: Nat) -> Result<bool, String> {
//   ic_cdk::println!("Checking verification status for token_id: {}", token_id);

//   if !nft_exists(token_id.clone()).await? {
//       return Err(format!("NFT with token_id {} does not exist", token_id));
//   }

//   ic_cdk::println!("Calling icrc7_token_metadata for token_id: {}", token_id);
//   let metadata_call_result: CallResult<(Vec<Option<BTreeMap<String, Value>>>,)> = ic_cdk::call(
//       icrc7_principal(),
//       "icrc7_token_metadata",
//       (vec![token_id.clone()],)
//   ).await;

//   match metadata_call_result {
//       Ok((metadata,)) => {
//           ic_cdk::println!("Received raw metadata: {:?}", metadata);
//           if let Some(Some(token_metadata)) = metadata.into_iter().next() {
//               ic_cdk::println!("Token metadata for {}: {:?}", token_id, token_metadata);
//               if let Some(Value::Blob(blob)) = token_metadata.get("icrc7:metadata:verified") {
//                   ic_cdk::println!("Verification blob: {:?}", blob);
//                   let is_verified = !blob.is_empty() && blob[0] == 1;
//                   ic_cdk::println!("Parsed is_verified: {}", is_verified);
//                   Ok(is_verified)
//               } else {
//                   ic_cdk::println!("No 'icrc7:metadata:verified' field found in metadata");
//                   Ok(false)
//               }
//           } else {
//               ic_cdk::println!("No metadata found for token_id: {}", token_id);
//               Ok(false)
//           }
//       },
//       Err((code, msg)) => {
//           ic_cdk::println!("Error fetching metadata: code={:?}, msg={}", code, msg);
//           Err(format!("Error fetching metadata for token {}: {:?} - {}", token_id, code, msg))
//       }
//   }
// }



// #[update(guard = "is_frontend")]
// pub async fn get_nft_manifest(token_id: Nat) -> Result<Option<String>, String> {
//     if let Some(metadata) = get_metadata(token_id).await? {
//         if let Some(description_value) = metadata.get("icrc7:metadata:uri:transactionId") {
//             if let Value::Text(text) = description_value {
//                 return Ok(Some(text.clone()));
//             }
//         }
//     }
//     Ok(None)
// }


// #[update(guard = "is_frontend")]
// pub async fn get_metadata(token_id: Nat) -> Result<Option<BTreeMap<String, Value>>, String> {

//     let metadata_call_result: CallResult<(Vec<Option<BTreeMap<String, Value>>>,)> = ic_cdk::call(
//         icrc7_principal(),
//         "icrc7_token_metadata",
//         (vec![token_id.clone()],)
//     ).await;

//     match metadata_call_result {
//         Ok((metadata,)) => {
//             Ok(metadata.into_iter().next().unwrap_or(None))
//         },
//         Err((code, msg)) => {
//             Err(format!("Error fetching metadata for token {}: {:?} - {}", token_id, code, msg))
//         }
//     }
// }