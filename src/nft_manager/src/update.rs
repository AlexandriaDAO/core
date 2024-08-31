use std::collections::BTreeMap;

use crate::icrc7_principal;
use crate::guard::*;
use crate::types::*;
use crate::utils::*;
use crate::query::*;

use ic_cdk::api::time;
use ic_cdk::update;
use candid::{Nat, Principal};
use ic_cdk::api::call::CallResult;
use ic_cdk::caller;
use icrc_ledger_types::{icrc::generic_value::Value, icrc1::account::Account};


use candid::{CandidType, Deserialize};


#[update(guard = "not_anon")]
pub async fn mint_nft(description: String, minting_number: Nat) -> Result<String, String> {
    const MAX_DESCRIPTION_LENGTH: usize = 256;

    if description.len() > MAX_DESCRIPTION_LENGTH {
        return Err(format!("Description exceeds maximum length of {} bytes", MAX_DESCRIPTION_LENGTH));
    }

    if !is_within_32_digits(&minting_number.clone()) {
        return Err("Minting number must not exceed 32 digits".to_string());
    }

    if let Some(true) = nfts_exist(vec![minting_number.clone()]).await?.first() {
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

#[update] // TODO: Must guard for DAO only, or make private.
async fn verify_nfts(minting_numbers: Vec<Nat>, owner: Principal) -> Result<String, String> {
    check_update_batch_size(&minting_numbers)?;

    let original_count = minting_numbers.len();

    let exists_results = nfts_exist(minting_numbers.clone()).await?;
    let verified_results = is_verified(minting_numbers.clone()).await?;

    let valid_nfts: Vec<(Nat, bool)> = minting_numbers.into_iter()
        .zip(exists_results.into_iter())
        .zip(verified_results.into_iter())
        .filter_map(|((nft, exists), verified)| {
            if exists && !verified {
                Some((nft, exists))
            } else {
                None
            }
        })
        .collect();

    if valid_nfts.is_empty() {
        return Ok("No valid NFTs to verify.".to_string());
    }

    let valid_minting_numbers: Vec<Nat> = valid_nfts.iter().map(|(nft, _)| nft.clone()).collect();

    let metadata_call_result: CallResult<(Vec<Option<BTreeMap<String, Value>>>,)> = ic_cdk::call(
        icrc7_principal(),
        "icrc7_token_metadata",
        (valid_minting_numbers.clone(),)
    ).await;

    let metadata = match metadata_call_result {
        Ok((metadata,)) => metadata,
        Err((code, msg)) => return Err(format!("Error fetching metadata: {:?} - {}", code, msg)),
    };

    let nft_requests: Vec<SetNFTItemRequest> = valid_minting_numbers.iter().zip(metadata.iter()).filter_map(|(token_id, token_metadata)| {
        let description = token_metadata.as_ref().and_then(|metadata| {
            metadata.get("icrc7:metadata:uri:transactionId")
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
                    name: "icrc7:metadata:uri:transactionId".to_string(),
                    value: CandyShared::Text(desc),
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
        })
    }).collect();

    if nft_requests.is_empty() {
        return Ok("No valid NFTs to verify after metadata check.".to_string());
    }

    let nft_requests_count = nft_requests.len();

    let call_result: CallResult<()> = ic_cdk::call(
        icrc7_principal(),
        "icrcX_mint",
        (nft_requests,)
    ).await;

    match call_result {
        Ok(_) => {
            let verified_count = nft_requests_count;
            let skipped_count = original_count - verified_count;
            Ok(format!("{} NFTs successfully verified. {} NFTs skipped (already verified or non-existent).", verified_count, skipped_count))
        },
        Err((code, msg)) => Err(format!("Error calling icrcX_mint: {:?} - {}", code, msg))
    }
}













#[update(guard = "not_anon")]
pub async fn transfer_nft(token_id: Nat, to: Principal, from_subaccount: Option<Vec<u8>>, memo: Option<Vec<u8>>) -> Result<Nat, String> {
    let transfer_arg = TransferArg {
        to: Account {
            owner: to,
            subaccount: None,
        },
        token_id,
        memo,
        from_subaccount,
        created_at_time: Some(time()),
    };

    let call_result: CallResult<(Vec<Option<TransferResult>>,)> = ic_cdk::call(
        icrc7_principal(),
        "icrc7_transfer",
        (vec![transfer_arg],)
    ).await;

    match call_result {
        Ok((transfer_results,)) => match transfer_results.get(0).and_then(|r| r.as_ref()) {
            Some(TransferResult::Ok(transaction_index)) => Ok(transaction_index.clone()),
            Some(TransferResult::Err(transfer_error)) => Err(format!("Transfer failed: {:?}", transfer_error)),
            None => Err("No transfer result returned".to_string()),
        },
        Err((code, msg)) => Err(format!("Error calling icrc7_transfer: {:?} - {}", code, msg)),
    }
}







































/*
// This works like a charm.
linus@Henry:~/alexandria/core$ dfx canister call icrc7 icrcX_burn '(
    record {
      memo = null;
      tokens = vec { 2 : nat };
      created_at_time = null;
    }
  )'

// This does not work.
dfx canister call nft_manager mint_nft '("asdf", 2)'

dfx canister call nft_manager verify_nfts '(vec { 2 : nat }, principal "forhl-tiaaa-aaaak-qc7ga-cai")'

dfx canister call nft_manager burn_nft '(2 : nat)'

(
  variant {
    Err = "Error calling icrcX_burn: CanisterError - failed to decode canister response as (alloc::vec::Vec<nft_manager::update::BurnResult>,): Fail to decode argument 0"
  },
)
*/



#[derive(CandidType, Deserialize, Debug)]
struct BurnRequest {
    memo: Option<Vec<u8>>,
    tokens: Vec<Nat>,
    created_at_time: Option<u64>,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum BurnError {
    GenericError { message: String, error_code: Nat },
    NonExistingTokenId,
    InvalidBurn,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct BurnOk {
    pub token_id: Nat,
    pub result: BurnResult,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum BurnResult {
    Ok(Nat),
    Err(BurnError),
}

#[derive(CandidType, Deserialize, Debug)]
pub enum BurnResponse {
    Ok(Vec<BurnOk>),
    Err(BurnResponseError),
}

#[derive(CandidType, Deserialize, Debug)]
pub enum BurnResponseError {
    GenericError { message: String, error_code: Nat },
    Unauthorized,
    CreatedInFuture { ledger_time: u64 },
    TooOld,
}

use ic_cdk::println;

#[update(guard = "not_anon")]
pub async fn burn_nft(token_id: Nat) -> Result<BurnOk, String> {
    println!("Attempting to burn NFT with token_id: {:?}", token_id);

    if !is_verified(vec![token_id.clone()]).await?.first().unwrap_or(&false) {
        println!("NFT verification failed for token_id: {:?}", token_id);
        return Err("NFT is not verified".to_string());
    }

    let burn_request = BurnRequest {
        memo: None,
        tokens: vec![token_id.clone()],
        created_at_time: None,
    };

    println!("Sending burn request: {:?}", burn_request);

    let call_result: CallResult<(BurnResponse,)> = ic_cdk::call(
        icrc7_principal(),
        "icrcX_burn",
        (burn_request,)
    ).await;

    println!("Received call result: {:?}", call_result);

    match call_result {
        Ok((burn_response,)) => {
            println!("Burn response: {:?}", burn_response);
            match burn_response {
                BurnResponse::Ok(burn_results) => burn_results.into_iter().next()
                    .ok_or_else(|| {
                        println!("No burn result returned");
                        "No burn result returned".to_string()
                    }),
                BurnResponse::Err(err) => {
                    println!("Burn error: {:?}", err);
                    Err(format!("Burn error: {:?}", err))
                },
            }
        },
        Err((code, msg)) => {
            println!("Error calling icrcX_burn: {:?} - {}", code, msg);
            Err(format!("Error calling icrcX_burn: {:?} - {}", code, msg))
        },
    }
}

// icrc7_official TransferArgs
#[derive(CandidType, Deserialize)]
pub struct TransferArg {
    pub to: Account,
    pub token_id: Nat,
    pub memo: Option<Vec<u8>>,
    pub from_subaccount: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum TransferError {
    GenericError { message: String, error_code: Nat },
    Duplicate { duplicate_of: Nat },
    NonExistingTokenId,
    Unauthorized,
    CreatedInFuture { ledger_time: u64 },
    InvalidRecipient,
    GenericBatchError { message: String, error_code: Nat },
    TooOld,
}

#[derive(CandidType, Deserialize)]
pub enum TransferResult {
    Ok(Nat),
    Err(TransferError),
}




