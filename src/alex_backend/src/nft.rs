use candid::{Nat, Principal, CandidType};
use ic_cdk::api::call::CallResult;
use ic_cdk::caller;
use std::fmt::Debug;
use std::collections::BTreeMap;
use icrc_ledger_types::icrc::generic_value::Value;


#[derive(CandidType, serde::Deserialize, Clone, Debug)]
struct Account {
    owner: Principal,
    subaccount: Option<Vec<u8>>,
}

#[derive(CandidType)]
struct MintArg {
    to: Account,
    token_id: Nat,
    memo: Option<Vec<u8>>,
    from_subaccount: Option<Vec<u8>>,
    token_description: Option<String>,
    token_logo: Option<String>,
    token_name: Option<String>,
}

#[ic_cdk::update]
pub async fn mint_nft(description: String) -> Result<String, String> {
    let icrc7_canister_id = Principal::from_text("fjqb7-6qaaa-aaaak-qc7gq-cai")
        .expect("Invalid ICRC7 canister ID");

    let total_supply = current_mint().await?;

    let new_token_id = total_supply + Nat::from(1u64);

    let mint_arg = MintArg {
        to: Account {
            owner: caller(),
            subaccount: Some(vec![0; 32]), // Default subaccount
        },
        token_id: new_token_id.clone(),
        memo: None,
        from_subaccount: None,
        token_description: Some(description),
        token_logo: None,
        token_name: None,
    };

    // Call the mint function on the ICRC7 canister
    let call_result: CallResult<()> = ic_cdk::call(
        icrc7_canister_id,
        "mint",
        (mint_arg,)
    ).await;

    match call_result {
        Ok(()) => Ok(format!("NFT minted successfully with token ID: {}", new_token_id)),
        Err((code, msg)) => Err(format!("Error calling mint: {:?} - {}", code, msg))
    }
}


#[ic_cdk::update]
async fn current_mint() -> Result<Nat, String> {
    let icrc7_canister_id = Principal::from_text("fjqb7-6qaaa-aaaak-qc7gq-cai")
        .expect("Invalid ICRC7 canister ID");

    let call_result: CallResult<(Nat,)> = ic_cdk::call(
        icrc7_canister_id,
        "icrc7_total_supply",
        ()
    ).await;

    match call_result {
        Ok((total_supply,)) => Ok(total_supply),
        Err((code, msg)) => Err(format!("Error calling icrc7_total_supply: {:?} - {}", code, msg))
    }
}




#[derive(CandidType, serde::Deserialize, Debug, Clone)]
pub struct TokenDetail {
    token_id: u32,
    owner: String,
    description: String,
}

// Function to get all token IDs
async fn get_tokens() -> Result<Vec<Nat>, String> {
    let icrc7_canister_id = Principal::from_text("fjqb7-6qaaa-aaaak-qc7gq-cai").expect("Invalid ICRC7 canister ID");

    let tokens_call_result: CallResult<(Vec<Nat>,)> = ic_cdk::call(
        icrc7_canister_id,
        "icrc7_tokens",
        (None::<Nat>, None::<Nat>)
    ).await;

    match tokens_call_result {
        Ok((ids,)) => {
            // ic_cdk::println!("Retrieved token IDs: {:?}", ids);
            Ok(ids)
        },
        Err((code, msg)) => {
            Err(format!("Error fetching token IDs: {:?} - {}", code, msg))
        }
    }
}


// Function to get metadata for a specific token ID
async fn get_metadata(token_id: Nat) -> Result<Option<BTreeMap<String, Value>>, String> {
    let icrc7_canister_id = Principal::from_text("fjqb7-6qaaa-aaaak-qc7gq-cai").expect("Invalid ICRC7 canister ID");

    let metadata_call_result: CallResult<(Vec<Option<BTreeMap<String, Value>>>,)> = ic_cdk::call(
        icrc7_canister_id,
        "icrc7_token_metadata",
        (vec![token_id.clone()],)
    ).await;

    match metadata_call_result {
        Ok((metadata,)) => {
            Ok(metadata.into_iter().next().unwrap_or(None))
        },
        Err((code, msg)) => {
            Err(format!("Error fetching metadata for token {}: {:?} - {}", token_id, code, msg))
        }
    }
}


// Function to get the description for a specific token ID
async fn get_description(token_id: Nat) -> Result<Option<String>, String> {
    if let Some(metadata) = get_metadata(token_id).await? {
        if let Some(description_value) = metadata.get("Description") {
            if let Value::Text(text) = description_value {
                return Ok(Some(text.clone()));
            }
        }
    }
    Ok(None)
}


// Function to get the owner for a specific token ID
async fn get_owner(token_id: Nat) -> Result<Option<Account>, String> {
    let icrc7_canister_id = Principal::from_text("fjqb7-6qaaa-aaaak-qc7gq-cai").expect("Invalid ICRC7 canister ID");

    let owner_call_result: CallResult<(Vec<Option<Account>>,)> = ic_cdk::call(
        icrc7_canister_id,
        "icrc7_owner_of",
        (vec![token_id.clone()],)
    ).await;

    match owner_call_result {
        Ok((owners,)) => {
            Ok(owners.into_iter().next().unwrap_or(None))
        },
        Err((code, msg)) => {
            Err(format!("Error fetching owner for token {}: {:?} - {}", token_id, code, msg))
        }
    }
}


