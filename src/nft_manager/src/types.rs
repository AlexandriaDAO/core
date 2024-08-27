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