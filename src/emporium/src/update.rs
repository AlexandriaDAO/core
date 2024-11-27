use std::collections::HashMap;

use candid::{CandidType, Nat, Principal};
use ic_cdk::{api::call::{self, result, RejectionCode}, caller, update};
use serde::Deserialize;

use crate::{
    utils::{get_principal, is_owner, EMPORIUM_CANISTER_ID, ICRC7_CANISTER_ID},
    Nft, LISTING,
};
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
    //desposit_nft_to_canister(token_id).await?;

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
pub async fn cancel_nft_listing(token_id: u64) -> Result<String, String> {
    //nft transfer to owner
    //delete record from storage

    Ok("Successfully cancelled ".to_string())
}

pub async fn desposit_nft_to_canister(token_id: u64) -> Result<String, String> {
    let nft_canister: Principal = get_principal(ICRC7_CANISTER_ID);

    let args = (caller(), get_principal(EMPORIUM_CANISTER_ID), token_id);
    let call_result: ic_cdk::api::call::CallResult<()> =
        ic_cdk::call(nft_canister, "icrc37_transfer_from", (args,)).await;

    match call_result {
        Ok(()) => Ok(("Sucessfully transafered").to_string()),
        Err((code, msg)) => Err(format!("Transfer error {}: {}", code as u8, msg)),
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
    let result: Result<(Vec<Block>, Nat), (RejectionCode, String)> = ic_cdk::call(
        nft_canister,
        "icrc3_get_blocks",
        (vec![block_request],),
    ).await;
    
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
                                ic_cdk::println!("  Entry {}: Value = {:?}", entry_index, entry.value);
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
