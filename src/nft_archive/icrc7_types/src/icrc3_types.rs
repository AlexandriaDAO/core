use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_stable_structures::{storable::Bound, Storable};
use icrc_ledger_types::{
    icrc::generic_value::{Hash, Map, Value},
    icrc1::account::Account,
};
use std::{collections::BTreeMap, marker::PhantomData};

use serde::Serialize;
use serde_bytes::ByteBuf;
use std::ops::Deref;

use crate::icrc7_types::Transaction;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct Block(Value);

impl Storable for Block {
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        std::borrow::Cow::Owned(Encode!(self).unwrap())
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Block {
    pub fn value(&self) -> &Value {
        &self.0
    }

    pub fn value_mut(&mut self) -> &mut Value {
        &mut self.0
    }
}

impl AsRef<Value> for Block {
    #[inline]
    fn as_ref(&self) -> &Value {
        &self.0
    }
}

impl Deref for Block {
    type Target = Value;
    #[inline]
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl From<Map> for Block {
    fn from(value: Map) -> Self {
        Self(Value::Map(value))
    }
}

impl TryFrom<Value> for Block {
    type Error = String;
    fn try_from(value: Value) -> Result<Self, Self::Error> {
        match value {
            Value::Map(map) => Ok(Self(Value::Map(map))),
            _ => Err("block must be a map value".to_string()),
        }
    }
}

impl Block {
    pub fn new(phash: Option<Hash>, tx: Transaction) -> Self {
        let mut block = Map::new();
        if let Some(phash) = phash {
            block.insert("phash".to_string(), Value::Blob(ByteBuf::from(phash)));
        };

        block.insert("btype".to_string(), Value::Text(tx.op));
        block.insert("ts".to_string(), Value::Nat(tx.ts.into()));

        let mut val = Map::new();
        val.insert("tid".to_string(), Value::Nat(tx.tid.into()));
        if let Some(from) = tx.from {
            val.insert("from".to_string(), account_value(from));
        }
        if let Some(to) = tx.to {
            val.insert("to".to_string(), account_value(to));
        }
        if let Some(spender) = tx.spender {
            val.insert("spender".to_string(), account_value(spender));
        }
        if let Some(exp) = tx.exp {
            val.insert("exp".to_string(), Value::Nat(exp.into()));
        }
        if let Some(meta) = tx.meta {
            val.insert("meta".to_string(), Value::Map(meta));
        }
        if let Some(memo) = tx.memo {
            val.insert("memo".to_string(), Value::Blob(ByteBuf::from(memo)));
        }
        val.insert("ts".to_string(), Value::Nat(tx.ts.into()));
        block.insert("tx".to_string(), Value::Map(val));
        Self(Value::Map(block))
    }

    pub fn into_inner(self) -> Value {
        self.0
    }

