use candid::{Nat, Principal, CandidType, Encode, Decode};
use ic_cdk::api::call::CallResult;
use ic_cdk::caller;
use serde::{Deserialize, Serialize};

use std::collections::BTreeMap;
use icrc_ledger_types::icrc::generic_value::Value;

#[derive(CandidType, Deserialize, Serialize)]
struct Account {
    owner: Principal,
    subaccount: Option<Vec<u8>>,
}

#[derive(CandidType, Serialize)]
struct PropertyShared {
    name: String,
    value: CandyShared,
    immutable: bool,
}

#[derive(CandidType, Serialize)]
enum CandyShared {
    Text(String),
    Bool(bool),
    // Add other variants as needed
}

#[derive(CandidType, Serialize)]
enum NFTInput {
    Class(Vec<PropertyShared>),
    // Add other variants as needed
}

#[derive(CandidType, Serialize)]
struct SetNFTItemRequest {
    token_id: Nat,
    owner: Option<Account>,
    metadata: NFTInput,
    memo: Option<Vec<u8>>,
    #[serde(rename = "override")]
    override_: bool,
    created_at_time: Option<u64>,
}

#[derive(CandidType, Deserialize, Debug)]
enum SetNFTResult {
    Ok(Option<Nat>),
    Err(String), // Simplified error type, adjust as needed
}

#[derive(CandidType, serde::Deserialize, Debug, Clone)]
pub struct TokenDetail {
    token_id: u32,
    owner: String,
    description: String,
}


#[ic_cdk::update]
pub async fn mint_nft(description: String) -> Result<String, String> {
    let icrc7_canister_id = Principal::from_text("fjqb7-6qaaa-aaaak-qc7gq-cai")
        .expect("Invalid ICRC7 canister ID");

    let total_supply = current_mint().await?;
    let new_token_id = total_supply + Nat::from(1u64);

    let nft_request = SetNFTItemRequest {
        token_id: new_token_id.clone(),
        owner: Some(Account {
            owner: caller(),
            subaccount: None,
        }),
        metadata: NFTInput::Class(vec![
            PropertyShared {
                name: "icrc7:metadata:uri:transactionId".to_string(),
                value: CandyShared::Text(description),
                immutable: true,
            },
            PropertyShared {
                name: "icrc7:metadata:verified".to_string(),
                value: CandyShared::Bool(false),
                immutable: false,
            },
        ]),
        memo: None,
        override_: true,
        created_at_time: Some(ic_cdk::api::time()),
    };

    // Encode the argument
    let arg = Encode!(&vec![nft_request]).expect("Failed to encode argument");

    // Call the icrcX_mint function on the ICRC7 canister
    let call_result: CallResult<Vec<u8>> = ic_cdk::api::call::call_raw(
        icrc7_canister_id,
        "icrcX_mint",
        &arg,
        0
    ).await;

    match call_result {
        Ok(raw_response) => {
            // Decode the raw response
            match Decode!(&raw_response, Vec<SetNFTResult>) {
                Ok(results) => {
                    if results.iter().all(|r| matches!(r, SetNFTResult::Ok(_))) {
                        Ok(format!("NFT minted successfully with token ID: {}", new_token_id))
                    } else {
                        let errors: Vec<String> = results.iter()
                            .filter_map(|r| match r {
                                SetNFTResult::Err(e) => Some(e.clone()),
                                _ => None,
                            })
                            .collect();
                        Err(format!("Some NFTs failed to mint: {:?}", errors))
                    }
                },
                Err(e) => Err(format!("Failed to decode response: {}", e)),
            }
        },
        Err((code, msg)) => Err(format!("Error calling icrcX_mint: {:?} - {}", code, msg))
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