use std::{cell::RefCell, collections::BTreeMap, time::Duration};

use crate::{
    archive::create_archive_canister,
    errors::{
        ApproveCollectionError, ApproveTokenError, BurnError, InsertTransactionError, MintError,
        RevokeCollectionApprovalError, RevokeTokenApprovalError, TransferError, TransferFromError,
    },
    icrc37_types::{
        ApproveCollectionArg, ApproveCollectionResult, ApproveTokenArg, ApproveTokenResult,
        CollectionApproval, CollectionApprovalInfo, IsApprovedArg, LedgerInfo, Metadata,
        RevokeCollectionApprovalArg, RevokeCollectionApprovalResult, RevokeTokenApprovalArg,
        RevokeTokenApprovalResult, TokenApproval, TokenApprovalInfo, TransferFromArg,
        TransferFromResult, UserAccount,
    },
    icrc3_types::{
        ArchiveCreateArgs, ArchiveLedgerInfo, ArchivedTransactionResponse, Block, GetArchiveArgs,
        GetArchivesResultItem, GetBlocksArgs, GetBlocksResult, QueryBlock, QueryTransactionsFn,
        Tip, TransactionRange,
    },
    icrc7_types::{
        BurnResult, Icrc7TokenMetadata, MintArg, MintResult, Transaction, TransactionType,
        TransferArg, TransferResult,
    },
    memory::{
        get_collection_approvals_memory, get_log_memory, get_token_approvals_memory,
        get_token_map_memory, Memory,
    },
    utils::{account_transformer, burn_account, hash_icrc_value},
    BurnArg, SyncReceipt, TRANSACTION_TRANSFER_FROM_OP, TRANSACTION_TRANSFER_OP,
};
use candid::{CandidType, Decode, Encode, Principal};
use ic_cdk_timers::TimerId;
use ic_certified_map::{leaf_hash, AsHashTree, Hash, RbTree};
use ic_stable_structures::{
    memory_manager::MemoryManager, storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable,
};
use icrc_ledger_types::{
    icrc::generic_value::Value, icrc1::account::Account, icrc3::blocks::DataCertificate,
};
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Icrc7Token {
    pub token_id: u128,
    pub token_name: String,
    pub token_description: Option<String>,
    pub token_logo: Option<String>,
    pub token_owner: Account,
}

impl Storable for Icrc7Token {
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        std::borrow::Cow::Owned(Encode!(self).unwrap())
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Icrc7Token {
    fn new(
        token_id: u128,
        token_name: String,
        token_description: Option<String>,
        token_logo: Option<String>,
        token_owner: Account,
    ) -> Self {
        Self {
            token_id,
            token_name,
            token_logo,
            token_owner,
            token_description,
        }
    }

    fn transfer(&mut self, to: Account) {
        self.token_owner = to;
    }

    fn token_metadata(&self) -> Icrc7TokenMetadata {
        let mut metadata = BTreeMap::<String, Value>::new();
        metadata.insert("Name".into(), Value::Text(self.token_name.clone()));
        metadata.insert("Symbol".into(), Value::Text(self.token_name.clone()));
        if let Some(ref description) = self.token_description {
            metadata.insert("Description".into(), Value::Text(description.clone()));
        }
        if let Some(ref logo) = self.token_logo {
            metadata.insert("Logo".into(), Value::Text(logo.clone()));
        }
        metadata
    }

    fn burn(&mut self, burn_address: Account) {
        self.token_owner = burn_address;
    }
}

#[derive(Serialize, Deserialize)]
pub struct State {
    pub minting_authority: Option<Account>,
    pub icrc7_symbol: String,
    pub icrc7_name: String,
    pub icrc7_description: Option<String>,
    pub icrc7_logo: Option<String>,
    pub icrc7_total_supply: u128,
    pub icrc7_supply_cap: Option<u128>,
    pub icrc7_max_query_batch_size: Option<u16>,
    pub icrc7_max_update_batch_size: Option<u16>,
    pub icrc7_max_take_value: Option<u128>,
    pub icrc7_default_take_value: Option<u128>,
    pub icrc7_max_memo_size: Option<u32>,
    pub icrc7_atomic_batch_transfers: Option<bool>,
    pub tx_window: Option<u64>,
    pub permitted_drift: Option<u64>,
    #[serde(skip, default = "get_token_map_memory")]
    pub tokens: StableBTreeMap<u128, Icrc7Token, Memory>,
    pub txn_count: u128,
    pub next_token_id: u128,

    pub approval_ledger_info: LedgerInfo,
    #[serde(skip, default = "get_token_approvals_memory")]
    pub token_approvals: StableBTreeMap<u128, TokenApprovalInfo, Memory>,
    #[serde(skip, default = "get_collection_approvals_memory")]
    pub collection_approvals: StableBTreeMap<UserAccount, CollectionApprovalInfo, Memory>,

    pub archive_ledger_info: ArchiveLedgerInfo,
    #[serde(skip, default = "get_log_memory")]
    pub txn_ledger: StableBTreeMap<u128, Transaction, Memory>,
    pub archive_log_canister: Option<Principal>,
    pub sync_pending_txn_ids: Option<Vec<u128>>,
    pub archive_txn_count: u128,
}

impl Default for State {
    fn default() -> Self {
        Self {
            minting_authority: None,
            icrc7_symbol: "ICRC7".into(),
            icrc7_name: "ICRC7 Collection".into(),
            icrc7_description: None,
            icrc7_logo: None,
            icrc7_total_supply: 0,
            icrc7_supply_cap: None,
            icrc7_max_query_batch_size: None,
            icrc7_max_update_batch_size: None,
            icrc7_max_take_value: None,
            icrc7_default_take_value: None,
            icrc7_max_memo_size: None,
            icrc7_atomic_batch_transfers: None,
            tx_window: None,
            permitted_drift: None,
            tokens: get_token_map_memory(),
            txn_count: 0,
            next_token_id: 0,
            txn_ledger: get_log_memory(),
            archive_log_canister: None,
            sync_pending_txn_ids: None,
            archive_txn_count: 0,
            approval_ledger_info: LedgerInfo::default(),
            token_approvals: get_token_approvals_memory(),
            collection_approvals: get_collection_approvals_memory(),
            archive_ledger_info: ArchiveLedgerInfo::default(),
        }
    }
}

impl State {
    pub const DEFAULT_MAX_QUERY_BATCH_SIZE: u16 = 32;
    pub const DEFAULT_MAX_UPDATE_BATCH_SIZE: u16 = 32;
    pub const DEFAULT_TAKE_VALUE: u128 = 32;
    pub const DEFAULT_MAX_TAKE_VALUE: u128 = 32;
    pub const DEFAULT_MAX_MEMO_SIZE: u32 = 32;
    pub const DEFAULT_TX_WINDOW: u64 = 24 * 60 * 60 * 1000_000_000;
    pub const DEFAULT_PERMITTED_DRIFT: u64 = 2 * 60 * 1000_000_000;

    pub fn icrc7_symbol(&self) -> String {
        self.icrc7_symbol.clone()
    }

    pub fn icrc7_name(&self) -> String {
        self.icrc7_name.clone()
    }

    pub fn icrc7_description(&self) -> Option<String> {
        self.icrc7_description.clone()
    }

    pub fn icrc7_total_supply(&self) -> u128 {
        self.icrc7_total_supply
    }

    pub fn icrc7_supply_cap(&self) -> Option<u128> {
        self.icrc7_supply_cap
    }

    pub fn icrc7_logo(&self) -> Option<String> {
        self.icrc7_logo.clone()
    }

    pub fn icrc7_minting_authority(&self) -> Option<Account> {
        self.minting_authority.clone()
    }

    pub fn icrc7_max_query_batch_size(&self) -> Option<u16> {
        self.icrc7_max_query_batch_size
    }

    pub fn icrc7_max_update_batch_size(&self) -> Option<u16> {
        self.icrc7_max_update_batch_size
    }

    pub fn icrc7_default_take_value(&self) -> Option<u128> {
        self.icrc7_default_take_value
    }

