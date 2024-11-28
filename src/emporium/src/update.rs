use crate::{
    utils::{
        get_principal, is_owner, Account, TransferArg, TransferFromArg, TransferFromError,
        TransferFromResult, EMPORIUM_CANISTER_ID, ICRC7_CANISTER_ID,
    },
    Nft, LISTING,
};
use candid::{CandidType, Nat, Principal};
use candid::{Decode, Encode};
use ic_cdk::{
    api::call::{self, result, CallResult, RejectionCode},
    caller, update,
};
use icrc_ledger_types::icrc1::account::Account as AccountIcrc;
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs as TransferFromArgsIcrc, TransferFromError as TransferFromErrorIcrc};
use icrc_ledger_types::icrc1::transfer::BlockIndex;

use ic_ledger_types::{
    AccountIdentifier,
    MAINNET_LEDGER_CANISTER_ID,
};
use serde::Deserialize;
#[update]
pub async fn list_nft(token_id: u64, icp_amount: u64) -> Result<String, String> {
    //check ownership
    //desposit nft to canister
    //add record to listing
    match is_owner(caller(), token_id).await {
        Ok(true) => {}
        Ok(false) => return Err("You can't list this NFT, ownership proof failed!".to_string()),
        Err(_) => return Err("Something went wrong !".to_string()),
    };
    // ic_cdk::println!("Yees you are the owner!!! :D");
    deposit_nft_to_canister(token_id).await?;

    LISTING.with(|nfts| -> Result<(), String> {
        let mut nft_map = nfts.borrow_mut();
        let nft = match nft_map.get(&token_id) {
            Some(existing_nft_sale) => {
                return Err("Nft already on sale can't list ".to_string());
            }
            None => Nft {
                owner: caller(),
                price: icp_amount,
                token_id,
                status: "listed".to_string(),
            },
        };

        nft_map.insert(token_id, nft);
        Ok(())
    })?;

    Ok("Nft added for sale".to_string())
    // transfer
}
#[update]
pub async fn cancel_nft_listing(token_id: u64) -> Result<String, String> {
    // Check if the caller is the owner
    LISTING.with(|nfts| -> Result<(), String> {
        let mut nft_map = nfts.borrow_mut();

        // Check exists
        match nft_map.get(&token_id) {
            Some(existing_nft_sale) => {
                if existing_nft_sale.owner != caller() {
                    return Err("You are not the owner of this NFT.".to_string());
                }

                nft_map.remove(&token_id);
                ic_cdk::println!("NFT with token_id {} removed from the listing.", token_id);
                Ok(())
            }
            None => Err("NFT not found in the listing.".to_string()),
        }
    })?;

    // Transfer the NFT back to the owner
    transfer_nft_from_canister(caller(), token_id).await?;

    Ok("Successfully cancelled the NFT listing.".to_string())
}
#[update]
pub async fn buy_nft(token_id: u64) -> Result<String, String> {
    // transfer ICP from caller to seller through tranfer approve
    // transfer NFT
    // delete record from sale
    deposit_icp_in_canister(1).await?;
    Ok("Success".to_string())
}

