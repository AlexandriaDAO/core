// // Graveyard of unused functions.



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












// //  This doesn't work because you're just basically iteratign the transfer function and might as well do 1 by 1.
// #[update(guard = "not_anon")]
// pub async fn withdraw_all(mint_numbers: Vec<Nat>) -> Result<Vec<(Nat, Option<BlockIndex>, Option<BlockIndex>)>, String> {
//     let caller = ic_cdk::api::caller();
//     let mut results = Vec::new();

//     // Ensure caller owns all the NFTs
//     let ownership_result = ic_cdk::call::<(Vec<Nat>,), (Vec<Option<Account>>,)>(
//         icrc7_principal(),
//         "icrc7_owner_of",
//         (mint_numbers.clone(),),
//     )
//     .await
//     .map_err(|e| format!("Failed to call icrc7_owner_of: {:?}", e))?;

//     for (mint_number, owner_option) in mint_numbers.iter().zip(ownership_result.0.iter()) {
//         let owner = owner_option.as_ref()
//             .ok_or_else(|| format!("NFT #{} not found", mint_number))?;
//         if owner.owner != caller {
//             return Err(format!("Caller is not the owner of NFT #{}", mint_number));
//         }
//     }

//     let balances = get_nft_balances(mint_numbers.clone()).await?;

//     for (mint_number, balance) in mint_numbers.into_iter().zip(balances.into_iter()) {
//         let subaccount = Some(to_nft_subaccount(mint_number.clone()));
//         let to_account = Account {
//             owner: caller,
//             subaccount: None,
//         };

//         let mut lbry_result = None;
//         let mut alex_result = None;

//         // Check and transfer LBRY if sufficient
//         if balance.lbry >= NumTokens::from(10_000_000u64) {
//             let lbry_transfer_args = TransferArg {
//                 memo: None,
//                 amount: balance.lbry.clone(),
//                 from_subaccount: subaccount,
//                 fee: None,
//                 to: to_account.clone(),
//                 created_at_time: None,
//             };

//             // Withdraw LBRY
//             match ic_cdk::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
//                 lbry_principal(),
//                 "icrc1_transfer",
//                 (lbry_transfer_args,),
//             )
//             .await
//             {
//                 Ok((Ok(block_index),)) => {
//                     lbry_result = Some(block_index);
//                     ic_cdk::println!("Transferred {} LBRY from NFT# {} to {}", balance.lbry, mint_number, caller);
//                 }
//                 Ok((Err(e),)) => ic_cdk::println!("LBRY ledger transfer error for NFT #{}: {:?}", mint_number, e),
//                 Err(e) => ic_cdk::println!("Failed to call LBRY ledger for NFT #{}: {:?}", mint_number, e),
//             }
//         } else {
//             ic_cdk::println!("LBRY balance ({}) for NFT #{} is not enough to justify the transaction fee.", balance.lbry, mint_number);
//         }

//         // Check and transfer ALEX if sufficient
//         if balance.alex >= NumTokens::from(100_000u64) {
//             let alex_transfer_args = TransferArg {
//                 memo: None,
//                 amount: balance.alex.clone(),
//                 from_subaccount: subaccount,
//                 fee: None,
//                 to: to_account,
//                 created_at_time: None,
//             };

//             // Withdraw ALEX
//             match ic_cdk::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
//                 alex_principal(),
//                 "icrc1_transfer",
//                 (alex_transfer_args,),
//             )
//             .await
//             {
//                 Ok((Ok(block_index),)) => {
//                     alex_result = Some(block_index);
//                     ic_cdk::println!("Transferred {} ALEX from NFT# {} to {}", balance.alex, mint_number, caller);
//                 }
//                 Ok((Err(e),)) => ic_cdk::println!("ALEX ledger transfer error for NFT #{}: {:?}", mint_number, e),
//                 Err(e) => ic_cdk::println!("Failed to call ALEX ledger for NFT #{}: {:?}", mint_number, e),
//             }
//         } else {
//             ic_cdk::println!("ALEX balance ({}) for NFT #{} is not enough to justify the transaction fee.", balance.alex, mint_number);
//         }

//         results.push((mint_number, lbry_result, alex_result));
//     }

//     if results.is_empty() || results.iter().all(|(_, lbry, alex)| lbry.is_none() && alex.is_none()) {
//         Err("No transfers were executed due to insufficient balances".to_string())
//     } else {
//         Ok(results)
//     }
// }












// #[update(guard = "is_frontend")]
// pub async fn get_my_nft_balances() -> Result<Vec<(Nat, TokenBalances)>, String> {
//     let caller = ic_cdk::api::caller();
    
//     // Get the NFTs owned by the caller
//     let nfts = get_nfts_of(caller).await?;
    
//     // Extract just the token IDs
//     let token_ids: Vec<Nat> = nfts.into_iter().map(|(id, _)| id).collect();
    
//     // Get the balances for these NFTs
//     let balances = get_nft_balances(token_ids.clone()).await?;
    
//     // Combine token IDs with their balances
//     let result: Vec<(Nat, TokenBalances)> = token_ids.into_iter()
//         .zip(balances.into_iter())
//         .collect();
    
//     Ok(result)
// }

























// We don't need transfer anymore because we'll leave that open on the icrc7 canister: 

// #[update(guard = "not_anon")]
// pub async fn transfer_nft(token_id: Nat, to: Principal, from_subaccount: Option<Vec<u8>>, memo: Option<Vec<u8>>) -> Result<Nat, String> {
//     let transfer_arg = TransferArg {
//         to: Account {
//             owner: to,
//             subaccount: None,
//         },
//         token_id,
//         memo,
//         from_subaccount,
//         created_at_time: Some(time()),
//     };

//     let call_result: CallResult<(Vec<Option<TransferResult>>,)> = ic_cdk::call(
//         icrc7_principal(),
//         "icrc7_transfer",
//         (vec![transfer_arg],)
//     ).await;

//     match call_result {
//         Ok((transfer_results,)) => match transfer_results.get(0).and_then(|r| r.as_ref()) {
//             Some(TransferResult::Ok(transaction_index)) => Ok(transaction_index.clone()),
//             Some(TransferResult::Err(transfer_error)) => Err(format!("Transfer failed: {:?}", transfer_error)),
//             None => Err("No transfer result returned".to_string()),
//         },
//         Err((code, msg)) => Err(format!("Error calling icrc7_transfer: {:?} - {}", code, msg)),
//     }
// }











// // Old assign function, which apparently is useless and a regular transfer.

// public shared(msg) func assign(token_id : Nat, account : Account) : async (Nat, Principal) {
//   let apparent_owner = icrc7().get_state().owner;
//   D.print("Caller: " # debug_show(msg.caller));
//   D.print("Apparent owner: " # debug_show(apparent_owner));

//   let transfer_result = switch(icrc7().transfer<system>(Principal.fromActor(this), [{
//     from_subaccount = null;
//     to = account;
//     token_id = token_id;
//     memo = null;
//     created_at_time = null;
//   }])[0]){
//     case(?#Ok(val)) val;
//     case(?#Err(err)) D.trap(debug_show(err));
//     case(_) D.trap("unknown");
//   };

//   (transfer_result, apparent_owner)
// };