    pub fn icrc7_max_take_value(&self) -> Option<u128> {
        self.icrc7_max_take_value
    }

    pub fn icrc7_max_memo_size(&self) -> Option<u32> {
        self.icrc7_max_memo_size
    }

    pub fn icrc7_atomic_batch_transfers(&self) -> Option<bool> {
        self.icrc7_atomic_batch_transfers
    }

    pub fn icrc7_owner_of(&self, token_id: &[u128]) -> Vec<Option<Account>> {
        let mut res = vec![None; token_id.len()];
        for (index, id) in token_id.iter().enumerate() {
            if let Some(ref token) = self.tokens.get(id) {
                res[index] = Some(token.token_owner);
            }
        }
        res
    }

    pub fn icrc37_metadata(&self) -> Metadata {
        let mut res = Metadata::new();
        if self
            .approval_ledger_info
            .max_approvals_per_token_or_collection
            > 0
        {
            res.insert(
                "icrc37:max_approvals_per_token_or_collection".to_string(),
                Value::Nat(
                    (self
                        .approval_ledger_info
                        .max_approvals_per_token_or_collection as u64)
                        .into(),
                ),
            );
        }
        if self.approval_ledger_info.max_revoke_approvals > 0 {
            res.insert(
                "icrc37:max_revoke_approvals".to_string(),
                Value::Nat((self.approval_ledger_info.max_revoke_approvals as u64).into()),
            );
        }
        res
    }

    pub fn get_archive_log_canister(&self) -> Option<Principal> {
        self.archive_log_canister
    }

    pub fn get_sync_pending_txn_ids(&self) -> Option<Vec<u128>> {
        self.sync_pending_txn_ids.clone()
    }

    pub fn set_sync_pending_txn_ids(&mut self, txn_ids: Option<Vec<u128>>) -> bool {
        self.sync_pending_txn_ids = txn_ids;
        return true;
    }

    fn txn_deduplication_check(
        &self,
        allowed_past_time: &u64,
        caller: &Account,
        args: &TransferArg,
    ) -> Result<(), TransferError> {
        let mut count = self.txn_count;
        while count != 0 {
            let txn = self.txn_ledger.get(&count).unwrap();
            if txn.ts < *allowed_past_time {
                return Ok(());
            }
            if txn.op == String::from(TRANSACTION_TRANSFER_OP)
                || txn.op == String::from(TRANSACTION_TRANSFER_FROM_OP)
            {
                if args.token_id == txn.tid
                    && caller == txn.from.as_ref().unwrap()
                    && args.to == txn.to.unwrap()
                    && args.memo == txn.memo
                    && args.created_at_time == Some(txn.ts)
                {
                    return Err(TransferError::Duplicate {
                        duplicate_of: count,
                    });
                } else {
                    count -= 1;
                    continue;
                }
            } else {
                count -= 1;
                continue;
            }
        }
        Ok(())
    }

    fn get_txn_id(&mut self) -> u128 {
        let tx_id = self.txn_count;
        self.txn_count += 1;
        tx_id
    }

    fn log_transaction(
        &mut self,
        txn_type: TransactionType,
        at: u64,
        memo: Option<Vec<u8>>,
    ) -> u128 {
        let txn_id = self.get_txn_id();

        // Get the information of the previous transaction.
        // let current_size = self.archive_ledger_info.local_ledger_size;
        // let last_transaction: Option<Transaction> = if current_size == 0 {
        //     None
        // } else {
        //     self.txn_ledger.get(&(txn_id - 1))
        // };

        let mut txn = Transaction::new(txn_id, txn_type, at, memo);
        let phash = self.archive_ledger_info.latest_hash;

        let block = Block::new(phash, txn.clone());
        let block_hash = hash_icrc_value(block.as_ref());

        txn.block = Some(block);
        self.txn_ledger.insert(txn_id, txn);
        self.archive_ledger_info.last_index += 1;
        self.archive_ledger_info.latest_hash = Some(block_hash);
        self.archive_ledger_info.local_ledger_size += 1;

        // set certified data
        TREE.with(|tree| {
            let mut tree = tree.borrow_mut();
            tree.insert(
                "last_block_index",
                leaf_hash(&self.archive_ledger_info.last_index.to_be_bytes()),
            );
            tree.insert("last_block_hash", leaf_hash(&block_hash));
            ic_cdk::api::set_certified_data(&tree.root_hash());
        });

        if self.archive_ledger_info.local_ledger_size
            > self.archive_ledger_info.setting.max_active_records
        {
            set_clean_up_timer();
        }

        txn_id
    }

    fn get_current_txn_count(&self) -> u128 {
        self.txn_count - self.archive_txn_count
    }

    fn get_current_take(&self, take: Option<u128>) -> u128 {
        self.icrc7_max_take_value
            .map_or(self::State::DEFAULT_TAKE_VALUE, |max_take| {
                take.map_or(max_take, |t| t.min(max_take))
            })
    }

    fn is_approved_by_collection(&self, from: &Account, spender: &Account, now_sec: u64) -> bool {
        let from_user = UserAccount::new(*from);
        if let Some(approvals) = self.collection_approvals.get(&from_user) {
            if let Some(approval_info) = approvals.into_map().get(spender) {
                match approval_info.expires_at {
                    None => {
                        return true;
                    }
                    Some(expires_at) => {
                        return expires_at > now_sec;
                    }
                }
            }
        }
        false
    }

    fn is_approved_by_token(
        &self,
        token_id: &u128,
        from: &Account,
        spender: &Account,
        now_sec: u64,
    ) -> bool {
        if let Some(token) = self.token_approvals.get(token_id) {
            if let Some(token_approvals) = token.into_map().get(from) {
                if let Some(approval_info) = token_approvals.get(spender) {
                    match approval_info.expires_at {
                        None => {
                            return true;
                        }
                        Some(expires_at) => {
                            return expires_at > now_sec;
                        }
                    }
                }
            }
        }
        false
    }

    fn token_approvals_clean(&mut self, token_id: &u128) {
        self.token_approvals.remove(token_id);
    }

    fn mock_transfer(
        &self,
        current_time: &u64,
        caller: &Account,
        arg: &TransferArg,
    ) -> Result<(), TransferError> {
        if let Some(time) = arg.created_at_time {
            let allowed_past_time = *current_time
                - self.tx_window.unwrap_or(State::DEFAULT_TX_WINDOW)
                - self
                    .permitted_drift
                    .unwrap_or(State::DEFAULT_PERMITTED_DRIFT);
            let allowed_future_time = *current_time
                + self
                    .permitted_drift
                    .unwrap_or(State::DEFAULT_PERMITTED_DRIFT);
            if time < allowed_past_time {
                return Err(TransferError::TooOld);
            } else if time > allowed_future_time {
                return Err(TransferError::CreatedInFuture {
                    ledger_time: current_time.clone(),
                });
            }
            self.txn_deduplication_check(&allowed_past_time, caller, arg)?;
        }
        // checking is token for the corresponding ID exists or not
        if let None = self.tokens.get(&arg.token_id) {
            return Err(TransferError::NonExistingTokenId);
        }
        if let Some(ref memo) = arg.memo {
            let max_memo_size = self
                .icrc7_max_memo_size
                .unwrap_or(State::DEFAULT_MAX_MEMO_SIZE);
            if memo.len() as u32 > max_memo_size {
                return Err(TransferError::GenericError {
                    error_code: 3,
                    message: "Exceeds Max Memo Size".into(),
                });
            }
        }
        // checking if receiver and sender have same address
        if arg.to == *caller {
            return Err(TransferError::InvalidRecipient);
        }
        let token = self.tokens.get(&arg.token_id).unwrap();
        // checking if the caller is authorized or is approve to make transaction
        if token.token_owner != *caller {
            return Err(TransferError::Unauthorized);
        }
        Ok(())
    }

