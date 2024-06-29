use candid::Principal;
use ic_cdk_macros::query;
use icrc_ledger_types::icrc1::account::Account;

use crate::{icrc7_types::Transaction, state::STATE, Icrc7TokenMetadata, Standard};

#[query]
pub fn icrc7_symbol() -> String {
    STATE.with(|s| s.borrow().icrc7_symbol())
}

#[query]
pub fn icrc7_name() -> String {
    STATE.with(|s| s.borrow().icrc7_name())
}

#[query]
pub fn icrc7_description() -> Option<String> {
    STATE.with(|s| s.borrow().icrc7_description())
}

#[query]
pub fn icrc7_logo() -> Option<String> {
    STATE.with(|s| s.borrow().icrc7_logo())
}

#[query]
pub fn icrc7_total_supply() -> u128 {
    STATE.with(|s| s.borrow().icrc7_total_supply())
}

#[query]
pub fn icrc7_supply_cap() -> Option<u128> {
    STATE.with(|s| s.borrow().icrc7_supply_cap())
}

#[query]
pub fn icrc7_max_query_batch_size() -> Option<u16> {
    STATE.with(|s| s.borrow().icrc7_max_query_batch_size())
}

#[query]
pub fn icrc7_max_update_batch_size() -> Option<u16> {
    STATE.with(|s| s.borrow().icrc7_max_update_batch_size())
}

#[query]
pub fn icrc7_default_take_value() -> Option<u128> {
    STATE.with(|s| s.borrow().icrc7_default_take_value())
}

#[query]
pub fn icrc7_max_take_value() -> Option<u128> {
    STATE.with(|s| s.borrow().icrc7_max_take_value())
}

#[query]
pub fn icrc7_max_memo_size() -> Option<u32> {
    STATE.with(|s| s.borrow().icrc7_max_memo_size())
}

#[query]
pub fn icrc7_atomic_batch_transfers() -> Option<bool> {
    STATE.with(|s| s.borrow().icrc7_atomic_batch_transfers())
}

#[query]
pub fn icrc7_owner_of(ids: Vec<u128>) -> Vec<Option<Account>> {
    STATE.with(|s| s.borrow().icrc7_owner_of(&ids))
}

#[query]
pub fn icrc7_supported_standards() -> Vec<Standard> {
    vec![
        Standard {
            name: "ICRC-7".into(),
            url: "https://github.com/dfinity/ICRC/tree/main/ICRCs/ICRC-7".into(),
        },
        Standard {
            name: "ICRC-10".into(),
            url: "https://github.com/dfinity/ICRC/tree/main/ICRCs/ICRC-10".into(),
        },
        Standard {
            name: "ICRC-37".into(),
            url: "https://github.com/dfinity/ICRC/tree/main/ICRCs/ICRC-37".into(),
        },
        Standard {
            name: "ICRC-3".into(),
            url: "https://github.com/dfinity/ICRC/tree/main/ICRCs/ICRC-3".into(),
        },
    ]
}

#[query]
pub fn icrc7_tokens(prev: Option<u128>, take: Option<u128>) -> Vec<u128> {
    STATE.with(|s| s.borrow().icrc7_tokens(prev, take))
}

#[query]
pub fn icrc7_token_metadata(token_ids: Vec<u128>) -> Vec<Option<Icrc7TokenMetadata>> {
    STATE.with(|s| s.borrow().icrc7_token_metadata(&token_ids))
}

#[query]
pub fn icrc7_balance_of(accounts: Vec<Account>) -> Vec<u128> {
    STATE.with(|s| s.borrow().icrc7_balance_of(&accounts))
}

#[query]
pub fn icrc7_tokens_of(account: Account, prev: Option<u128>, take: Option<u128>) -> Vec<u128> {
    STATE.with(|s| s.borrow().icrc7_tokens_of(account, prev, take))
}

#[query]
pub fn minting_authority() -> Option<Account> {
    STATE.with(|s| s.borrow().icrc7_minting_authority())
}

#[query]
pub fn txn_logs(page_number: u32, page_size: u32) -> Vec<Transaction> {
    STATE.with(|s| s.borrow().icrc7_txn_logs(page_number, page_size))
}

#[query]
pub fn archive_log_canister() -> Option<Principal> {
    STATE.with(|s| s.borrow().get_archive_log_canister())
}
