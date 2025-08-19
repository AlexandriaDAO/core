use crate::{icrc7_principal, icrc7_scion_principal};
use crate::types::*;
use crate::utils::*;

use candid::Nat;
use ic_cdk::caller;
use ic_cdk::api::call::CallResult;
use icrc_ledger_types::icrc1::account::Account;

pub async fn mint_nft(minting_number: Nat, description: Option<String>) -> Result<String, String> {
    const MAX_DESCRIPTION_LENGTH: usize = 256;

    if let Some(desc) = &description {
        if desc.len() > MAX_DESCRIPTION_LENGTH {
            return Err(format!("Description exceeds maximum length of {} bytes", MAX_DESCRIPTION_LENGTH));
        }
    }

    if !is_within_100_digits(minting_number.clone()) {
        return Err("Minting number must not exceed 32 digits".to_string());
    }

    let owner = caller();
    let new_token_id = minting_number;

    let metadata = vec![
        PropertyShared {
            name: "icrc7:metadata:uri:description".to_string(),
            value: CandyShared::Text(description.unwrap_or_default()),
            immutable: true,
        },
        // PropertyShared {
        //     name: "alexandria:minter".to_string(),
        //     value: CandyShared::Text(owner.to_string()),
        //     immutable: true,
        // },
    ];

    let nft_request = SetNFTItemRequest {
        token_id: new_token_id.clone(),
        owner: Some(Account {
            owner,
            subaccount: None,
        }),
        metadata: NFTInput::Class(metadata),
        override_: false,
        created_at_time: Some(ic_cdk::api::time()),
    };

    let call_result: CallResult<()> = ic_cdk::call(
        icrc7_principal(),
        "icrcX_mint",
        (vec![nft_request],)
    ).await;

    match call_result {
        Ok(_) => Ok(format!("NFT minted successfully with token ID: {}", new_token_id)),
        Err((code, msg)) => Err(format!("Error calling icrcX_mint: {:?} - {}", code, msg))
    }
}


pub async fn mint_scion_nft(minting_number: Nat, description: Option<String>) -> Result<String, String> {
    const MAX_DESCRIPTION_LENGTH: usize = 256;

    if let Some(desc) = &description {
        if desc.len() > MAX_DESCRIPTION_LENGTH {
            return Err(format!("Description exceeds maximum length of {} bytes", MAX_DESCRIPTION_LENGTH));
        }
    }

    if !is_within_100_digits(minting_number.clone()) {
        return Err("Minting number must not exceed 32 digits".to_string());
    }

    let owner = caller();
    let new_token_id = minting_number;

    let metadata = vec![
        PropertyShared {
            name: "icrc7:metadata:uri:description".to_string(),
            value: CandyShared::Text(description.unwrap_or_default()),
            immutable: true,
        },
    ];

    let nft_request = SetNFTItemRequest {
        token_id: new_token_id.clone(),
        owner: Some(Account {
            owner,
            subaccount: None,
        }),
        metadata: NFTInput::Class(metadata),
        override_: false,
        created_at_time: Some(ic_cdk::api::time()),
    };

    let call_result: CallResult<()> = ic_cdk::call(
        icrc7_scion_principal(),
        "icrcX_mint",
        (vec![nft_request],)
    ).await;

    match call_result {
        Ok(_) => Ok(format!("NFT minted successfully with token ID: {}", new_token_id)),
        Err((code, msg)) => Err(format!("Error calling icrcX_mint: {:?} - {}", code, msg))
    }
}


// use crate::nft_manager_principal;
// use crate::guard::not_anon;
// use num_traits::cast::ToPrimitive;

// // Admin function to add alexandria:minter field to all existing NFTs
// #[ic_cdk::update(guard = "not_anon")]
// pub async fn fix_minter_metadata_field() -> Result<String, String> {
//     let caller = caller();

//     // Only allow specific admin principals to run this fix
//     let admin_principals = vec![
//         "b22ol-nxj6k-ai4r2-ztuse-uguwt-oeqdf-3tyzz-pxbtv-o5fyo-t3z4a-oqe", // @evanmcfarland
//     ];

//     if !admin_principals.contains(&caller.to_string().as_str()) {
//         return Err("Unauthorized: Only admin can fix metadata".to_string());
//     }

//     // Get all existing NFT token IDs using the get_nfts function
//     let nfts_result: CallResult<(Result<Vec<Nat>, String>,)> = ic_cdk::call(
//         nft_manager_principal(),
//         "get_nfts", 
//         (None::<Nat>, None::<Nat>)  // No pagination limits
//     ).await;
    
//     let token_ids = match nfts_result {
//         Ok((Ok(nfts),)) => nfts,
//         Ok((Err(err),)) => return Err(format!("Error from get_nfts: {}", err)),
//         Err((code, msg)) => return Err(format!("Error calling get_nfts: {:?} - {}", code, msg)),
//     };
    
//     if token_ids.is_empty() {
//         return Ok("No NFTs found to update".to_string());
//     }
    
//     // Get owners for all tokens
//     let owners_result: CallResult<(Vec<Option<Account>>,)> = ic_cdk::call(
//         icrc7_principal(),
//         "icrc7_owner_of",
//         (token_ids.clone(),)
//     ).await;
    
//     let owners = match owners_result {
//         Ok((owners,)) => owners,
//         Err((code, msg)) => return Err(format!("Error getting owners: {:?} - {}", code, msg)),
//     };
    
//     let mut updated_count = 0;
//     let mut failed_count = 0;
    
//     // Process each NFT
//     for (index, token_id) in token_ids.iter().enumerate() {
//         // Get current owner
//         let current_owner = match owners.get(index) {
//             Some(Some(account)) => account.clone(),
//             _ => {
//                 failed_count += 1;
//                 continue;
//             }
//         };
        
//         // Create metadata with description (empty) and minter field
//         let metadata_props = vec![
//             PropertyShared {
//                 name: "icrc7:metadata:uri:description".to_string(),
//                 value: CandyShared::Text("".to_string()), // Empty description for existing NFTs
//                 immutable: true,
//             },
//             PropertyShared {
//                 name: "alexandria:minter".to_string(),
//                 value: CandyShared::Text(current_owner.owner.to_string()), // Set minter to current owner
//                 immutable: true,
//             },
//         ];
        
//         let update_request = SetNFTItemRequest {
//             token_id: token_id.clone(),
//             owner: Some(current_owner),
//             metadata: NFTInput::Class(metadata_props),
//             override_: true, // Replace existing metadata
//             created_at_time: None,
//         };
        
//         let call_result: CallResult<()> = ic_cdk::call(
//             icrc7_principal(),
//             "icrcX_mint",
//             (vec![update_request],)
//         ).await;
        
//         match call_result {
//             Ok(_) => {
//                 ic_cdk::println!("Successfully updated token ID: {}", token_id);
//                 updated_count += 1;
//             },
//             Err((code, msg)) => {
//                 ic_cdk::println!("Failed to update token ID: {}, Error: {:?} - {}", token_id, code, msg);
//                 failed_count += 1;
//             },
//         }
//     }
    
//     Ok(format!("Added alexandria:minter to {} NFTs, {} failed", updated_count, failed_count))
// }

