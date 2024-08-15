use candid::{CandidType, Principal};
use icrc_ledger_types::icrc::generic_value::Value;

use serde_derive::{Deserialize, Serialize};
use std::marker::PhantomData;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct Block(Value);

impl Block {
    pub fn value(&self) -> &Value {
        &self.0
    }

    pub fn value_mut(&mut self) -> &mut Value {
        &mut self.0
    }
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub enum IndexType {
    Managed,
    Stable,
    StableTyped,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ArchiveInitArgs {
    pub first_index: u128,
    pub index_type: IndexType,
    pub max_pages: u128,
    pub max_records: u128,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct QueryBlock {
    pub id: u128,
    pub block: Value,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct GetBlocksResult {
    pub blocks: Vec<QueryBlock>,
    pub log_length: u128,
    pub archived_blocks: Vec<ArchivedTransactionResponse>,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct GetTransactionsResult {
    pub blocks: Vec<ArchivedTransactionResponse>,
    pub log_length: u128,
    pub archived_blocks: Vec<u8>,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct TransactionRange {
    pub start: u128,
    pub length: u128,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct ArchivedTransactionResponse {
    pub args: Vec<TransactionRange>,
    pub callback: QueryTransactionsFn,
}

pub type QueryTransactionsFn = GetTransactionsFn<Vec<QueryBlock>, GetTransactionsResult>;

#[derive(Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(try_from = "candid::types::reference::Func")]
pub struct GetTransactionsFn<Input: CandidType, Output: CandidType> {
    pub canister_id: Principal,
    pub method: String,
    pub _marker: PhantomData<(Input, Output)>,
}

impl<Input: CandidType, Output: CandidType> GetTransactionsFn<Input, Output> {
    pub fn new(canister_id: Principal, method: impl Into<String>) -> Self {
        Self {
            canister_id,
            method: method.into(),
            _marker: PhantomData,
        }
    }
}

impl<Input: CandidType, Output: CandidType> Clone for GetTransactionsFn<Input, Output> {
    fn clone(&self) -> Self {
        Self {
            canister_id: self.canister_id,
            method: self.method.clone(),
            _marker: PhantomData,
        }
    }
}

impl<Input: CandidType, Output: CandidType> From<GetTransactionsFn<Input, Output>>
    for candid::types::reference::Func
{
    fn from(get_transactions_fn: GetTransactionsFn<Input, Output>) -> Self {
        let p: &Principal = &Principal::try_from(get_transactions_fn.canister_id.as_ref())
            .expect("could not deserialize principal");
        Self {
            principal: *p,
            method: get_transactions_fn.method,
        }
    }
}

impl<Input: CandidType, Output: CandidType> TryFrom<candid::types::reference::Func>
    for GetTransactionsFn<Input, Output>
{
    type Error = String;
    fn try_from(func: candid::types::reference::Func) -> Result<Self, Self::Error> {
        let canister_id = Principal::try_from(func.principal.as_slice())
            .map_err(|e| format!("principal is not a canister id: {}", e))?;
        Ok(GetTransactionsFn {
            canister_id,
            method: func.method,
            _marker: PhantomData,
        })
    }
}

impl<Input: CandidType, Output: CandidType> CandidType for GetTransactionsFn<Input, Output> {
    fn _ty() -> candid::types::Type {
        candid::func!((Input) -> (Output) query)
    }

    fn idl_serialize<S>(&self, serializer: S) -> Result<(), S::Error>
    where
        S: candid::types::Serializer,
    {
        candid::types::reference::Func::from(self.clone()).idl_serialize(serializer)
    }
}