// Function to get all NFTs
#[ic_cdk::update]
pub async fn get_nfts() -> Result<Vec<TokenDetail>, String> {
    let token_ids = get_tokens().await?;

    let mut nfts: Vec<TokenDetail> = Vec::new();

    for token_id in token_ids {
        let description = get_description(token_id.clone()).await?;
        let owner = get_owner(token_id.clone()).await?;
        // Convert Nat to u32
        let token_id_u32 = u32::try_from(&token_id.0).map_err(|_| format!("Failed to convert token_id {:?} to u64", token_id))?;

        nfts.push(TokenDetail {
            token_id: token_id_u32,
            owner: owner.map(|account| account.owner.to_string()).unwrap_or_default(), // Convert Principal to string
            description: description.unwrap_or_default(), // Use default if None
        });
    }

    Ok(nfts)
}


#[ic_cdk::update]
pub async fn get_nfts_of(owner_principal: String) -> Result<Vec<TokenDetail>, String> {
    // Convert the owner principal string to a Principal type
    let owner: Principal = Principal::from_text(&owner_principal).map_err(|e| format!("Invalid principal: {}", e))?;
    
    // Get all NFTs
    let all_nfts: Vec<TokenDetail> = get_nfts().await?;

    // Filter NFTs to find those owned by the specified principal
    let matching_nfts: Vec<TokenDetail> = all_nfts.into_iter()
        .filter(|nft| nft.owner == owner.to_string()) // Compare string representation of the owner
        .collect();

    Ok(matching_nfts)
}



// // Function to a user NFTs
// #[ic_cdk::update]
// pub async fn get_nfts_of(owner_principal: String) -> Result<Vec<TokenDetail>, String> {
//     // Convert the Principal string to a Principal type
//     let owner = Principal::from_text(&owner_principal).map_err(|e| format!("Invalid principal: {}", e))?;

//     // Fetch all token IDs
//     let token_ids = get_tokens().await?;

//     let mut matching_nfts = Vec::new();

//     // Iterate over each token ID to find matches
//     for token_id in token_ids {
//         // Get the owner of the token
//         if let Ok(Some(owner_account)) = get_owner(token_id.clone()).await {
//             // Check if the owner matches the provided Principal
//             if owner_account.owner == owner {
//                 // Get the description of the token
//                 let description = get_description(token_id.clone()).await?;
//                 matching_nfts.push(TokenDetail {
//                     token_id,
//                     description,
//                     owner: Some(owner_account),
//                 });
//             }
//         }
//     }

//     // Return the array of matching NFTs
//     Ok(matching_nfts)
// }




/*
Functional Goals:

// Updates
- Caller is able to mint an NFT with the ArWeave id as the description, and the post id as LBN
- Caller is able to burn their own nft.
- Caller is able to transfer their nft to someone else.

// Queries
- Caller is able to get any nft or group of nfts (up to 100).
- Get the current count that will be the next minting number.

// DeFi
- Later these will be wrapped in init() functions that requre a LBRY transfer.


How:

Backend Psuedocode:




//   - lbn == icrc7_total_supply() # Actually nah, just get arweavetx first, since this might change.
  - mint(lbn, arweave_tx) -> ()
    - call icrc7 icrc7_mint()



ACTUALLY. For burning, transfering, and querying, the frontend can just call the canister directly. You only need this backend as the minting authority.    
  - burn(lbn) -> ()
    - if ic-cdk::caller() == call icrc7 icrc7_owner_of(lbn);
      - call (lbn)
    - else
      - you have no right.




Frontend Psuedocode:

Mint(): 
  - All ArWeave metadata parameters must be prepopulated, so .ebook, cover image, and title, author, etc., via the frontend flow. (We'll later add checks to ensure the quality of the ebook).
  - The only peice of metadata you still need is the NFT_id's current count, so get that from the backend and populate the LBN metadata field with that mint number.
  - Manually get the transaction in advance of the upload using this methodology: https://docs.irys.xyz/developer-docs/irys-sdk/manual-transaction
  - Call the backend and mint the nft with the ArWeave tx_id as the description, and the current count (LBN) as the NFT's "id". 
    - If successfull, upload to ArWeave and the NFT is done!
    - If transaction fails, don't upload to arweave.

*The reason we need to do it this way is that this ICRC7 implementation will not let you mint a number below the highest minted interger. So if I minted NFT 100, I would never be alowed to mint NFTs 1-99.
Therefore, we use a stable counter and don't skip any numbers.
The trouble with this is there might be two people trying to upload an NFT at one time, and between the time someone requests the current count and uploads to arweave, the count might have changed.
This methodology is atomic, and ensures either all transactions fail, or all succeede. We can't have someone pay for the ArWeave Upload, and have the mint fail, or vice versa.


The other frontend functions are pretty straightforward, and just directly calling the backend without parameters.


*/