    pub fn icrc7_transfer(
        &mut self,
        caller: &Principal,
        mut args: Vec<TransferArg>,
    ) -> Vec<Option<TransferResult>> {
        // checking if the argument length in 0
        if args.len() == 0 {
            return vec![Some(Err(TransferError::GenericBatchError {
                error_code: 1,
                message: "No Arguments Provided".into(),
            }))];
        }
        let max_update_batch_size = self
            .icrc7_max_query_batch_size
            .unwrap_or(State::DEFAULT_MAX_UPDATE_BATCH_SIZE);
        let mut txn_results = vec![None; args.len()];
        if args.len() as u16 > max_update_batch_size {
            txn_results[0] = Some(Err(TransferError::GenericBatchError {
                error_code: 2,
                message: "Exceed Max allowed Update Batch Size".into(),
            }));
            return txn_results;
        }
        if *caller == Principal::anonymous() {
            txn_results[0] = Some(Err(TransferError::GenericBatchError {
                error_code: 100,
                message: "Anonymous Identity".into(),
            }));
            return txn_results;
        }
        let current_time = ic_cdk::api::time();
        for (index, arg) in args.iter_mut().enumerate() {
            let caller_account = account_transformer(Account {
                owner: caller.clone(),
                subaccount: arg.from_subaccount,
            });
            arg.to = account_transformer(arg.to);
            if let Err(e) = self.mock_transfer(&current_time, &caller_account, &arg) {
                txn_results[index] = Some(Err(e));
            }
        }
        if let Some(true) = self.icrc7_atomic_batch_transfers {
            if txn_results
                .iter()
                .any(|res| res.is_some() && res.as_ref().unwrap().is_err())
            {
                return txn_results;
            }
        }
        for (index, arg) in args.iter().enumerate() {
            let caller_account = account_transformer(Account {
                owner: caller.clone(),
                subaccount: arg.from_subaccount,
            });
            let time = arg.created_at_time.unwrap_or(current_time);
            if let Some(Err(e)) = txn_results.get(index).unwrap() {
                match e {
                    TransferError::GenericBatchError {
                        error_code: _,
                        message: _,
                    } => return txn_results,
                    _ => continue,
                }
            }
            let mut token = self.tokens.get(&arg.token_id).unwrap();
            token.transfer(arg.to.clone());
            self.tokens.insert(arg.token_id, token);
            let txn_id = self.log_transaction(
                TransactionType::Transfer {
                    tid: arg.token_id,
                    from: caller_account.clone(),
                    to: arg.to.clone(),
                },
                time,
                arg.memo.clone(),
            );
            txn_results[index] = Some(Ok(txn_id));
        }
        txn_results
    }

    fn mock_mint(&self, caller: &Account, arg: &MintArg) -> Result<(), MintError> {
        if let Some(cap) = self.icrc7_supply_cap {
            if cap == self.icrc7_total_supply {
                return Err(MintError::SupplyCapReached);
            }
        }
        if let None = self.minting_authority {
            return Err(MintError::GenericBatchError {
                error_code: 6,
                message: "Minting Authority Not Set".into(),
            });
        }
        if Some(*caller) != self.minting_authority {
            return Err(MintError::Unauthorized);
        }
        if let Some(ref memo) = arg.memo {
            let allowed_memo_length = self
                .icrc7_max_memo_size
                .unwrap_or(State::DEFAULT_MAX_MEMO_SIZE);
            if memo.len() as u32 > allowed_memo_length {
                return Err(MintError::GenericError {
                    error_code: 7,
                    message: "Exceeds Allowed Memo Length".into(),
                });
            }
        }
        if &arg.token_id < &self.next_token_id {
            return Err(MintError::TokenIdMinimumLimit);
        }
        if let Some(_) = self.tokens.get(&arg.token_id) {
            return Err(MintError::TokenIdAlreadyExist);
        }
        Ok(())
    }

    pub fn mint(&mut self, caller: &Principal, mut arg: MintArg) -> MintResult {
        let caller = account_transformer(Account {
            owner: caller.clone(),
            subaccount: arg.from_subaccount,
        });
        arg.to = account_transformer(arg.to);
        self.mock_mint(&caller, &arg)?;
        let token_name = arg.token_name.unwrap_or_else(|| {
            let name = format!("{} {}", self.icrc7_symbol, arg.token_id);
            name
        });
        let token = Icrc7Token::new(
            arg.token_id,
            token_name.clone(),
            arg.token_description.clone(),
            arg.token_logo,
            arg.to.clone(),
        );
        let token_metadata = token.token_metadata();
        self.tokens.insert(arg.token_id, token);
        self.icrc7_total_supply += 1;
        self.next_token_id = arg.token_id + 1;

        let txn_id = self.log_transaction(
            TransactionType::Mint {
                tid: arg.token_id,
                from: caller,
                to: arg.to,
                meta: token_metadata,
            },
            ic_cdk::api::time(),
            arg.memo,
        );
        Ok(txn_id)
    }

    fn mock_burn(&self, caller: &Account, arg: &BurnArg) -> Result<(), BurnError> {
        if let Some(ref memo) = arg.memo {
            if memo.len() as u32
                > self
                    .icrc7_max_memo_size
                    .unwrap_or(State::DEFAULT_MAX_MEMO_SIZE)
            {
                return Err(BurnError::GenericError {
                    error_code: 3,
                    message: "Exceeds Max Memo Length".into(),
                });
            }
        }
        match self.tokens.get(&arg.token_id) {
            None => Err(BurnError::NonExistingTokenId),
            Some(ref token) => {
                if token.token_owner != *caller {
                    return Err(BurnError::Unauthorized);
                }
                Ok(())
            }
        }
    }

    pub fn burn(&mut self, caller: &Principal, mut args: Vec<BurnArg>) -> Vec<Option<BurnResult>> {
        if args.len() == 0 {
            return vec![Some(Err(BurnError::GenericBatchError {
                error_code: 1,
                message: "No Arguments Provided".into(),
            }))];
        }
        let mut txn_results = vec![None; args.len()];
        if *caller == Principal::anonymous() {
            txn_results[0] = Some(Err(BurnError::GenericBatchError {
                error_code: 100,
                message: "Anonymous Identity".into(),
            }));
            return txn_results;
        }
        for (index, arg) in args.iter_mut().enumerate() {
            let caller = account_transformer(Account {
                owner: caller.clone(),
                subaccount: arg.from_subaccount,
            });
            if let Err(e) = self.mock_burn(&caller, arg) {
                txn_results.insert(index, Some(Err(e)))
            }
        }
        if let Some(true) = self.icrc7_atomic_batch_transfers {
            if txn_results
                .iter()
                .any(|res| res.is_some() && res.as_ref().unwrap().is_err())
            {
                return txn_results;
            }
        }
        for (index, arg) in args.iter().enumerate() {
            let caller = account_transformer(Account {
                owner: caller.clone(),
                subaccount: arg.from_subaccount,
            });
            let burn_address = burn_account();
            if let Some(Err(e)) = txn_results.get(index).unwrap() {
                match e {
                    BurnError::GenericBatchError {
                        error_code: _,
                        message: _,
                    } => return txn_results,
                    _ => continue,
                }
            }
            let mut token = self.tokens.get(&arg.token_id).unwrap();
            token.burn(burn_address.clone());
            self.tokens.insert(arg.token_id, token);
            let tid = self.log_transaction(
                TransactionType::Burn {
                    tid: arg.token_id,
                    from: caller,
                    to: burn_address,
                },
                ic_cdk::api::time(),
                arg.memo.clone(),
            );
            txn_results.insert(index, Some(Ok(tid)))
        }
        txn_results
    }

    fn mock_approve(
        &self,
        caller: &Account,
        arg: &ApproveTokenArg,
    ) -> Result<(), ApproveTokenError> {
        if arg.approval_info.spender == *caller {
            return Err(ApproveTokenError::InvalidSpender);
        };
        if let Some(ref memo) = arg.approval_info.memo {
            let max_memo_size = self
                .icrc7_max_memo_size
                .unwrap_or(State::DEFAULT_MAX_MEMO_SIZE);
            if memo.len() as u32 > max_memo_size {
                return Err(ApproveTokenError::GenericError {
                    error_code: 3,
                    message: "Exceeds Max Memo Size".into(),
                });
            }
        };
        match self.tokens.get(&arg.token_id) {
            None => Err(ApproveTokenError::NonExistingTokenId),
            Some(ref token) => {
                if token.token_owner != *caller {
                    return Err(ApproveTokenError::NonExistingTokenId);
                }
                Ok(())
            }
        }
    }

