use candid::{CandidType, Nat, Principal};
use ic_cdk::api::call::CallResult;
use icrc_ledger_types::icrc1::account::Account as AccountIcrc;
use icrc_ledger_types::icrc1::transfer::{
    TransferArg as TransferArgIcrc, TransferError as TransferErrorIcrc,
};
use serde::Deserialize;

use crate::{principal_to_subaccount, LISTING};
pub const ICRC7_CANISTER_ID: &str = "53ewn-qqaaa-aaaap-qkmqq-cai";
pub const EMPORIUM_CANISTER_ID: &str = "be2us-64aaa-aaaaa-qaabq-cai";
pub const LBRY_CANISTER_ID: &str = "y33wz-myaaa-aaaap-qkmna-cai";
const LBRY_LIST_COST: u64 = 1;
const LBRY_E8S: u64 = 100_000_000; // 10^8 for 8 decimal places
const LBRY_LISTING_COST_E8S: u64 = LBRY_LIST_COST * LBRY_E8S;

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

pub async fn verify_lbry_payment(
    from: Principal,
    to: Principal,
    to_subaccount: Option<Vec<u8>>,
) -> Result<bool, String> {
    // Get the user's subaccount for spending from NFT manager
    let from_subaccount = principal_to_subaccount(from);

    let transfer_arg = TransferArgIcrc {
        to: AccountIcrc {
            owner: to,
            subaccount: to_subaccount.map(|s| s.try_into().unwrap()),
        },
        fee: None,
        memo: None,
        // Set the from_subaccount to the user's spending account
        from_subaccount: Some(from_subaccount),
        created_at_time: None,
        amount: Nat::from(LBRY_LISTING_COST_E8S),
    };

    let transfer_result: CallResult<(Result<Nat, TransferErrorIcrc>,)> = ic_cdk::call(
        get_principal(LBRY_CANISTER_ID),
        "icrc1_transfer",
        (transfer_arg,),
    )
    .await;

    match transfer_result {
        Ok((result,)) => match result {
            Ok(_) => Ok(true),
            Err(e) => Err(format!("LBRY transfer failed: {:?}", e)),
        },
        Err((code, msg)) => Err(format!("Error calling LBRY canister: {:?} - {}", code, msg)),
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
