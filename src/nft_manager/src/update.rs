use std::collections::BTreeMap;

use crate::{icrc7_principal, icrc7_scion_principal};
use crate::guard::*;
use crate::types::*;
use crate::utils::*;
use crate::query::*;

use ic_cdk::update;
use candid::{Nat, Principal};
use ic_cdk::caller;
use ic_cdk::api::call::CallResult;
use icrc_ledger_types::{icrc::generic_value::Value, icrc1::account::Account};

#[update(decoding_quota = 200, guard = "is_frontend")]
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

#[update(decoding_quota = 200, guard = "is_frontend")]
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


async fn fetch_metadata(valid_minting_numbers: Vec<Nat>) -> Result<Vec<Option<BTreeMap<String, Value>>>, String> {
    let metadata_call_result: CallResult<(Vec<Option<BTreeMap<String, Value>>>,)> = ic_cdk::call(
        icrc7_principal(),
        "icrc7_token_metadata",
        (valid_minting_numbers.clone(),)
    ).await;

    match metadata_call_result {
        Ok((metadata,)) => Ok(metadata),
        Err((code, msg)) => Err(format!("Error fetching metadata: {:?} - {}", code, msg)),
    }
}

async fn prepare_nft_requests(valid_minting_numbers: Vec<Nat>, metadata: Vec<Option<BTreeMap<String, Value>>>, owner: Principal) -> Vec<SetNFTItemRequest> {
    valid_minting_numbers.iter().zip(metadata.iter()).filter_map(|(token_id, token_metadata)| {
        let description = token_metadata.as_ref().and_then(|metadata| {
            metadata.get("icrc7:metadata:uri:description")
                .and_then(|value| match value {
                    Value::Text(s) => Some(s.clone()),
                    _ => None,
                })
        });

        description.map(|desc| SetNFTItemRequest {
            token_id: token_id.clone(),
            owner: Some(Account::from(owner)),
            metadata: NFTInput::Class(vec![
                PropertyShared {
                    name: "icrc7:metadata:uri:description".to_string(),
                    value: CandyShared::Text(desc),
                    immutable: true,
                },
            ]),
            override_: true,
            created_at_time: Some(ic_cdk::api::time()),
        })
    }).collect()
}


#[update(guard = "not_anon")] // TODO: Must guard for DAO only, or make private.
pub async fn burn_to_lbry(minting_numbers: Vec<Nat>) -> Result<String, String> {
    check_update_batch_size(&minting_numbers)?;

    let original_count = minting_numbers.len();
    let target_principal = Principal::from_text("5sh5r-gyaaa-aaaap-qkmra-cai").unwrap();

    let caller = caller();
    let owner_results = is_owner(minting_numbers.clone(), caller).await?;

    let valid_nfts: Vec<Nat> = minting_numbers.into_iter()
        .zip(owner_results.into_iter())
        .filter_map(|(nft, is_owner)| {
            if is_owner {
                Some(nft)
            } else {
                None
            }
        })
        .collect();

    if valid_nfts.is_empty() {
        return Ok("No valid NFTs to burn.".to_string());
    }

    let metadata = fetch_metadata(valid_nfts.clone()).await?;

    let nft_requests = prepare_nft_requests(valid_nfts, metadata, target_principal).await;

    if nft_requests.is_empty() {
        return Ok("No valid NFTs to burn after metadata check.".to_string());
    }

    let nft_requests_count = nft_requests.len();

    let call_result: CallResult<()> = ic_cdk::call(
        icrc7_principal(),
        "icrcX_mint",
        (nft_requests,)
    ).await;

    match call_result {
        Ok(_) => {
            let burned_count = nft_requests_count;
            let skipped_count = original_count - burned_count;
            Ok(format!("{} NFTs successfully burned. {} NFTs skipped (not owned by caller).", burned_count, skipped_count))
        },
        Err((code, msg)) => Err(format!("Error calling icrcX_mint: {:?} - {}", code, msg))
    }
}