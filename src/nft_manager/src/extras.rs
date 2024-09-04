
// // Working version of the batch mint function (but still non-atomic).

// #[ic_cdk::update]
// pub async fn batch_mint_nft(descriptions: Vec<String>, minting_numbers: Vec<Nat>) -> Result<String, String> {
//     let icrc7_canister_id = Principal::from_text("fjqb7-6qaaa-aaaak-qc7gq-cai")
//         .expect("Invalid ICRC7 canister ID");

//     if descriptions.len() != minting_numbers.len() {
//         return Err("Mismatch between descriptions and minting numbers count".to_string());
//     }

//     if !is_within_32_digits(&minting_numbers) {
//         return Err("One or more minting numbers exceed 32 digits".to_string());
//     }

//     let caller = caller();
//     let current_time = ic_cdk::api::time();

//     let nft_requests: Vec<SetNFTItemRequest> = descriptions.into_iter()
//         .zip(minting_numbers.into_iter())
//         .map(|(description, token_id)| {
//             SetNFTItemRequest {
//                 token_id,
//                 owner: Some(Account {
//                     owner: caller,
//                     subaccount: None,
//                 }),
//                 metadata: NFTInput::Class(vec![
//                     PropertyShared {
//                         name: "icrc7:metadata:uri:transactionId".to_string(),
//                         value: CandyShared::Text(description),
//                         immutable: true,
//                     },
//                     PropertyShared {
//                         name: "icrc7:metadata:verified".to_string(),
//                         value: CandyShared::Bool(false),
//                         immutable: false,
//                     },
//                 ]),
//                 override_: false,
//                 created_at_time: Some(current_time),
//             }
//         })
//         .collect();

//     // Encode the argument
//     let arg = Encode!(&nft_requests).expect("Failed to encode argument");

//     // Call the icrcX_mint function on the ICRC7 canister
//     let call_result: CallResult<Vec<u8>> = ic_cdk::api::call::call_raw(
//         icrc7_canister_id,
//         "icrcX_mint",
//         &arg,
//         0
//     ).await;

//     match call_result {
//         Ok(raw_response) => {
//             // Decode the raw response
//             match Decode!(&raw_response, Vec<SetNFTResult>) {
//                 Ok(results) => {
//                     if results.iter().all(|r| matches!(r, SetNFTResult::Ok(_))) {
//                         Ok(format!("All {} NFTs minted successfully", results.len()))
//                     } else {
//                         let (successes, failures): (Vec<_>, Vec<_>) = results.into_iter()
//                             .enumerate()
//                             .partition(|(_, r)| matches!(r, SetNFTResult::Ok(_)));
                        
//                         let success_count = successes.len();
//                         let failure_details: Vec<String> = failures.into_iter()
//                             .map(|(index, r)| match r {
//                                 SetNFTResult::Err(e) => format!("NFT at index {} failed: {:?}", index, e),
//                                 _ => unreachable!(),
//                             })
//                             .collect();

//                         Err(format!("{} NFTs minted successfully. {} NFTs failed to mint: {:?}", 
//                                     success_count, failure_details.len(), failure_details))
//                     }
//                 },
//                 Err(e) => Err(format!("Failed to decode response: {}", e)),
//             }
//         },
//         Err((code, msg)) => Err(format!("Error calling icrcX_mint: {:?} - {}", code, msg))
//     }
// }