    pub fn approve(
        &mut self,
        caller: &Principal,
        mut args: Vec<ApproveTokenArg>,
    ) -> Vec<Option<ApproveTokenResult>> {
        if args.len() == 0 {
            return vec![Some(Err(ApproveTokenError::GenericError {
                error_code: 1,
                message: "No Arguments Provided".into(),
            }))];
        }

        let max_update_batch_size = self.icrc7_max_update_batch_size().unwrap_or_default();

        if args.len() > max_update_batch_size as usize {
            return vec![Some(Err(ApproveTokenError::GenericError {
                error_code: 2,
                message: "Exceeds max update batch size".into(),
            }))];
        }

        let mut txn_results = vec![None; args.len()];

        for (index, arg) in args.iter_mut().enumerate() {
            let caller = account_transformer(Account {
                owner: caller.clone(),
                subaccount: arg.approval_info.from_subaccount,
            });
            if let Err(e) = self.mock_approve(&caller, arg) {
                txn_results.insert(index, Some(Err(e)))
            }
        }
        if let Some(true) = self.icrc7_atomic_batch_transfers {
            if txn_results
                .iter()
                .any(|res| res.is_some() && res.as_ref().unwrap().is_err())
            {
                return txn_results;
            }
        }

        for (index, arg) in args.iter().enumerate() {
            let caller = account_transformer(Account {
                owner: caller.clone(),
                subaccount: arg.approval_info.from_subaccount,
            });
            if let Some(Err(e)) = txn_results.get(index).unwrap() {
                match e {
                    &ApproveTokenError::GenericBatchError {
                        error_code: _,
                        message: _,
                    } => return txn_results,
                    _ => continue,
                }
            }

            match self.token_approvals.get(&arg.token_id) {
                None => {
                    let token_approval = TokenApprovalInfo::new(caller, arg.approval_info.clone());
                    self.token_approvals.insert(arg.token_id, token_approval);
                }
                Some(mut token_approval) => {
                    token_approval.approve(caller, arg.approval_info.clone());
                }
            }

            let tid = self.log_transaction(
                TransactionType::Approval {
                    tid: arg.token_id,
                    from: caller,
                    to: arg.approval_info.spender,
                    exp_sec: arg.approval_info.expires_at,
                },
                ic_cdk::api::time(),
                arg.approval_info.memo.clone(),
            );
            txn_results.insert(index, Some(Ok(tid)))
        }
        txn_results
    }

    fn mock_collection_approve(
        &self,
        caller: &Account,
        arg: &ApproveCollectionArg,
        current_time: &u64,
    ) -> Result<(), ApproveCollectionError> {
        if arg.approval_info.spender == *caller {
            return Err(ApproveCollectionError::InvalidSpender);
        };
        if let Some(expires_at) = arg.approval_info.expires_at {
            if expires_at < *current_time {
                return Err(ApproveCollectionError::TooOld);
            }
        }

        if let Some(ref memo) = arg.approval_info.memo {
            let max_memo_size = self
                .icrc7_max_memo_size
                .unwrap_or(State::DEFAULT_MAX_MEMO_SIZE);
            if memo.len() as u32 > max_memo_size {
                return Err(ApproveCollectionError::GenericError {
                    error_code: 3,
                    message: "Exceeds Max Memo Size".into(),
                });
            }
        };
        Ok(())
    }

    pub fn collection_approve(
        &mut self,
        caller: &Principal,
        mut args: Vec<ApproveCollectionArg>,
    ) -> Vec<Option<ApproveCollectionResult>> {
        if args.len() == 0 {
            return vec![Some(Err(ApproveCollectionError::GenericError {
                error_code: 1,
                message: "No Arguments Provided".into(),
            }))];
        }

        let max_update_batch_size = self.icrc7_max_update_batch_size().unwrap_or_default();

        if args.len() > max_update_batch_size as usize {
            return vec![Some(Err(ApproveCollectionError::GenericError {
                error_code: 2,
                message: "Exceeds max update batch size".into(),
            }))];
        }

        let mut txn_results: Vec<Option<ApproveCollectionResult>> = vec![None; args.len()];
        let current_time = ic_cdk::api::time();

        for (index, arg) in args.iter_mut().enumerate() {
            let caller = account_transformer(Account {
                owner: caller.clone(),
                subaccount: arg.approval_info.from_subaccount,
            });
            if let Err(e) = self.mock_collection_approve(&caller, arg, &current_time) {
                txn_results.insert(index, Some(Err(e)))
            }
        }
        if let Some(true) = self.icrc7_atomic_batch_transfers {
            if txn_results
                .iter()
                .any(|res| res.is_some() && res.as_ref().unwrap().is_err())
            {
                return txn_results;
            }
        }

        for (index, arg) in args.iter().enumerate() {
            let caller = account_transformer(Account {
                owner: caller.clone(),
                subaccount: arg.approval_info.from_subaccount,
            });
            let user_account = UserAccount::new(caller);
            if let Some(Err(e)) = txn_results.get(index).unwrap() {
                match e {
                    &ApproveCollectionError::GenericBatchError {
                        error_code: _,
                        message: _,
                    } => return txn_results,
                    _ => continue,
                }
            }

            match self.collection_approvals.get(&user_account) {
                None => {
                    let collection_approval = CollectionApprovalInfo::new(
                        arg.approval_info.spender,
                        arg.approval_info.clone(),
                    );
                    self.collection_approvals
                        .insert(user_account, collection_approval);
                }
                Some(mut collection_approval) => {
                    collection_approval
                        .approve(arg.approval_info.spender, arg.approval_info.clone());
                }
            }

            let tid = self.log_transaction(
                TransactionType::ApproveCollection {
                    from: caller,
                    to: arg.approval_info.spender,
                    exp_sec: arg.approval_info.expires_at,
                },
                ic_cdk::api::time(),
                arg.approval_info.memo.clone(),
            );
            txn_results.insert(index, Some(Ok(tid)))
        }

        return txn_results;
    }

    fn mock_revoke_approve(
        &self,
        caller: &Account,
        arg: &RevokeTokenApprovalArg,
    ) -> Result<(), RevokeTokenApprovalError> {
        if let Some(spender) = arg.spender {
            if spender == *caller {
                return Err(RevokeTokenApprovalError::GenericBatchError {
                    error_code: 1,
                    message: "Spender cannot be caller".into(),
                });
            }
        }

        if let Some(ref memo) = arg.memo {
            let max_memo_size = self
                .icrc7_max_memo_size
                .unwrap_or(State::DEFAULT_MAX_MEMO_SIZE);
            if memo.len() as u32 > max_memo_size {
                return Err(RevokeTokenApprovalError::GenericBatchError {
                    error_code: 3,
                    message: "Exceeds Max Memo Size".into(),
                });
            }
        };

        match self.tokens.get(&arg.token_id) {
            None => Err(RevokeTokenApprovalError::NonExistingTokenId),
            Some(ref token) => {
                if token.token_owner != *caller {
                    return Err(RevokeTokenApprovalError::Unauthorized);
                }
                Ok(())
            }
        }
    }

