use candid::{CandidType, Nat, Principal};
use ic_cdk::api::call::CallResult;
use serde::Deserialize;

use crate::LISTING;
pub const ICRC7_CANISTER_ID: &str = "53ewn-qqaaa-aaaap-qkmqq-cai";
pub const EMPORIUM_CANISTER_ID: &str = "be2us-64aaa-aaaaa-qaabq-cai";

#[derive(CandidType, Deserialize, Debug)]
struct OwnerInfo {
    owner: Principal,
    subaccount: Option<Vec<u8>>,
}

pub async fn is_owner(principal: Principal, token_id: u64) -> Result<bool, String> {
    let nft_canister = get_principal(ICRC7_CANISTER_ID);

    let args = vec![Nat::from(token_id)];

    let call_result: CallResult<(Vec<Option<OwnerInfo>>,)> =
        ic_cdk::call(nft_canister, "icrc7_owner_of", (args,)).await;
    ic_cdk::println!("Result {:?}", call_result);

    match call_result {
        Ok((owners,)) => {
            let is_owner = owners.iter().flatten().any(|info| info.owner == principal);
            Ok(is_owner)
        }
        Err((code, msg)) => {
            ic_cdk::println!("Error code: {}, message: {}", code as u8, msg);
            Err(format!("Error {}: {}", code as u8, msg))
        }
    }
}
pub fn remove_nft_from_listing(token_id: u64) -> Result<String, String> {
    LISTING.with(|nfts| -> Result<(), String> {
        let mut nft_map = nfts.borrow_mut();

        // Check exists
        match nft_map.get(&token_id) {
            Some(_existing_nft_sale) => {
                nft_map.remove(&token_id);
                ic_cdk::println!("NFT with token_id {} removed from the listing.", token_id);
                Ok(())
            }
            None => return Err("NFT not found in the listing.".to_string()),
        }
    })?;
    Ok("NFT removed from the listing.".to_string())
}
pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Account {
    pub owner: Principal,
    pub subaccount: Option<Vec<u8>>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TransferFromArg {
    pub spender_subaccount: Option<Vec<u8>>,
    pub from: Account,
    pub to: Account,
    pub token_id: Nat,
    pub memo: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TransferArg {
    pub from_subaccount: Option<Vec<u8>>,
    pub to: Account,
    pub token_id: Nat,
    pub memo: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum TransferFromResult {
    Ok(u64), // Transaction index for successful transfer
    Err(TransferFromError),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum TransferFromError {
    InvalidRecipient,
    Unauthorized,
    NonExistingTokenId,
    TooOld,
    CreatedInFuture { ledger_time: u64 },
    Duplicate { duplicate_of: u64 },
    GenericError { error_code: u64, message: String },
    GenericBatchError { error_code: u64, message: String },
}

#[derive(CandidType, Deserialize, Debug)]
pub enum TransferResult {
    Ok(Nat), // Transaction index for successful transfer
    Err(TransferError),
}

#[derive(CandidType, Deserialize, Debug)]
pub enum TransferError {
    NonExistingTokenId,
    InvalidRecipient,
    Unauthorized,
    TooOld,
    CreatedInFuture { ledger_time: u64 },
    Duplicate { duplicate_of: Nat },
    GenericError { error_code: Nat, message: String },
    GenericBatchError { error_code: Nat, message: String },
}
