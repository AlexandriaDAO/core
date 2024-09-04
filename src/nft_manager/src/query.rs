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
pub async fn get_nfts(start: Option<Nat>, end: Option<Nat>) -> Result<Vec<Nat>, String> {
    let total_supply = total_supply().await?;

    let start = start.unwrap_or_else(|| {
        if total_supply >= Nat::from(100u64) {
            total_supply.clone() - Nat::from(100u64)
        } else {
            Nat::from(0u64)
        }
    });
    let end = end.unwrap_or_else(|| total_supply.clone());

    // Adjust the range calculation to be inclusive
    let range = end.clone() - start.clone() + Nat::from(1u64);
    if range > Nat::from(20000u64) {
        return Err("Range must not exceed 20000".to_string());
    }

    // Adjust the end parameter to be inclusive
    let adjusted_end = end.clone() + Nat::from(1u64);

    let tokens_call_result: CallResult<(Vec<Nat>,)> = ic_cdk::call(
        icrc7_principal(),
        "icrc7_tokens",
        (Some(start), Some(adjusted_end))
    ).await;

    match tokens_call_result {
        Ok((ids,)) => {
            ic_cdk::println!("Retrieved token IDs: {:?}", ids);
            Ok(ids)
        },
        Err((code, msg)) => {
            Err(format!("Error fetching token IDs: {:?} - {}", code, msg))
        }
    }
}


#[update(guard = "is_frontend")]
pub async fn get_nft_balances(mint_numbers: Vec<Nat>) -> Result<Vec<TokenBalances>, String> {
    if mint_numbers.len() >= 50 {
        return Err("Cannot process more than 49 tokens at a time".to_string());
    }
    
    check_query_batch_size(&mint_numbers)?;

    let mut results = Vec::new();

    for mint_number in mint_numbers {
        let account = Account {
            owner: ic_cdk::id(),
            subaccount: Some(to_nft_subaccount(mint_number.clone())),
        };

        // Get the LBRY balance
        let lbry_balance = ic_cdk::call::<(Account,), (NumTokens,)>(
            lbry_principal(),
            "icrc1_balance_of",
            (account.clone(),),
        )
        .await
        .map_err(|e| format!("Failed to get LBRY balance for NFT {}: {:?}", mint_number, e))?
        .0;

        // Get the ALEX balance
        let alex_balance = ic_cdk::call::<(Account,), (NumTokens,)>(
            alex_principal(),
            "icrc1_balance_of",
            (account,),
        )
        .await
        .map_err(|e| format!("Failed to get ALEX balance for NFT {}: {:?}", mint_number, e))?
        .0;

        let lbry_fee = NumTokens::from(LBRY_FEE);
        let alex_fee = NumTokens::from(ALEX_FEE);

        results.push(TokenBalances {
            lbry: if lbry_balance > lbry_fee { lbry_balance - lbry_fee } else { NumTokens::from(0u64) },
            alex: if alex_balance > alex_fee { alex_balance - alex_fee } else { NumTokens::from(0u64) },
        });
    }

    Ok(results)
}