    pub fn revoke_approve(
        &mut self,
        caller: &Principal,
        mut args: Vec<RevokeTokenApprovalArg>,
    ) -> Vec<Option<RevokeTokenApprovalResult>> {
        if args.len() == 0 {
            return vec![Some(Err(RevokeTokenApprovalError::GenericError {
                error_code: 1,
                message: "No Arguments Provided".into(),
            }))];
        }

        let max_update_batch_size = self.icrc7_max_update_batch_size().unwrap_or_default();

        if args.len() > max_update_batch_size as usize {
            return vec![Some(Err(RevokeTokenApprovalError::GenericError {
                error_code: 2,
                message: "Exceeds max update batch size".into(),
            }))];
        }

        let mut txn_results: Vec<Option<RevokeTokenApprovalResult>> = vec![None; args.len()];

        for (index, arg) in args.iter_mut().enumerate() {
            let caller = account_transformer(Account {
                owner: caller.clone(),
                subaccount: arg.from_subaccount,
            });
            if let Err(e) = self.mock_revoke_approve(&caller, arg) {
                txn_results.insert(index, Some(Err(e)))
            }
        }
        if let Some(true) = self.icrc7_atomic_batch_transfers {
            if txn_results
                .iter()
                .any(|res| res.is_some() && res.as_ref().unwrap().is_err())
            {
                return txn_results;
            }
        }

        for (index, arg) in args.iter().enumerate() {
            let caller = account_transformer(Account {
                owner: caller.clone(),
                subaccount: arg.from_subaccount,
            });
            if let Some(Err(e)) = txn_results.get(index).unwrap() {
                match e {
                    &RevokeTokenApprovalError::GenericBatchError {
                        error_code: _,
                        message: _,
                    } => return txn_results,
                    _ => continue,
                }
            }

            match self.token_approvals.get(&arg.token_id) {
                None => {
                    txn_results.insert(index, Some(Ok(arg.token_id)));
                }
                Some(mut token_approval) => {
                    token_approval.remove_approve(caller, arg.spender);
                }
            }

            let tid = self.log_transaction(
                TransactionType::Revoke {
                    tid: arg.token_id,
                    from: caller,
                    to: arg.spender,
                },
                ic_cdk::api::time(),
                arg.memo.clone(),
            );
            txn_results.insert(index, Some(Ok(tid)))
        }
        return txn_results;
    }

    fn mock_revoke_collection_approve(
        &self,
        caller: &Account,
        arg: &RevokeCollectionApprovalArg,
        current_time: &u64,
    ) -> Result<(), RevokeCollectionApprovalError> {
        if let Some(spender) = arg.spender {
            if spender == *caller {
                return Err(RevokeCollectionApprovalError::GenericBatchError {
                    error_code: 1,
                    message: "Spender cannot be caller".into(),
                });
            }
        }
        if let Some(created_at_time) = arg.created_at_time {
            let allowed_future_time = *current_time
                + self
                    .permitted_drift
                    .unwrap_or(State::DEFAULT_PERMITTED_DRIFT);

            if created_at_time < allowed_future_time {
                return Err(RevokeCollectionApprovalError::TooOld);
            }
        }

        if let Some(ref memo) = arg.memo {
            let max_memo_size = self
                .icrc7_max_memo_size
                .unwrap_or(State::DEFAULT_MAX_MEMO_SIZE);
            if memo.len() as u32 > max_memo_size {
                return Err(RevokeCollectionApprovalError::GenericBatchError {
                    error_code: 3,
                    message: "Exceeds Max Memo Size".into(),
                });
            }
        };
        Ok(())
    }

    pub fn revoke_collection_approve(
        &mut self,
        caller: &Principal,
        mut args: Vec<RevokeCollectionApprovalArg>,
    ) -> Vec<Option<RevokeCollectionApprovalResult>> {
        if args.len() == 0 {
            return vec![Some(Err(RevokeCollectionApprovalError::GenericError {
                error_code: 1,
                message: "No Arguments Provided".into(),
            }))];
        }

        let max_update_batch_size = self.icrc7_max_update_batch_size().unwrap_or_default();

        if args.len() > max_update_batch_size as usize {
            return vec![Some(Err(RevokeCollectionApprovalError::GenericError {
                error_code: 2,
                message: "Exceeds max update batch size".into(),
            }))];
        }

        let mut txn_results: Vec<Option<RevokeCollectionApprovalResult>> = vec![None; args.len()];
        let current_time = ic_cdk::api::time();

        for (index, arg) in args.iter_mut().enumerate() {
            let caller = account_transformer(Account {
                owner: caller.clone(),
                subaccount: arg.from_subaccount,
            });
            if let Err(e) = self.mock_revoke_collection_approve(&caller, arg, &current_time) {
                txn_results.insert(index, Some(Err(e)))
            }
        }
        if let Some(true) = self.icrc7_atomic_batch_transfers {
            if txn_results
                .iter()
                .any(|res| res.is_some() && res.as_ref().unwrap().is_err())
            {
                return txn_results;
            }
        }

        for (index, arg) in args.iter().enumerate() {
            let caller = account_transformer(Account {
                owner: caller.clone(),
                subaccount: arg.from_subaccount,
            });
            let user_account = UserAccount::new(caller);
            if let Some(Err(e)) = txn_results.get(index).unwrap() {
                match e {
                    &RevokeCollectionApprovalError::GenericBatchError {
                        error_code: _,
                        message: _,
                    } => return txn_results,
                    _ => continue,
                }
            }

            match self.collection_approvals.get(&user_account) {
                None => (),
                Some(mut collection_approval) => match arg.spender {
                    None => {
                        self.collection_approvals.remove(&user_account);
                    }
                    Some(spender) => {
                        collection_approval.remove_approve(spender);
                    }
                },
            }

            let tid = self.log_transaction(
                TransactionType::RevokeCollection {
                    from: caller,
                    to: arg.spender,
                },
                ic_cdk::api::time(),
                arg.memo.clone(),
            );
            txn_results.insert(index, Some(Ok(tid)))
        }
        return txn_results;
    }

    fn mock_transfer_from(
        &self,
        caller: &Account,
        arg: &TransferFromArg,
        current_time: &u64,
    ) -> Result<(), TransferFromError> {
        if arg.to == *caller {
            return Err(TransferFromError::GenericBatchError {
                error_code: 1,
                message: "Spender cannot be caller".into(),
            });
        }

        if let Some(time) = arg.created_at_time {
            let allowed_past_time = *current_time
                - self.tx_window.unwrap_or(State::DEFAULT_TX_WINDOW)
                - self
                    .permitted_drift
                    .unwrap_or(State::DEFAULT_PERMITTED_DRIFT);
            let allowed_future_time = *current_time
                + self
                    .permitted_drift
                    .unwrap_or(State::DEFAULT_PERMITTED_DRIFT);
            if time < allowed_past_time {
                return Err(TransferFromError::TooOld);
            } else if time > allowed_future_time {
                return Err(TransferFromError::CreatedInFuture {
                    ledger_time: current_time.clone(),
                });
            }

            if !self.is_approved_by_collection(&arg.from, &caller, *current_time)
                && !self.is_approved_by_token(&arg.token_id, &arg.from, &caller, *current_time)
            {
                return Err(TransferFromError::Unauthorized);
            }

            let transfer_arg: TransferArg = arg.clone().into();
            let result = self.txn_deduplication_check(&allowed_past_time, caller, &transfer_arg);
            match result {
                Ok(_) => (),
                Err(_) => {
                    return Err(TransferFromError::Duplicate {
                        duplicate_of: (arg.token_id),
                    });
                }
            }
        }

        if let Some(ref memo) = arg.memo {
            let max_memo_size = self
                .icrc7_max_memo_size
                .unwrap_or(State::DEFAULT_MAX_MEMO_SIZE);
            if memo.len() as u32 > max_memo_size {
                return Err(TransferFromError::GenericBatchError {
                    error_code: 3,
                    message: "Exceeds Max Memo Size".into(),
                });
            }
        };
        Ok(())
    }

