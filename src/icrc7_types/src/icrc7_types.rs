use std::collections::BTreeMap;

use candid::{CandidType, Decode, Encode};
use ic_stable_structures::{storable::Bound, Storable};
use icrc_ledger_types::{
    icrc::generic_value::Value,
    icrc1::account::{Account, Subaccount},
};
use serde::{Deserialize, Serialize};

use crate::{
    errors::{BurnError, InsertTransactionError, MintError, TransferError},
    icrc37_types::InitApprovalsArg,
    icrc3_types::{Block, InitArchiveArg},
};

pub static TRANSACTION_TRANSFER_OP: &str = "7xfer";
pub static TRANSACTION_TRANSFER_FROM_OP: &str = "37xfer";

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub enum TransactionType {
    Mint {
        tid: u128,
        from: Account,
        to: Account,
        meta: Icrc7TokenMetadata,
    },
    Burn {
        tid: u128,
        from: Account,
        to: Account,
    },
    Transfer {
        tid: u128,
        from: Account,
        to: Account,
    },
    TransferFrom {
        tid: u128,
        from: Account,
        to: Account,
        spender: Account,
    },
    Approval {
        tid: u128,
        from: Account,
        to: Account,
        exp_sec: Option<u64>,
    },
    ApproveCollection {
        from: Account,
        to: Account,
        exp_sec: Option<u64>,
    },
    Revoke {
        tid: u128,
        from: Account,
        to: Option<Account>,
    },
    RevokeCollection {
        from: Account,
        to: Option<Account>,
    },
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, Default)]
pub struct Transaction {
    pub ts: u64,
    pub op: String, // "7mint" | "7burn" | "7xfer" | "7update" | "37appr" | "37appr_coll | "37revoke" | "37revoke_coll" | "37xfer"
    pub tid: u128,
    pub from: Option<Account>,
    pub to: Option<Account>,
    pub spender: Option<Account>,
    pub exp: Option<u64>,
    pub meta: Option<Icrc7TokenMetadata>,
    pub memo: Option<Vec<u8>>,
    pub block: Option<Block>,
}

impl Transaction {
    pub fn mint(
        now_sec: u64,
        tid: u128,
        from: Option<Account>,
        to: Account,
        meta: Icrc7TokenMetadata,
        memo: Option<Vec<u8>>,
    ) -> Self {
        Transaction {
            ts: now_sec,
            op: "7mint".to_string(),
            tid,
            from,
            to: Some(to),
            meta: Some(meta),
            memo,
            ..Default::default()
        }
    }

    pub fn burn(
        now_sec: u64,
        tid: u128,
        from: Account,
        to: Option<Account>,
        memo: Option<Vec<u8>>,
    ) -> Self {
        Transaction {
            ts: now_sec,
            op: "7burn".to_string(),
            tid,
            from: Some(from),
            to,
            memo,
            ..Default::default()
        }
    }

    pub fn transfer(
        now_sec: u64,
        tid: u128,
        from: Account,
        to: Account,
        memo: Option<Vec<u8>>,
    ) -> Self {
        Transaction {
            ts: now_sec,
            op: "7xfer".to_string(),
            tid,
            from: Some(from),
            to: Some(to),
            memo,
            ..Default::default()
        }
    }

    pub fn update(
        now_sec: u64,
        tid: u128,
        from: Account,
        meta: Icrc7TokenMetadata,
        memo: Option<Vec<u8>>,
    ) -> Self {
        Transaction {
            ts: now_sec,
            op: "7update".to_string(),
            tid,
            from: Some(from),
            meta: Some(meta),
            memo,
            ..Default::default()
        }
    }

    pub fn approve(
        now_sec: u64,
        tid: u128,
        from: Account,
        spender: Account,
        exp_sec: Option<u64>,
        memo: Option<Vec<u8>>,
    ) -> Self {
        Transaction {
            ts: now_sec,
            op: "37appr".to_string(),
            tid,
            from: Some(from),
            spender: Some(spender),
            exp: exp_sec,
            memo,
            ..Default::default()
        }
    }

    pub fn approve_collection(
        now_sec: u64,
        from: Account,
        spender: Account,
        exp_sec: Option<u64>,
        memo: Option<Vec<u8>>,
    ) -> Self {
        Transaction {
            ts: now_sec,
            op: "37appr_coll".to_string(),
            from: Some(from),
            spender: Some(spender),
            exp: exp_sec,
            memo,
            ..Default::default()
        }
    }

    pub fn revoke(
        now_sec: u64,
        tid: u128,
        from: Account,
        spender: Option<Account>,
        memo: Option<Vec<u8>>,
    ) -> Self {
        Transaction {
            ts: now_sec,
            op: "37revoke".to_string(),
            tid,
            from: Some(from),
            spender,
            memo,
            ..Default::default()
        }
    }

