use crate::icrc7_principal;
use crate::types::*;
use crate::utils::*;
use crate::query::*;

use candid::Nat;
use ic_cdk::api::call::CallResult;
use ic_cdk::caller;
use icrc_ledger_types::{icrc::generic_value::Value, icrc1::account::Account};

#[ic_cdk::update]
pub async fn mint_nft(description: String, minting_number: Nat) -> Result<String, String> {

    if !is_within_32_digits(&minting_number.clone()) {
        return Err("Minting number must not exceed 32 digits".to_string());
    }

    if nft_exists(minting_number.clone()).await? {
        return Err("NFT already exists".to_string());
    }

    let new_token_id = minting_number;

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

// First I have to check that it exists and has an owner, and the verified feild is false and immutable.
#[ic_cdk::update]
pub async fn verify_nft(minting_number: Nat) -> Result<String, String> {
    if !nft_exists(minting_number.clone()).await? {
        return Err("NFT does not exist".to_string());
    }
    
    let existing_metadata = get_metadata(minting_number.clone()).await?;
    let existing_owner = get_owner(minting_number.clone()).await?;

    let description = existing_metadata
    .and_then(|metadata| {
        metadata.get("icrc7:metadata:uri:transactionId")
            .and_then(|value| match value {
                Value::Text(s) => Some(s.clone()),
                _ => None,
            })
    })
    .ok_or_else(|| "Description not found or not a string in existing metadata".to_string())?;

    let owner = existing_owner.ok_or_else(|| format!("No owner found for NFT# {}", minting_number))?;

    let nft_request = SetNFTItemRequest {
        token_id: minting_number,
        owner: Some(owner),
        metadata: NFTInput::Class(vec![
            PropertyShared {
                name: "icrc7:metadata:uri:transactionId".to_string(),
                value: CandyShared::Text(description),
                immutable: true,
            },
            PropertyShared {
                name: "icrc7:metadata:verified".to_string(),
                value: CandyShared::Bool(true),
                immutable: true,
            },
        ]),
        override_: true,
        created_at_time: Some(ic_cdk::api::time()),
    };

    let call_result: CallResult<()> = ic_cdk::call(
        icrc7_principal(),
        "icrcX_mint",
        (vec![nft_request],)
    ).await;

    match call_result {
        Ok(_) => Ok("NFT successfully verified.".to_string()),
        Err((code, msg)) => Err(format!("Error calling icrcX_mint: {:?} - {}", code, msg))
    }
}