    pub fn transfer_from(
        &mut self,
        caller: &Principal,
        mut args: Vec<TransferFromArg>,
    ) -> Vec<Option<TransferFromResult>> {
        if args.len() == 0 {
            return vec![Some(Err(TransferFromError::GenericError {
                error_code: 1,
                message: "No Arguments Provided".into(),
            }))];
        }

        let max_update_batch_size = self.icrc7_max_update_batch_size().unwrap_or_default();

        if args.len() > max_update_batch_size as usize {
            return vec![Some(Err(TransferFromError::GenericError {
                error_code: 2,
                message: "Exceeds max update batch size".into(),
            }))];
        }

        let mut txn_results: Vec<Option<TransferFromResult>> = vec![None; args.len()];
        let current_time = ic_cdk::api::time();

        for (index, arg) in args.iter_mut().enumerate() {
            let caller = account_transformer(Account {
                owner: caller.clone(),
                subaccount: arg.spender_subaccount,
            });
            if let Err(e) = self.mock_transfer_from(&caller, arg, &current_time) {
                txn_results.insert(index, Some(Err(e)))
            }
        }
        if let Some(true) = self.icrc7_atomic_batch_transfers {
            if txn_results
                .iter()
                .any(|res| res.is_some() && res.as_ref().unwrap().is_err())
            {
                return txn_results;
            }
        }

        for (index, arg) in args.iter().enumerate() {
            let caller_account = account_transformer(Account {
                owner: caller.clone(),
                subaccount: arg.spender_subaccount,
            });
            let time = arg.created_at_time.unwrap_or(current_time);
            if let Some(Err(e)) = txn_results.get(index).unwrap() {
                match e {
                    TransferFromError::GenericBatchError {
                        error_code: _,
                        message: _,
                    } => return txn_results,
                    _ => continue,
                }
            }
            let mut token = self.tokens.get(&arg.token_id).unwrap();
            token.transfer(arg.to.clone());
            self.token_approvals_clean(&arg.token_id);
            self.tokens.insert(arg.token_id, token);
            let txn_id = self.log_transaction(
                TransactionType::TransferFrom {
                    tid: arg.token_id,
                    from: arg.from.clone(),
                    to: arg.to.clone(),
                    spender: caller_account.clone(),
                },
                time,
                arg.memo.clone(),
            );
            txn_results[index] = Some(Ok(txn_id));
        }

        return txn_results;
    }

    pub fn icrc37_get_token_approvals(
        &self,
        token_id: u128,
        prev: Option<TokenApproval>,
        take: Option<u128>,
    ) -> Vec<TokenApproval> {
        let take = self.get_current_take(take);
        let mut results: Vec<TokenApproval> = vec![];
        let token = match self.tokens.get(&token_id) {
            Some(token) => token,
            None => return results,
        };

        if let Some(token_approvals) = self.token_approvals.get(&token_id) {
            if let Some(token_approvals) = token_approvals.into_map().get(&token.token_owner) {
                for (key, approval) in token_approvals.iter() {
                    if let Some(prev) = prev.clone() {
                        if key <= &prev.approval_info.spender {
                            continue;
                        }
                        results.push(TokenApproval {
                            token_id: token_id.clone(),
                            approval_info: approval.clone(),
                        });

                        if results.len() as u128 >= take {
                            return results;
                        }
                    }
                }
            }
        }

        return results;
    }

    pub fn icrc37_get_collection_approvals(
        &self,
        owner: Account,
        prev: Option<CollectionApproval>,
        take: Option<u128>,
    ) -> Vec<CollectionApproval> {
        let take = self.get_current_take(take);
        let user_owner = UserAccount::new(owner);
        let mut results: Vec<CollectionApproval> = vec![];
        match self.collection_approvals.get(&user_owner) {
            Some(owner_approval) => {
                for (key, approval) in owner_approval.into_map().iter() {
                    if let Some(prev) = prev.clone() {
                        if key <= &prev.spender {
                            continue;
                        }
                        results.push(approval.clone());

                        if results.len() as u128 >= take {
                            return results;
                        }
                    }
                }
            }
            None => return results,
        };

        return results;
    }

    pub fn icrc37_is_approved(&self, args: Vec<IsApprovedArg>) -> Vec<bool> {
        if args.is_empty() {
            return vec![];
        }

        let max_query_batch_size = self.icrc7_max_query_batch_size().unwrap_or_default();
        if args.len() > max_query_batch_size as usize {
            return vec![];
        }

        let caller = ic_cdk::caller();
        let current_time = ic_cdk::api::time();

        if caller == Principal::anonymous() {
            return vec![false; args.len()];
        }

        let mut result: Vec<bool> = vec![];
        for arg in args.iter() {
            let caller_account = account_transformer(Account {
                owner: caller.clone(),
                subaccount: arg.from_subaccount,
            });
            let is_approved_by_collection =
                self.is_approved_by_collection(&caller_account, &arg.spender, current_time);
            let is_approved_by_token = self.is_approved_by_token(
                &arg.token_id,
                &caller_account,
                &arg.spender,
                current_time,
            );
            if is_approved_by_collection || is_approved_by_token {
                result.push(true)
            } else {
                result.push(false)
            }
        }
        return result;
    }

    pub fn icrc7_token_metadata(&self, token_ids: &[u128]) -> Vec<Option<Icrc7TokenMetadata>> {
        if token_ids.len() as u16
            > self
                .icrc7_max_query_batch_size
                .unwrap_or(State::DEFAULT_MAX_QUERY_BATCH_SIZE)
        {
            ic_cdk::trap("Exceeds Max Query Batch Size")
        }
        let mut metadata_list = vec![None; token_ids.len()];
        for (index, tid) in token_ids.iter().enumerate() {
            if let Some(ref token) = self.tokens.get(tid) {
                metadata_list[index] = Some(token.token_metadata());
            }
        }
        metadata_list
    }

    pub fn icrc7_balance_of(&self, accounts: &[Account]) -> Vec<u128> {
        let mut count_list = vec![0; accounts.len()];
        accounts.iter().enumerate().for_each(|(index, account)| {
            self.tokens.iter().for_each(|(_id, ref token)| {
                if token.token_owner == *account {
                    let current_count = count_list[index];
                    count_list[index] = current_count + 1;
                }
            })
        });
        count_list
    }

    pub fn icrc7_tokens(&self, prev: Option<u128>, take: Option<u128>) -> Vec<u128> {
        let mut take = take.unwrap_or(State::DEFAULT_TAKE_VALUE);
        if take > self.icrc7_max_take_value().unwrap() {
            ic_cdk::trap("Exceeds Max Take Value")
        }

        let mut list: Vec<u128> = self.tokens.iter().map(|(k, _)| k).collect();
        list.sort();

        take = std::cmp::min(take, list.len() as u128);

        match prev {
            Some(prev) => match list.iter().position(|id| *id == prev) {
                None => vec![],
                Some(index) => list
                    .iter()
                    .map(|id| *id)
                    .skip(index)
                    .take(take as usize)
                    .collect(),
            },
            None => list[0..take as usize].to_vec(),
        }
    }

    pub fn icrc7_tokens_of(
        &self,
        account: Account,
        prev: Option<u128>,
        take: Option<u128>,
    ) -> Vec<u128> {
        let take = take.unwrap_or(State::DEFAULT_TAKE_VALUE);
        if take > State::DEFAULT_MAX_TAKE_VALUE {
            ic_cdk::trap("Exceeds Max Take Value")
        }
        let mut owned_tokens = vec![];
        for (id, token) in self.tokens.iter() {
            if token.token_owner == account {
                owned_tokens.push(id);
            }
        }
        owned_tokens.sort();
        match prev {
            None => owned_tokens[0..=take as usize].to_vec(),
            Some(prev) => match owned_tokens.iter().position(|id| *id == prev) {
                None => vec![],
                Some(index) => owned_tokens
                    .iter()
                    .map(|id| *id)
                    .skip(index)
                    .take(take as usize)
                    .collect(),
            },
        }
    }

    pub fn icrc7_txn_logs(&self, page_number: u32, page_size: u32) -> Vec<Transaction> {
        let offset = (page_number - 1) * page_size;
        if offset as u128 > self.get_current_txn_count() {
            ic_cdk::trap("Exceeds Max Offset Value")
        }
        let tx_logs = self
            .txn_ledger
            .iter()
            .skip(offset as usize)
            .take(page_size as usize)
            .map(|(_, txn)| txn.clone())
            .collect();

        tx_logs
    }

