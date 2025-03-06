use std::time::{ SystemTime, UNIX_EPOCH };

use candid::Principal;
use ic_cdk::caller;

use crate::{
    get_current_threshold_index,
    get_current_threshold_index_mem,
    get_total_LBRY_burn,
    get_total_lbry_burned_mem,
    ExecutionError,
    Logs,
    TokenLogType,
    TokenLogs,
    DEFAULT_ADDITION_OVERFLOW_ERROR,
    LOGS,
    TOKEN_LOGS,
    TOKEN_LOG_COUNTER,
};

pub const ALEX_CANISTER_ID: &str = "ysy5f-2qaaa-aaaap-qkmmq-cai";
pub const ICP_SWAP_CANISTER_ID: &str = "54fqz-5iaaa-aaaap-qkmqa-cai";
pub const LIBRARIAN: &str = "xswc6-jimwj-wnqog-3gmkv-hglw4-aedfy-bqmr2-5uyut-cnbbg-4wvsk-bqe";
pub const FRONTEND_CANISTER_ID: &str = "yj5ba-aiaaa-aaaap-qkmoa-cai";
pub const MAX_ALEX: u64 = 2100000000000000; // 21 million
pub const LBRY_CANISTER_ID: &str = "y33wz-myaaa-aaaap-qkmna-cai";
pub const TOKEN_LOGS_LIMIT: u64 = 100_000;

pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}
pub(crate) fn add_to_total_LBRY_burned(amount: u64) -> Result<(), ExecutionError> {
    let current_total = get_total_LBRY_burn();
    let new_total = current_total.checked_add(amount).ok_or_else(||
        ExecutionError::new_with_log(caller(), "mint_ALEX", ExecutionError::AdditionOverflow {
            operation: DEFAULT_ADDITION_OVERFLOW_ERROR.to_string(),
            details: format!("current_total: {} with amount: {}", current_total, amount),
        })
    )?;
    let mut result = get_total_lbry_burned_mem();
    result.insert((), new_total);
    return Ok(());
}

pub(crate) fn update_to_current_threshold(index: u32) {
    let current_index = get_current_threshold_index();
    if current_index != index {
        let new_index = index;
        let mut result = get_current_threshold_index_mem();
        result.insert((), new_index);
    }
}

pub fn update_log(message: &str) {
    LOGS.with(|logs| {
        let mut logs = logs.borrow_mut();
        logs.push(Logs {
            log: message.to_string(),
            time: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("Time went backwards")
                .as_secs(),
        });
    });
}

// Function to register an info log

pub fn register_info_log(caller: Principal, function: &str, detail: &str) {
    let timestamp = ic_cdk::api::time();
    let log_id =
        TOKEN_LOG_COUNTER.with(|counter| {
            let next_id = *counter.borrow() + 1;
            *counter.borrow_mut() = next_id;
            next_id
        }) % TOKEN_LOGS_LIMIT;
    let log_entry = TokenLogs {
        log_id,
        timestamp,
        caller,
        function: function.to_string(),
        log_type: TokenLogType::Info {
            detail: detail.to_string(),
        },
    };

    TOKEN_LOGS.with(|logs| logs.borrow_mut().insert(log_id, log_entry));
}

// Function to register an error log
pub fn register_error_log(caller: Principal, function: &str, error: ExecutionError) {
    let log_id =
        TOKEN_LOG_COUNTER.with(|counter| {
            let next_id = *counter.borrow() + 1;
            *counter.borrow_mut() = next_id;
            next_id
        }) % TOKEN_LOGS_LIMIT;
    let timestamp = ic_cdk::api::time();
    let log_entry = TokenLogs {
        log_id,
        timestamp,
        caller,
        function: function.to_string(),
        log_type: TokenLogType::Error { error },
    };

    TOKEN_LOGS.with(|logs| logs.borrow_mut().insert(log_id, log_entry));
}