    pub fn revoke_collection(
        now_sec: u64,
        from: Account,
        spender: Option<Account>,
        memo: Option<Vec<u8>>,
    ) -> Self {
        Transaction {
            ts: now_sec,
            op: "37revoke_coll".to_string(),
            from: Some(from),
            spender,
            memo,
            ..Default::default()
        }
    }

    pub fn transfer_from(
        now_sec: u64,
        tid: u128,
        from: Account,
        to: Account,
        spender: Account,
        memo: Option<Vec<u8>>,
    ) -> Self {
        Transaction {
            ts: now_sec,
            op: "37xfer".to_string(),
            tid,
            from: Some(from),
            to: Some(to),
            spender: Some(spender),
            memo,
            ..Default::default()
        }
    }

    pub fn new(_txn_id: u128, txn_type: TransactionType, at: u64, memo: Option<Vec<u8>>) -> Self {
        let transaction = match &txn_type {
            TransactionType::Transfer { tid, from, to } => {
                Self::transfer(at, tid.clone(), from.clone(), to.clone(), memo)
            }
            TransactionType::Mint {
                tid,
                from,
                to,
                meta,
            } => Self::mint(
                at,
                tid.clone(),
                Some(from.clone()),
                to.clone(),
                meta.clone(),
                memo,
            ),
            TransactionType::Burn { tid, from, to } => {
                Self::burn(at, tid.clone(), from.clone(), Some(to.clone()), memo)
            }
            TransactionType::Approval {
                tid,
                from,
                to,
                exp_sec,
            } => Self::approve(
                at,
                tid.clone(),
                from.clone(),
                to.clone(),
                exp_sec.clone(),
                memo,
            ),
            TransactionType::ApproveCollection { from, to, exp_sec } => {
                Self::approve_collection(at, from.clone(), to.clone(), exp_sec.clone(), memo)
            }
            TransactionType::Revoke { tid, from, to } => {
                Self::revoke(at, tid.clone(), from.clone(), to.clone(), memo)
            }
            TransactionType::RevokeCollection { from, to } => {
                Self::revoke_collection(at, from.clone(), to.clone(), memo)
            }
            TransactionType::TransferFrom {
                tid,
                from,
                to,
                spender,
            } => Self::transfer_from(
                at,
                tid.clone(),
                from.clone(),
                to.clone(),
                spender.clone(),
                memo,
            ),
        };
        return transaction;
    }
}

impl Storable for Transaction {
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        std::borrow::Cow::Owned(Encode!(self).unwrap())
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TransferArg {
    pub from_subaccount: Option<Subaccount>,
    pub to: Account,
    pub token_id: u128,
    pub memo: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
}

pub type TransferResult = Result<u128, TransferError>;

pub type Icrc7TokenMetadata = BTreeMap<String, Value>;

#[derive(CandidType, Deserialize, Clone)]
pub struct MintArg {
    pub from_subaccount: Option<Subaccount>,
    pub to: Account,
    pub token_id: u128,
    pub memo: Option<Vec<u8>>,
    // if None, then the combination of Collection's symbol and token's id will be provided
    // for e.g.: "ICRC7 100"
    pub token_name: Option<String>,
    pub token_description: Option<String>,
    pub token_logo: Option<String>,
}

pub type MintResult = Result<u128, MintError>;

#[derive(CandidType, Deserialize, Clone)]
pub struct BurnArg {
    pub from_subaccount: Option<Subaccount>,
    pub token_id: u128,
    pub memo: Option<Vec<u8>>,
}

pub type BurnResult = Result<u128, BurnError>;

#[derive(CandidType, Deserialize)]
pub struct InitArg {
    pub minting_account: Option<Account>,
    pub icrc7_symbol: String,
    pub icrc7_name: String,
    pub icrc7_description: Option<String>,
    pub icrc7_logo: Option<String>,
    pub icrc7_supply_cap: Option<u128>,
    pub icrc7_max_query_batch_size: Option<u16>,
    pub icrc7_max_update_batch_size: Option<u16>,
    pub icrc7_max_take_value: Option<u128>,
    pub icrc7_default_take_value: Option<u128>,
    pub icrc7_max_memo_size: Option<u32>,
    pub icrc7_atomic_batch_transfers: Option<bool>,
    pub tx_window: Option<u64>,
    pub permitted_drift: Option<u64>,
    pub approval_init: Option<InitApprovalsArg>,
    pub archive_init: Option<InitArchiveArg>,
}

#[derive(CandidType)]
pub struct Standard {
    pub name: String,
    pub url: String,
}

#[derive(CandidType, Deserialize)]
pub struct ApprovalArg {
    pub from_subaccount: Option<Subaccount>,
    pub spender: Account,
    pub token_id: u128,
    pub expires_at: Option<u64>,
    pub memo: Option<Vec<u8>>,
}

pub type SyncReceipt = Result<u32, InsertTransactionError>;