    pub fn icrc3_get_tip_certificate(&self) -> Option<DataCertificate> {
        let certificate = ic_cdk::api::data_certificate();
        let certificate_buf: Option<ByteBuf> = certificate.map(|vec| ByteBuf::from(vec));
        let witness = TREE.with(|tree| {
            let tree = tree.borrow();
            let mut witness = vec![];
            let mut witness_serializer = serde_cbor::Serializer::new(&mut witness);
            let _ = witness_serializer.self_describe();
            tree.witness(b"last_block_index")
                .serialize(&mut witness_serializer)
                .unwrap();
            tree.witness(b"last_block_hash")
                .serialize(&mut witness_serializer)
                .unwrap();
            witness
        });
        return Some(DataCertificate {
            certificate: certificate_buf,
            hash_tree: ByteBuf::from(witness),
        });
    }

    pub fn icrc3_get_blocks(&self, args: GetBlocksArgs) -> GetBlocksResult {
        let local_ledger_length = self.txn_ledger.len() as u128;
        let local_first_index = self.archive_ledger_info.first_index;
        let local_last_index = self.archive_ledger_info.last_index;

        let ledger_length = if local_last_index == 0 && local_ledger_length == 0 {
            0
        } else {
            local_last_index + 1
        };

        let mut local_blocks: Vec<QueryBlock> = vec![];
        let mut archived_blocks: BTreeMap<Principal, ArchivedTransactionResponse> = BTreeMap::new();

        //get the transactions on this canister
        for arg in args.clone() {
            if arg.start + arg.length > local_first_index {
                let start = if arg.start <= local_first_index {
                    0
                } else {
                    arg.start - local_first_index
                };

                let end = if local_ledger_length == 0 {
                    0
                } else if arg.start + arg.length >= local_first_index {
                    local_ledger_length - 1
                } else {
                    local_last_index
                        - local_first_index
                        - (local_last_index - (arg.start + arg.length))
                };

                if local_ledger_length > 0 {
                    for this_item in start..=end {
                        let tx_id = local_first_index + this_item;
                        let block_info = self.txn_ledger.get(&tx_id).unwrap().block.unwrap();
                        if this_item >= local_ledger_length {
                            break;
                        }
                        local_blocks.push(QueryBlock {
                            id: tx_id,
                            block: block_info.into_inner(),
                        });
                    }
                }
            }
        }

        //get any archive transactions
        for arg in args {
            let mut seeking = arg.start;
            for (key, tran_range) in &self.archive_ledger_info.archives {
                if (seeking > tran_range.start + tran_range.length - 1)
                    || (arg.start + arg.length <= tran_range.start)
                {
                    continue;
                };

                // Calculate the start and end indices of the intersection between the requested range and the current archive.
                let overlap_start = std::cmp::max(seeking, tran_range.start);
                let overlap_end = std::cmp::min(
                    arg.start + arg.length - 1,
                    tran_range.start + tran_range.length - 1,
                );
                let overlap_length = overlap_end - overlap_start + 1;

                match archived_blocks.get_mut(key) {
                    Some(archive) => {
                        archive.args.push(TransactionRange {
                            start: overlap_start,
                            length: overlap_length,
                        });
                    }
                    None => {
                        archived_blocks.insert(
                            *key,
                            ArchivedTransactionResponse {
                                args: vec![TransactionRange {
                                    start: overlap_start,
                                    length: overlap_length,
                                }],
                                callback: QueryTransactionsFn {
                                    canister_id: *key,
                                    method: "get_transactions".to_string(),
                                    _marker: std::marker::PhantomData,
                                },
                            },
                        );
                    }
                }

                // If the overlap ends exactly where the requested range ends, break out of the loop.
                if overlap_end == arg.start + arg.length - 1 {
                    break;
                };

                // Update seeking to the next desired transaction.
                seeking = overlap_end + 1;
            }
        }

        let archived_blocks_vec: Vec<ArchivedTransactionResponse> = archived_blocks
            .into_iter()
            .map(|(_, value)| value)
            .collect();

        return GetBlocksResult {
            blocks: local_blocks,
            log_length: ledger_length,
            archived_blocks: archived_blocks_vec,
        };
    }

    pub fn icrc3_get_archives(&self, arg: GetArchiveArgs) -> Vec<GetArchivesResultItem> {
        let mut results: Vec<GetArchivesResultItem> = vec![];
        let canister_id = ic_cdk::api::id();
        let mut is_found = match arg.from {
            None => true,
            Some(_) => false,
        };

        if is_found {
            results.push(GetArchivesResultItem {
                canister_id,
                start: self.archive_ledger_info.first_index,
                end: self.archive_ledger_info.last_index,
            })
        } else {
            if let Some(from) = arg.from {
                if from == canister_id {
                    is_found = true;
                }
            }
        }

        for (principal, range) in self.archive_ledger_info.archives.iter() {
            if is_found {
                if range.start + range.length >= 1 {
                    results.push(GetArchivesResultItem {
                        canister_id: *principal,
                        start: range.start,
                        end: range.start + range.length,
                    })
                }
            } else {
                if let Some(from) = arg.from {
                    if from == *principal {
                        is_found = true;
                    }
                }
            }
        }
        return results;
    }

    pub fn icrc3_get_tip(&self) -> Tip {
        if self.archive_ledger_info.latest_hash.is_none() {
            ic_cdk::trap("No root")
        }
        let witness = TREE.with(|tree| {
            let tree = tree.borrow();
            let mut witness = vec![];
            let mut witness_serializer = serde_cbor::Serializer::new(&mut witness);
            let _ = witness_serializer.self_describe();
            tree.witness(b"last_block_index")
                .serialize(&mut witness_serializer)
                .unwrap();
            tree.witness(b"last_block_hash")
                .serialize(&mut witness_serializer)
                .unwrap();
            witness
        });
        return Tip {
            last_block_hash: self.archive_ledger_info.latest_hash.unwrap(),
            last_block_index: self.archive_ledger_info.last_index.to_be_bytes().to_vec(),
            hash_tree: witness,
        };
    }

    pub fn get_txn_logs(&self, size: usize) -> Vec<Transaction> {
        let tx_logs: Vec<Transaction> = self
            .txn_ledger
            .iter()
            .take(size)
            .map(|(_, txn)| txn.clone())
            .collect();

        tx_logs
    }

    pub fn remove_txn_logs(&mut self, txn_ids: &Vec<u128>) -> bool {
        for txn_id in txn_ids {
            self.txn_ledger.remove(txn_id);
        }
        self.sync_pending_txn_ids = None;
        self.archive_txn_count += txn_ids.len() as u128;
        return true;
    }

    pub fn get_archive_txn_ledger(&self, size: usize) -> BTreeMap<u128, Transaction> {
        let mut to_archive: BTreeMap<u128, Transaction> = BTreeMap::new();
        for (key, value) in self.txn_ledger.iter().take(size) {
            to_archive.insert(key, value);
        }
        return to_archive;
    }