    pub fn into_map(self) -> Map {
        match self.0 {
            Value::Map(map) => map,
            _ => unreachable!(),
        }
    }
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct BlockType {
    pub block_type: String,
    pub url: String,
}

fn account_value(Account { owner, subaccount }: Account) -> Value {
    let mut parts = vec![Value::blob(owner.as_slice())];
    if let Some(subaccount) = subaccount {
        parts.push(Value::blob(subaccount.as_slice()));
    }
    Value::Array(parts)
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub enum IndexType {
    Managed,
    Stable,
    StableTyped,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct TransactionRange {
    pub start: u128,
    pub length: u128,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct ArchiveLedgerInfo {
    pub archives: BTreeMap<Principal, TransactionRange>,
    pub local_ledger_size: u128,
    pub supported_blocks: Vec<BlockType>,
    pub last_index: u128,
    pub first_index: u128,
    pub is_cleaning: bool,
    pub latest_hash: Option<Hash>,
    pub setting: ArchiveSetting,
}

impl Default for ArchiveLedgerInfo {
    fn default() -> Self {
        Self {
            archives: BTreeMap::new(),
            local_ledger_size: 0,
            supported_blocks: vec![],
            last_index: 0,
            first_index: 0,
            is_cleaning: false,
            latest_hash: None,
            setting: ArchiveSetting::default(),
        }
    }
}

impl ArchiveLedgerInfo {
    pub fn new(setting: Option<ArchiveSetting>) -> Self {
        let setting = setting.unwrap_or(ArchiveSetting::default());
        Self {
            archives: BTreeMap::new(),
            local_ledger_size: 0,
            last_index: 0,
            first_index: 0,
            is_cleaning: false,
            latest_hash: None,
            setting,
            supported_blocks: vec![
                BlockType {
                    block_type: "7mint".into(),
                    url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-7/ICRC-7.md".into(),
                },
                BlockType {
                    block_type: "7burn".into(),
                    url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-7/ICRC-7.md".into(),
                },
                BlockType {
                    block_type: "7xfer".into(),
                    url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-7/ICRC-7.md".into(),
                },
                BlockType {
                    block_type: "7update".into(),
                    url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-7/ICRC-7.md".into(),
                },
                BlockType {
                    block_type: "37appr".into(),
                    url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-37/ICRC-37.md"
                        .into(),
                },
                BlockType {
                    block_type: "37appr_coll".into(),
                    url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-37/ICRC-37.md"
                        .into(),
                },
                BlockType {
                    block_type: "37revoke".into(),
                    url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-37/ICRC-37.md"
                        .into(),
                },
                BlockType {
                    block_type: "37revoke_coll".into(),
                    url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-37/ICRC-37.md"
                        .into(),
                },
                BlockType {
                    block_type: "37xfer".into(),
                    url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-37/ICRC-37.md"
                        .into(),
                },
            ],
        }
    }
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ArchiveSetting {
    pub archive_controllers: Option<Option<Vec<Principal>>>,
    pub archive_cycles: u128,
    pub archive_index_type: IndexType,
    pub max_active_records: u128,
    pub max_archive_pages: u128,
    pub max_records_in_archive_instance: u128,
    pub max_records_to_archive: u128,
    pub settle_to_records: u128,
}

impl Default for ArchiveSetting {
    fn default() -> Self {
        Self {
            archive_controllers: None,
            archive_cycles: 2_000_000_000_000,
            archive_index_type: IndexType::Stable,
            max_active_records: 2000,
            max_archive_pages: 62500,
            max_records_in_archive_instance: 10_000_000,
            max_records_to_archive: 10_000,
            settle_to_records: 1000,
        }
    }
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct InitArchiveArg {
    #[serde(rename = "archiveControllers")]
    pub archive_controllers: Option<Option<Vec<Principal>>>,
    #[serde(rename = "archiveCycles")]
    pub archive_cycles: u128,
    #[serde(rename = "archiveIndexType")]
    pub archive_index_type: IndexType,
    #[serde(rename = "maxActiveRecords")]
    pub max_active_records: u128,
    #[serde(rename = "maxArchivePages")]
    pub max_archive_pages: u128,
    #[serde(rename = "maxRecordsInArchiveInstance")]
    pub max_records_in_archive_instance: u128,
    #[serde(rename = "maxRecordsToArchive")]
    pub max_records_to_archive: u128,
    #[serde(rename = "settleToRecords")]
    pub settle_to_records: u128,
}

impl InitArchiveArg {
    pub fn to_archive_setting(self) -> ArchiveSetting {
        ArchiveSetting {
            archive_controllers: self.archive_controllers,
            archive_cycles: self.archive_cycles,
            archive_index_type: self.archive_index_type,
            max_active_records: self.max_active_records,
            max_archive_pages: self.max_archive_pages,
            max_records_in_archive_instance: self.max_records_in_archive_instance,
            max_records_to_archive: self.max_records_to_archive,
            settle_to_records: self.settle_to_records,
        }
    }
}

#[derive(CandidType, Deserialize, Debug)]
pub struct GetArchiveArgs {
    pub from: Option<Principal>,
}

pub type GetBlocksArgs = Vec<TransactionRange>;

#[derive(CandidType, Deserialize, Debug)]
pub struct QueryBlock {
    pub id: u128,
    pub block: Value,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct Tip {
    pub hash_tree: Vec<u8>,
    pub last_block_hash: Hash,
    pub last_block_index: Vec<u8>,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct GetTransactionsResult {
    pub blocks: Vec<ArchivedTransactionResponse>,
    pub log_length: u128,
    pub archived_blocks: Vec<u8>,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct GetBlocksResult {
    pub blocks: Vec<QueryBlock>,
    pub log_length: u128,
    pub archived_blocks: Vec<ArchivedTransactionResponse>,
}

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

#[derive(CandidType, Deserialize, Debug)]
pub struct ArchivedTransactionResponse {
    pub args: Vec<TransactionRange>,
    pub callback: QueryTransactionsFn,
}

pub type QueryTransactionsFn = GetTransactionsFn<Vec<QueryBlock>, GetTransactionsResult>;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct GetArchivesResultItem {
    pub canister_id: Principal,
    pub start: u128,
    pub end: u128,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ArchiveCreateArgs {
    pub max_pages: u128,
    pub max_records: u128,
    pub first_index: u128,
    pub controllers: Option<Option<Vec<Principal>>>,
}
