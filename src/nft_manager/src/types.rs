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
    PubNonExistingTokenId,
    InvalidRecipient,
    Unauthorized,
    TooOld,
    CreatedInFuture { ledger_time: u64 },
    Duplicate { duplicate_of: Nat },
    GenericError { error_code: Nat, message: String },
    GenericBatchError { error_code: Nat, message: String },
}


// burn_nft types:

#[derive(CandidType, Deserialize, Debug)]
pub struct BurnRequest {
    pub memo: Option<Vec<u8>>,
    pub tokens: Vec<Nat>,
    pub created_at_time: Option<u64>,
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


// for get_stakes() from icp_swap
#[derive(CandidType, Deserialize, Clone)]
pub struct Stake {
    pub amount: u64,
    pub time: u64,
    pub reward_icp: u64,
}