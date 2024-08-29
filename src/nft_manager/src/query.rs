use crate::{alex_principal, icrc7_principal, lbry_principal};
use crate::utils::{check_query_batch_size, to_nft_subaccount};
use crate::types::TokenBalances;
use crate::guard::is_frontend;

use ic_cdk::update;
use std::collections::BTreeMap;
use candid::{Nat, Principal};
use ic_cdk::api::call::CallResult;
use icrc_ledger_types::icrc1::transfer::NumTokens;
use icrc_ledger_types::{icrc::generic_value::Value, icrc1::account::Account};

const LBRY_FEE: u64 = 4_000_000;
const ALEX_FEE: u64 = 10_000;


#[update(guard = "is_frontend")]
pub async fn total_supply() -> Result<Nat, String> {

    let call_result: CallResult<(Nat,)> = ic_cdk::call(
        icrc7_principal(),
        "icrc7_total_supply",
        ()
    ).await;

    match call_result {
        Ok((total_supply,)) => Ok(total_supply),
        Err((code, msg)) => Err(format!("Error calling icrc7_total_supply: {:?} - {}", code, msg))
    }
}


#[update(guard = "is_frontend")]
pub async fn get_tokens(start: Option<Nat>, end: Option<Nat>) -> Result<Vec<Nat>, String> {
    let start = start.unwrap_or_else(|| Nat::from(0u64));
    let end = end.unwrap_or_else(|| {
        let nine_nine_nine = Nat::from(999u64);
        start.clone() + nine_nine_nine
    });

    // Adjust the range calculation to be inclusive
    let range = end.clone() - start.clone() + Nat::from(1u64);
    if range > Nat::from(1000u64) {
        return Err("Range must not exceed 1000".to_string());
    }

    // Adjust the end parameter to be inclusive
    let adjusted_end = end.clone() + Nat::from(1u64);

    let tokens_call_result: CallResult<(Vec<Nat>,)> = ic_cdk::call(
        icrc7_principal(),
        "icrc7_tokens",
        (Some(start), Some(adjusted_end))
    ).await;

    match tokens_call_result {
        Ok((mut ids,)) => {
            ids.sort(); // Sort the IDs in ascending order
            ic_cdk::println!("Retrieved and sorted token IDs: {:?}", ids);
            Ok(ids)
        },
        Err((code, msg)) => {
            Err(format!("Error fetching token IDs: {:?} - {}", code, msg))
        }
    }
}


#[update(guard = "is_frontend")]
pub async fn get_nft_balances(mint_number: Nat) -> Result<TokenBalances, String> {
    let account = Account {
        owner: ic_cdk::id(),
        subaccount: Some(to_nft_subaccount(mint_number)),
    };

    // Get the LBRY balance
    let lbry_balance = ic_cdk::call::<(Account,), (NumTokens,)>(
        lbry_principal(),
        "icrc1_balance_of",
        (account,),
    )
    .await
    .map_err(|e| format!("Failed to get LBRY balance: {:?}", e))?
    .0;

    // Get the ALEX balance
    let alex_balance = ic_cdk::call::<(Account,), (NumTokens,)>(
        alex_principal(),
        "icrc1_balance_of",
        (account,),
    )
    .await
    .map_err(|e| format!("Failed to get ALEX balance: {:?}", e))?
    .0;

    let lbry_fee = NumTokens::from(LBRY_FEE);
    let alex_fee = NumTokens::from(ALEX_FEE);

    Ok(TokenBalances {
        lbry: if lbry_balance > lbry_fee { lbry_balance - lbry_fee } else { NumTokens::from(0u64) },
        alex: if alex_balance > alex_fee { alex_balance - alex_fee } else { NumTokens::from(0u64) },
    })
}

#[update(guard = "is_frontend")]
pub async fn nft_exists(token_id: Nat) -> Result<bool, String> {

  let owner_call_result: CallResult<(Vec<Option<Account>>,)> = ic_cdk::call(
      icrc7_principal(),
      "icrc7_owner_of",
      (vec![token_id.clone()],)
  ).await;

  match owner_call_result {
      Ok((owner_results,)) => {
          if let Some(Some(_)) = owner_results.first() {
              Ok(true)
          } else {
              Ok(false)
          }
      },
      Err((code, msg)) => {
          Err(format!("Error checking if NFT exists for token {}: {:?} - {}", token_id, code, msg))
      }
  }
}

#[update(guard = "is_frontend")]
pub async fn batch_nft_exists(token_ids: Vec<Nat>) -> Result<Vec<bool>, String> {
    check_query_batch_size(&token_ids)?;

    let owner_call_result: CallResult<(Vec<Option<Account>>,)> = ic_cdk::call(
      icrc7_principal(),
      "icrc7_owner_of",
      (token_ids.clone(),)
  ).await;

  match owner_call_result {
      Ok((owner_results,)) => {
          let exists_vec: Vec<bool> = owner_results.into_iter()
              .map(|result| result.is_some())
              .collect();
          Ok(exists_vec)
      },
      Err((code, msg)) => {
          Err(format!("Error checking if NFTs exist: {:?} - {}", code, msg))
      }
  }
}


