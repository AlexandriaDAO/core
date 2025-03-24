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

