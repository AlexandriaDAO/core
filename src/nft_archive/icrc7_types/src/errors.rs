use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum TransferError {
    NonExistingTokenId,
    InvalidRecipient,
    Unauthorized,
    TooOld,
    CreatedInFuture { ledger_time: u64 },
    Duplicate { duplicate_of: u128 },
    GenericError { error_code: u128, message: String },
    GenericBatchError { error_code: u128, message: String },
}

#[derive(CandidType, Clone)]
pub enum BurnError {
    Unauthorized,
    NonExistingTokenId,
    GenericError { error_code: u128, message: String },
    GenericBatchError { error_code: u128, message: String },
}

#[derive(CandidType, Clone)]
pub enum MintError {
    SupplyCapReached,
    Unauthorized,
    TokenIdAlreadyExist,
    TokenIdMinimumLimit,
    GenericError { error_code: u128, message: String },
    GenericBatchError { error_code: u128, message: String },
}

#[derive(CandidType, Debug, PartialEq, Deserialize)]
pub enum InsertTransactionError {
    SyncPending,
    NotSetArchiveCanister,
    RemoteError,
    Unexpected(String),
    CantWrite,
    InvalidId,
}

// ICRC37 Error

#[derive(CandidType, Debug, PartialEq, Deserialize, Clone)]
pub enum ApproveTokenError {
    TooOld,
    InvalidSpender,
    CreatedInFuture { ledger_time: u64 },
    NonExistingTokenId,
    Unauthorized,
    GenericError { error_code: u128, message: String },
    Duplicate { duplicate_of: u128 },
    GenericBatchError { error_code: u128, message: String },
}

#[derive(CandidType, Debug, PartialEq, Deserialize, Clone)]
pub enum ApproveCollectionError {
    InvalidSpender,
    TooOld,
    CreatedInFuture { ledger_time: u64 },
    GenericError { error_code: u128, message: String },
    Duplicate { duplicate_of: u128 },
    GenericBatchError { error_code: u128, message: String },
}

#[derive(CandidType, Debug, PartialEq, Deserialize, Clone)]
pub enum RevokeTokenApprovalError {
    TooOld,
    CreatedInFuture { ledger_time: u64 },
    NonExistingTokenId,
    Unauthorized,
    ApprovalDoesNotExist,
    GenericError { error_code: u128, message: String },
    Duplicate { duplicate_of: u128 },
    GenericBatchError { error_code: u128, message: String },
}

#[derive(CandidType, Debug, PartialEq, Deserialize, Clone)]
pub enum RevokeCollectionApprovalError {
    TooOld,
    CreatedInFuture { ledger_time: u64 },
    Unauthorized,
    ApprovalDoesNotExist,
    GenericError { error_code: u128, message: String },
    Duplicate { duplicate_of: u128 },
    GenericBatchError { error_code: u128, message: String },
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum TransferFromError {
    NonExistingTokenId,
    InvalidRecipient,
    Unauthorized,
    TooOld,
    CreatedInFuture { ledger_time: u64 },
    Duplicate { duplicate_of: u128 },
    GenericError { error_code: u128, message: String },
    GenericBatchError { error_code: u128, message: String },
}