    pub fn add_archive(&mut self, canister_id: Principal, range: TransactionRange) -> bool {
        self.archive_ledger_info.archives.insert(canister_id, range);
        return true;
    }
}

thread_local! {
    pub static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    pub static STATE: RefCell<State> = RefCell::default();
    pub static TREE: RefCell<RbTree<&'static str, Hash>> = RefCell::new(RbTree::new());
    pub static TIMER_IDS: RefCell<Vec<TimerId>> = RefCell::new(Vec::new());
}

pub async fn call_sync_logs(
    archive_log_canister: Principal,
    txn_logs: Vec<Transaction>,
) -> SyncReceipt {
    // sync logs
    let call_result: Result<(SyncReceipt,), _> = ic_cdk::api::call::call(
        archive_log_canister,
        "insert_many_txn_log",
        (txn_logs.clone(),),
    )
    .await;

    match call_result {
        Ok(_) => Ok(txn_logs.len() as u32),
        Err((_rejection_code, _msg)) => Err(InsertTransactionError::RemoteError),
    }
}

async fn call_append_blocks(archive_log_canister: Principal, blocks: Vec<Block>) -> SyncReceipt {
    // sync logs
    ic_cdk::println!("call_append: {:?}", blocks);

    ic_cdk::println!(
        "append_blocks archive_log_canister: {:?}",
        archive_log_canister.to_text()
    );
    let call_result: Result<(), _> =
        ic_cdk::api::call::call(archive_log_canister, "append_blocks", (blocks.clone(),)).await;

    // ic_cdk::println!("call_append_blocks call_result: {:?}", call_result);

    match call_result {
        Ok(_) => Ok(blocks.len() as u32),
        Err((_rejection_code, _msg)) => Err(InsertTransactionError::RemoteError),
    }
}

fn set_clean_up_timer() {
    // set Timer
    let secs = Duration::from_secs(10);
    let clean_task = async {
        clean_local_ledger_task().await;
    };
    let timer_id = ic_cdk_timers::set_timer(secs, move || {
        ic_cdk::spawn(clean_task);
    });
    // Add the timer ID to the global vector.
    TIMER_IDS.with(|timer_ids| timer_ids.borrow_mut().push(timer_id));
}

async fn clean_local_ledger_task() {
    let txn_ledger_size = STATE.with(|s| s.borrow().txn_ledger.len());
    let setting = STATE.with(|s| s.borrow().archive_ledger_info.setting.clone());
    let local_first_index = STATE.with(|s| s.borrow().archive_ledger_info.first_index);
    let max_active_records = setting.max_active_records;
    let max_records_in_archive_instance = setting.max_records_in_archive_instance;
    let max_records_to_archive = setting.max_records_to_archive;
    let settle_to_records = setting.settle_to_records;
    let archive_cycles = setting.archive_cycles;
    let archive_controllers = setting.archive_controllers;
    let max_archive_pages = setting.max_archive_pages;

    let local_cycles = ic_cdk::api::canister_balance128();

    let mut is_recall_at_end = false;

    let archive_count = STATE.with(|s| s.borrow().archive_ledger_info.archives.len());

    if txn_ledger_size < max_active_records as u64 {
        ic_cdk::println!("clean_local_ledger_task: txn_ledger_size < max_active_records, don't clean if not necessary");
        return;
    }

    if txn_ledger_size < settle_to_records as u64 {
        ic_cdk::println!("clean_local_ledger_task: txn_ledger_size < settle_to_records, don't clean if not necessary");
        return;
    }

    STATE.with(|s: &RefCell<State>| s.borrow_mut().archive_ledger_info.is_cleaning = true);
    ic_cdk::println!("clean_local_ledger_task: Now we are cleaning");

    let mut last_archive: Option<(Principal, TransactionRange)> = None;
    let mut capacity: u128 = 0;

    if archive_count == 0 {
        ic_cdk::println!("clean_local_ledger_task: create a new archive canister");
        let create_args: ArchiveCreateArgs = ArchiveCreateArgs {
            max_pages: max_archive_pages,
            max_records: max_active_records,
            first_index: 0,
            controllers: archive_controllers,
        };
        // ic_cdk::println!("local_cycles: {}", local_cycles);
        // ic_cdk::println!("archive_cycles: {}", archive_cycles);

        if local_cycles > (archive_cycles * 2) {
            let archive_canister: Result<Principal, String> =
                create_archive_canister(create_args).await;
            match archive_canister {
                Ok(canister_id) => {
                    let range = TransactionRange {
                        start: 0,
                        length: 0,
                    };
                    STATE.with(|s: &RefCell<State>| {
                        s.borrow_mut().add_archive(canister_id, range.clone())
                    });

                    last_archive = Some((canister_id, range));
                    capacity = max_records_in_archive_instance;
                }
                Err(_) => {
                    ic_cdk::println!(
                        "clean_local_ledger_task: create a new archive canister error"
                    );
                    STATE.with(|s: &RefCell<State>| {
                        s.borrow_mut().archive_ledger_info.is_cleaning = false
                    });
                }
            }
        } else {
            STATE.with(|s: &RefCell<State>| s.borrow_mut().archive_ledger_info.is_cleaning = false);
            return;
        }
    } else {
        let current_last_archive = STATE.with(|s| {
            s.borrow()
                .archive_ledger_info
                .archives
                .clone()
                .into_iter()
                .last()
        });

        if let Some(current_last_archive) = current_last_archive {
            if current_last_archive.1.length >= max_records_in_archive_instance {
                ic_cdk::println!(
                    "clean_local_ledger_task: old archive is full, create a new archive canister"
                );

                let create_args: ArchiveCreateArgs = ArchiveCreateArgs {
                    max_pages: max_archive_pages,
                    max_records: max_active_records,
                    first_index: current_last_archive.1.start + current_last_archive.1.length,
                    controllers: archive_controllers,
                };

                if local_cycles > (archive_cycles * 2) {
                    let archive_canister: Result<Principal, String> =
                        create_archive_canister(create_args).await;
                    match archive_canister {
                        Ok(canister_id) => {
                            let range = TransactionRange {
                                start: local_first_index,
                                length: 0,
                            };
                            STATE.with(|s: &RefCell<State>| {
                                s.borrow_mut().add_archive(canister_id, range.clone())
                            });
                            last_archive = Some((canister_id, range));
                            capacity = max_records_in_archive_instance;
                        }
                        Err(_) => {
                            ic_cdk::println!(
                                "clean_local_ledger_task: create a new archive canister error"
                            );
                            STATE.with(|s: &RefCell<State>| {
                                s.borrow_mut().archive_ledger_info.is_cleaning = false
                            });
                        }
                    }
                } else {
                    STATE.with(|s: &RefCell<State>| {
                        s.borrow_mut().archive_ledger_info.is_cleaning = false
                    });
                    return;
                }
            } else {
                last_archive = Some(current_last_archive.clone());
                capacity = max_records_in_archive_instance - current_last_archive.1.length;
            }
        }
    }

    // call_append_transactions
    if let Some(last_archive) = last_archive {
        let mut archive_amount = (txn_ledger_size as u128) - settle_to_records;

        if archive_amount > capacity {
            is_recall_at_end = true;
            archive_amount = capacity;
        }

        if archive_amount > max_records_to_archive {
            is_recall_at_end = true;
            archive_amount = max_records_to_archive;
        }

        let to_archive: BTreeMap<u128, Transaction> = STATE.with(|s| {
            s.borrow_mut()
                .get_archive_txn_ledger(archive_amount as usize)
        });

        let mut to_archive_vec = Vec::new();
        let mut to_archive_ids = Vec::new();
        for (key_id, transaction) in to_archive.iter() {
            to_archive_vec.push(transaction.block.clone().unwrap());
            to_archive_ids.push(key_id.clone());
        }
        let to_archive_amount = to_archive_vec.len() as u128;

        ic_cdk::println!(
            "clean_local_ledger_task: to_archive size {}",
            to_archive_amount
        );

        let call_result = call_append_blocks(last_archive.0, to_archive_vec).await;

        match call_result {
            Ok(_count) => {
                STATE.with(|s| s.borrow_mut().remove_txn_logs(&to_archive_ids));
                STATE.with(|s| s.borrow_mut().archive_ledger_info.first_index += to_archive_amount);
                STATE.with(|s| {
                    if let Some(transaction_range) = s
                        .borrow_mut()
                        .archive_ledger_info
                        .archives
                        .get_mut(&last_archive.0)
                    {
                        transaction_range.length += to_archive_amount;
                        transaction_range.start = transaction_range.start;
                    }
                });
            }
            Err(_) => {
                STATE.with(|s: &RefCell<State>| {
                    s.borrow_mut().archive_ledger_info.is_cleaning = false
                });
                ic_cdk::println!("clean_local_ledger_task: to_archive fail");
            }
        }
    }

    STATE.with(|s: &RefCell<State>| s.borrow_mut().archive_ledger_info.is_cleaning = false);

    if is_recall_at_end {
        set_clean_up_timer()
    }
}
