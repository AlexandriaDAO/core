use candid::{Nat, CandidType};
use serde::{Deserialize, Serialize};
use icrc_ledger_types::icrc1::{account::Account, transfer::NumTokens};


#[derive(CandidType, Serialize)]
pub struct PropertyShared {
    pub name: String,
    pub value: CandyShared,
    pub immutable: bool,
}

#[derive(CandidType, Serialize)]
pub enum CandyShared {
    Text(String),
    Bool(bool),
}

#[derive(CandidType, Serialize)]
pub enum NFTInput {
    Class(Vec<PropertyShared>),
}

#[derive(CandidType, Serialize)]
pub struct SetNFTItemRequest {
    pub token_id: Nat,
    pub owner: Option<Account>,
    pub metadata: NFTInput,
    #[serde(rename = "override")]
    pub override_: bool,
    pub created_at_time: Option<u64>,
}

#[derive(CandidType, Deserialize, Serialize)]
pub struct TokenBalances {
    pub lbry: NumTokens,
    pub alex: NumTokens,
}

// icrc7_official TransferArgs
#[derive(candid::CandidType, serde::Deserialize)]
pub struct TransferArg {
    pub from_subaccount: Option<Vec<u8>>,
    pub to: Account,
    pub token_id: Nat,
    pub memo: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
}

#[derive(candid::CandidType, serde::Deserialize)]
pub enum TransferResult {
    Ok(Nat),
    Err(TransferError),
}

#[derive(candid::CandidType, serde::Deserialize, Debug)]
pub enum TransferError {
    pubNonExistingTokenId,
    InvalidRecipient,
    Unauthorized,
    TooOld,
    CreatedInFuture { ledger_time: u64 },
    Duplicate { duplicate_of: Nat },
    GenericError { error_code: Nat, message: String },
    GenericBatchError { error_code: Nat, message: String },
}