async fn deposit_icp_in_canister(amount: u64) -> Result<BlockIndex, String> {
    pub const ICP_TRANSFER_FEE: u64 = 10_000;

    let canister_id = ic_cdk::api::id();
    let caller = ic_cdk::caller();

    let transfer_args = TransferFromArgsIcrc {
        from: AccountIcrc {
            owner: caller,
            subaccount: None,
        },
        to: AccountIcrc {
            owner: canister_id,
            subaccount: None,
        },
        amount: amount.into(),
        fee: Some(Nat::from(ICP_TRANSFER_FEE)),
        memo: None,
        created_at_time: None,
        spender_subaccount: None,
    };

    ic_cdk::call::<(TransferFromArgsIcrc,), (Result<BlockIndex, TransferFromError>,)>(
        MAINNET_LEDGER_CANISTER_ID,
        "icrc2_transfer_from",
        (transfer_args,),
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    .0
    .map_err(|e: TransferFromError| format!("ledger transfer error {:?}", e))
}

pub async fn deposit_nft_to_canister(token_id: u64) -> Result<String, String> {
    let nft_canister: Principal = get_principal(ICRC7_CANISTER_ID);

    let transfer_arg = vec![TransferFromArg {
        spender_subaccount: None,
        from: Account {
            owner: caller(),
            subaccount: None,
        },
        to: Account {
            owner: get_principal(EMPORIUM_CANISTER_ID),
            subaccount: None,
        },
        token_id: Nat::from(token_id),
        memo: None,
        created_at_time: None,
    }];

    let call_result: ic_cdk::api::call::CallResult<(Vec<Option<TransferFromResult>>,)> =
        ic_cdk::call(nft_canister, "icrc37_transfer_from", (transfer_arg,)).await;

    ic_cdk::println!("Raw call result: {:?}", call_result);

    match call_result {
        // Call-level success
        Ok((results,)) => {
            if let Some(first_result) = results.get(0) {
                ic_cdk::println!("Result is {:?}", first_result);

                match first_result {
                    // Operation succeeded
                    Some(TransferFromResult::Ok(transaction_index)) => {
                        return Ok(format!(
                            "Successfully transferred. Transaction index: {}",
                            transaction_index
                        ));
                    }
                    // Operation-level error
                    Some(TransferFromResult::Err(error)) => {
                        let error_message = match error {
                            TransferFromError::InvalidRecipient => "Invalid recipient.".to_string(),
                            TransferFromError::Unauthorized => "Unauthorized.".to_string(),
                            TransferFromError::NonExistingTokenId => {
                                "Non-existing token ID.".to_string()
                            }
                            TransferFromError::TooOld => "Request is too old.".to_string(),
                            TransferFromError::CreatedInFuture { ledger_time } => {
                                format!("Created in the future at ledger time: {}.", ledger_time)
                            }
                            TransferFromError::Duplicate { duplicate_of } => {
                                format!("Duplicate transaction. Duplicate of {}.", duplicate_of)
                            }
                            TransferFromError::GenericError {
                                error_code,
                                message,
                            } => {
                                format!("Error {}: {}.", error_code, message)
                            }
                            TransferFromError::GenericBatchError {
                                error_code,
                                message,
                            } => {
                                format!("Batch error {}: {}.", error_code, message)
                            }
                        };
                        return Err(format!("Transfer failed: {}", error_message));
                    }
                    // Expected None result for successfull
                    None => {
                        return Ok("Successfully transferred.".to_string());
                    }
                }
            } else {
                return Err("Transfer failed: No results returned.".to_string());
            }
        }
        // Call-level failure
        Err((code, msg)) => Err(format!(
            "Transfer call failed with error {}: {}",
            code as u8, msg
        )),
    }
}

pub async fn transfer_nft_from_canister(
    destination: Principal,
    token_id: u64,
) -> Result<String, String> {
    let nft_canister: Principal = get_principal(ICRC7_CANISTER_ID);

    let transfer_arg = vec![TransferArg {
        from_subaccount: None,
        to: Account {
            owner: destination,
            subaccount: None,
        },
        token_id: Nat::from(token_id),
        memo: None,
        created_at_time: None,
    }];

    let call_result: ic_cdk::api::call::CallResult<()> =
        ic_cdk::call(nft_canister, "icrc7_transfer", (transfer_arg,)).await;

    match call_result {
        Ok(()) => Ok("Successfully transferred to buyer".to_string()),
        Err((code, msg)) => Err(format!("Transfer error {}: {}.", code as u8, msg)),
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Block {
    pub id: Nat,
    pub block: Option<BlockVariant>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum BlockVariant {
    Map(Vec<MapEntry>),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct MapEntry {
    pub key: String,
    pub value: DynamicValue,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum DynamicValue {
    Map(Vec<MapEntry>),
    Nat(Nat),
    Blob(Vec<u8>),
    Text(String),
    Array(Vec<DynamicValue>),
    Null,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct BlockRequest {
    pub start: Nat,
    pub length: Nat,
}

#[ic_cdk::update]
pub async fn icrc3_get_blocks(start: u128, length: u128) -> Result<Vec<Block>, String> {
    let nft_canister = get_principal(ICRC7_CANISTER_ID);

    let start = Nat::from(start);
    let length = Nat::from(length);

    let block_request = BlockRequest {
        start: start.clone(),
        length: length.clone(),
    };
    let result: Result<(Vec<Block>, Nat), (RejectionCode, String)> =
        ic_cdk::call(nft_canister, "icrc3_get_blocks", (vec![block_request],)).await;

    match result {
        Ok((blocks, log_length)) => {
            ic_cdk::println!("Log Length: {:?}", log_length);

            for (index, block) in blocks.iter().enumerate() {
                ic_cdk::println!("Block {}: ID = {:?}", index, block.id);

                if let Some(block_variant) = &block.block {
                    match block_variant {
                        BlockVariant::Map(entries) => {
                            ic_cdk::println!("  Entries count: {}", entries.len());
                            for (entry_index, entry) in entries.iter().enumerate() {
                                ic_cdk::println!("  Entry {}: Key = {}", entry_index, entry.key);
                                ic_cdk::println!(
                                    "  Entry {}: Value = {:?}",
                                    entry_index,
                                    entry.value
                                );
                            }
                        }
                    }
                } else {
                    ic_cdk::println!("  No block data");
                }
            }

            Ok(blocks)
        }
        Err((code, message)) => {
            ic_cdk::println!("Error details: {}", message);
            Err(format!("Call error: {:?} - {}", code, message))
        }
    }

    // match ic_cdk::call::<(Vec<BlockRequest>,), (Vec<Block>, Nat)>(
    //     nft_canister,
    //     "icrc3_get_blocks",
    //     (vec![block_request],)
    // ).await {
    //     Ok((blocks, log_length)) => {
    //         ic_cdk::println!("Log Length: {:?}", log_length);

    //         for (index, block) in blocks.iter().enumerate() {
    //             ic_cdk::println!("Block {}: ID = {:?}", index, block.id);

    //             if let Some(block_variant) = &block.block {
    //                 match block_variant {
    //                     BlockVariant::Map(entries) => {
    //                         ic_cdk::println!("  Entries count: {}", entries.len());
    //                         for (entry_index, entry) in entries.iter().enumerate() {
    //                             ic_cdk::println!("  Entry {}: Key = {}", entry_index, entry.key);
    //                             ic_cdk::println!("  Entry {}: Value = {:?}", entry_index, entry.value);
    //                         }
    //                     }
    //                 }
    //             } else {
    //                 ic_cdk::println!("  No block data");
    //             }
    //         }

    //         Ok(blocks)
    //     }
    //     Err((code, message)) => {
    //         ic_cdk::println!("Error details: {}", message);
    //         Err(format!("Call error: {:?} - {}", code, message))
    //     }
    // }
}

// #[ic_cdk::query]
// pub async fn icrc3_get_blocks(start: u128, length: u128) -> Result<(), String> {
//     let nft_canister = get_principal(ICRC7_CANISTER_ID);
//     let start = Nat::from(1 as u32); // Use Nat for start
//     let length = Nat::from(10 as u32) ; // Use Nat for length

//     let block_request = BlockRequest {
//         start:candid::Nat(start.0.clone()),
//         length:candid::Nat(start.0.clone()),
//     };

//     // Create the request
//     let block_request = BlockRequest { start, length };

//     let result: ic_cdk::api::call::CallResult<(Vec<Block>, u128)> =ic_cdk::call(nft_canister, "icrc3_get_blocks", (vec![block_request],)).await;
//     // Handle the call result
//     let res = match result {
//         Ok((o)) => (ic_cdk::println!("tt {:?}",o)),
//         Err((code, message)) => {
//             return Err(format!("Call error: {:?} - {}", code, message));
//         }
//     };
//     ic_cdk::println!("sdd {:?}", res);
//     // // Filter blocks containing "7xfer" transactions
//     // let filtered_blocks: Vec<Block> = blocks
//     //     .into_iter()
//     //     .filter(|block| {
//     //         block
//     //             .block
//     //             .get("tx")
//     //             .and_then(|tx| {
//     //                 if let BlockData::Nested(tx_map) = tx {
//     //                     tx_map.get("op")
//     //                 } else {
//     //                     None
//     //                 }
//     //             })
//     //             .and_then(|op| {
//     //                 if let BlockData::String(op_str) = op {
//     //                     Some(op_str)
//     //                 } else {
//     //                     None
//     //                 }
//     //             })
//     //             .map_or(false, |op| op == "7xfer")
//     //     })
//     //     .collect();

//     Ok(())
// }