#[update(guard = "is_frontend")]
pub async fn get_owner(token_id: Nat) -> Result<Option<Account>, String> {

    let owner_call_result: CallResult<(Vec<Option<Account>>,)> = ic_cdk::call(
        icrc7_principal(),
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


#[update(guard = "is_frontend")]
pub async fn get_nfts_of(owner: Principal) -> Result<Vec<(Nat, Option<String>)>, String> {
    let account = Account {
        owner,
        subaccount: None,
    };

    let tokens_call_result: CallResult<(Vec<Nat>,)> = ic_cdk::call(
        icrc7_principal(),
        "icrc7_tokens_of",
        (account, None::<Nat>, None::<Nat>)
    ).await;

    match tokens_call_result {
        Ok((token_ids,)) => {
            let mut nfts = Vec::new();
            for token_id in token_ids {
                let description = get_nft_manifest(token_id.clone()).await?;
                nfts.push((token_id, description));
            }
            Ok(nfts)
        },
        Err((code, msg)) => {
            Err(format!("Error fetching tokens for owner {}: {:?} - {}", owner, code, msg))
        }
    }
}


#[update(guard = "is_frontend")]
pub async fn get_metadata(token_id: Nat) -> Result<Option<BTreeMap<String, Value>>, String> {

    let metadata_call_result: CallResult<(Vec<Option<BTreeMap<String, Value>>>,)> = ic_cdk::call(
        icrc7_principal(),
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


#[update(guard = "is_frontend")]
pub async fn get_nft_manifest(token_id: Nat) -> Result<Option<String>, String> {
    if let Some(metadata) = get_metadata(token_id).await? {
        if let Some(description_value) = metadata.get("icrc7:metadata:uri:transactionId") {
            if let Value::Text(text) = description_value {
                return Ok(Some(text.clone()));
            }
        }
    }
    Ok(None)
}


#[update(guard = "is_frontend")]
pub async fn is_verified(token_id: Nat) -> Result<bool, String> {
  ic_cdk::println!("Checking verification status for token_id: {}", token_id);

  if !nft_exists(token_id.clone()).await? {
      return Err(format!("NFT with token_id {} does not exist", token_id));
  }

  ic_cdk::println!("Calling icrc7_token_metadata for token_id: {}", token_id);
  let metadata_call_result: CallResult<(Vec<Option<BTreeMap<String, Value>>>,)> = ic_cdk::call(
      icrc7_principal(),
      "icrc7_token_metadata",
      (vec![token_id.clone()],)
  ).await;

  match metadata_call_result {
      Ok((metadata,)) => {
          ic_cdk::println!("Received raw metadata: {:?}", metadata);
          if let Some(Some(token_metadata)) = metadata.into_iter().next() {
              ic_cdk::println!("Token metadata for {}: {:?}", token_id, token_metadata);
              if let Some(Value::Blob(blob)) = token_metadata.get("icrc7:metadata:verified") {
                  ic_cdk::println!("Verification blob: {:?}", blob);
                  let is_verified = !blob.is_empty() && blob[0] == 1;
                  ic_cdk::println!("Parsed is_verified: {}", is_verified);
                  Ok(is_verified)
              } else {
                  ic_cdk::println!("No 'icrc7:metadata:verified' field found in metadata");
                  Ok(false)
              }
          } else {
              ic_cdk::println!("No metadata found for token_id: {}", token_id);
              Ok(false)
          }
      },
      Err((code, msg)) => {
          ic_cdk::println!("Error fetching metadata: code={:?}, msg={}", code, msg);
          Err(format!("Error fetching metadata for token {}: {:?} - {}", token_id, code, msg))
      }
  }
}

#[update(guard = "is_frontend")]
pub async fn batch_is_verified(token_ids: Vec<Nat>) -> Result<Vec<bool>, String> {
    check_query_batch_size(&token_ids)?;
    ic_cdk::println!("Checking verification status for token_ids: {:?}", token_ids);

    let exists_results = batch_nft_exists(token_ids.clone()).await?;
    if exists_results.iter().any(|&exists| !exists) {
        return Err(format!("One or more NFTs in {:?} do not exist", token_ids));
    }

    ic_cdk::println!("Calling icrc7_token_metadata for token_ids: {:?}", token_ids);
    let metadata_call_result: CallResult<(Vec<Option<BTreeMap<String, Value>>>,)> = ic_cdk::call(
        icrc7_principal(),
        "icrc7_token_metadata",
        (token_ids.clone(),)
    ).await;

    match metadata_call_result {
        Ok((metadata,)) => {
            ic_cdk::println!("Received raw metadata: {:?}", metadata);
            let verified_statuses: Vec<bool> = metadata.into_iter()
                .map(|token_metadata| {
                    if let Some(token_metadata) = token_metadata {
                        if let Some(Value::Blob(blob)) = token_metadata.get("icrc7:metadata:verified") {
                            !blob.is_empty() && blob[0] == 1
                        } else {
                            false
                        }
                    } else {
                        false
                    }
                })
                .collect();
            ic_cdk::println!("Parsed verified statuses: {:?}", verified_statuses);
            Ok(verified_statuses)
        },
        Err((code, msg)) => {
            ic_cdk::println!("Error fetching metadata: code={:?}, msg={}", code, msg);
            Err(format!("Error fetching metadata for tokens {:?}: {:?} - {}", token_ids, code, msg))
        }
    }
}