#[update(guard = "is_frontend")]
pub async fn nfts_exist(token_ids: Vec<Nat>) -> Result<Vec<bool>, String> {
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


// #[update(guard = "is_frontend")]
// pub async fn owner_of(token_id: Nat) -> Result<Option<Account>, String> {

//     let owner_call_result: CallResult<(Vec<Option<Account>>,)> = ic_cdk::call(
//         icrc7_principal(),
//         "icrc7_owner_of",
//         (vec![token_id.clone()],)
//     ).await;

//     match owner_call_result {
//         Ok((owners,)) => {
//             Ok(owners.into_iter().next().unwrap_or(None))
//         },
//         Err((code, msg)) => {
//             Err(format!("Error fetching owner for token {}: {:?} - {}", token_id, code, msg))
//         }
//     }
// }


#[update(guard = "is_frontend")]
pub async fn owner_of(token_ids: Vec<Nat>) -> Result<Vec<Option<Account>>, String> {
    check_query_batch_size(&token_ids)?;

    let owner_call_result: CallResult<(Vec<Option<Account>>,)> = ic_cdk::call(
        icrc7_principal(),
        "icrc7_owner_of",
        (token_ids.clone(),)
    ).await;

    match owner_call_result {
        Ok((owners,)) => Ok(owners),
        Err((code, msg)) => {
            Err(format!("Error fetching owners for tokens {:?}: {:?} - {}", token_ids, code, msg))
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
        // (account, Some(Nat::from(0u64)), Some(Nat::from(20_000u64)))
    ).await;

    match tokens_call_result {
        Ok((token_ids,)) => {
            let manifests = get_manifest_ids(token_ids.clone()).await?;
            let nfts = token_ids.into_iter()
            .zip(manifests.into_iter())
            .collect();
            Ok(nfts)
        },
        Err((code, msg)) => {
            Err(format!("Error fetching tokens for owner {}: {:?} - {}", owner, code, msg))
        }
    }
}


#[update(guard = "is_frontend")]
pub async fn get_metadata(token_ids: Vec<Nat>) -> Result<Vec<Option<BTreeMap<String, Value>>>, String> {
    check_query_batch_size(&token_ids)?;

    let metadata_call_result: CallResult<(Vec<Option<BTreeMap<String, Value>>>,)> = ic_cdk::call(
        icrc7_principal(),
        "icrc7_token_metadata",
        (token_ids.clone(),)
    ).await;

    match metadata_call_result {
        Ok((metadata,)) => {
            Ok(metadata)
        },
        Err((code, msg)) => {
            Err(format!("Error fetching metadata for tokens {:?}: {:?} - {}", token_ids, code, msg))
        }
    }
}

#[update(guard = "is_frontend")]
pub async fn get_manifest_ids(token_ids: Vec<Nat>) -> Result<Vec<Option<String>>, String> {
    let manifests = get_metadata(token_ids).await?.into_iter().map(|metadata| {
        metadata.and_then(|m| {
            m.get("icrc7:metadata:uri:transactionId")
                .and_then(|value| {
                    if let Value::Text(text) = value {
                        Some(text.clone())
                    } else {
                        None
                    }
                })
        })
    }).collect();

    Ok(manifests)
}



#[update(guard = "is_frontend")]
pub async fn is_verified(token_ids: Vec<Nat>) -> Result<Vec<bool>, String> {
    check_query_batch_size(&token_ids)?;
    ic_cdk::println!("Checking verification status for token_ids: {:?}", token_ids);

    let exists_results = nfts_exist(token_ids.clone()).await?;
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

#[update(guard = "is_frontend")]
pub async fn get_my_nft_balances(slot: Option<Nat>) -> Result<Vec<(Nat, TokenBalances)>, String> {
    let caller = ic_cdk::api::caller();
    
    let nfts = get_nfts_of(caller).await
        .map_err(|e| format!("Failed to get NFTs: {}", e))?;
    
    let token_ids: Vec<Nat> = nfts.into_iter().map(|(id, _)| id).collect();
    let slot_size = 50;
    let start_index = slot.unwrap_or_default().0.clone().try_into().unwrap_or(0) * slot_size;
    let end_index = (start_index + slot_size).min(token_ids.len());
    
    if start_index >= token_ids.len() {
        return Ok(Vec::new());
    }
    
    let slot_token_ids = &token_ids[start_index..end_index];
    
    let batch_size = 49; // Maximum allowed by get_nft_balances
    let mut result = Vec::with_capacity(slot_token_ids.len());
    
    for chunk in slot_token_ids.chunks(batch_size) {
        match get_nft_balances(chunk.to_vec()).await {
            Ok(balances) => {
                result.extend(chunk.iter().cloned().zip(balances));
            },
            Err(e) => {
                ic_cdk::println!("Error fetching balances for batch: {}", e);
            }
        }
    }
    
    Ok(result)
}