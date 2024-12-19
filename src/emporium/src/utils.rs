use candid::{CandidType, Nat, Principal};
use ic_cdk::api::call::CallResult;
use ic_cdk::{call, caller};
use serde::Deserialize;

use crate::LISTING;
pub const ICRC7_CANISTER_ID: &str = "53ewn-qqaaa-aaaap-qkmqq-cai";
pub const EMPORIUM_CANISTER_ID: &str = "zdcg2-dqaaa-aaaap-qpnha-cai";
pub const NFT_MANAGER_CANISTER_ID: &str = "5sh5r-gyaaa-aaaap-qkmra-cai";
pub const LBRY_CANISTER_ID: &str = "y33wz-myaaa-aaaap-qkmna-cai";


#[derive(CandidType, Deserialize, Debug)]
struct OwnerInfo {
    owner: Principal,
    subaccount: Option<Vec<u8>>,
}

pub async fn is_owner(principal: Principal, token_id: Nat) -> Result<bool, String> {
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
pub fn remove_nft_from_listing(token_id: Nat) -> Result<String, String> {
    LISTING.with(|nfts| -> Result<(), String> {
        let mut nft_map = nfts.borrow_mut();

        // Check exists
        match nft_map.get(&token_id.to_string()) {
            Some(_existing_nft_sale) => {
                nft_map.remove(&token_id.to_string());
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

pub async fn call_deduct_marketplace_fee() -> Result<String, String> {
    let nft_manager = get_principal(NFT_MANAGER_CANISTER_ID);
    let user = caller();

    // Make the cross-canister call
    match call::<(Principal,), (Result<String, String>,)>(
        nft_manager,
        "deduct_marketplace_fee",
        (user,),
    )
    .await
    {
        Ok((result,)) => {
            // Unwrap the inner Result
            match result {
                Ok(success_msg) => Ok(success_msg),
                Err(error_msg) => Err(format!("NFT Manager returned error: {}", error_msg)),
            }
        }
        Err((code, msg)) => Err(format!(
            "NFT manager canister call failed with code {:?}: {}",
            code, msg
        )),
    }
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
