use std::time::{SystemTime, UNIX_EPOCH};

use candid::Principal;

use crate::{
    get_current_threshold_index, get_current_threshold_index_mem, get_total_LBRY_burn,
    get_total_lbry_burned_mem, Logs, LOGS,
};

pub const ALEX_CANISTER_ID: &str = "7hcrm-4iaaa-aaaak-akuka-cai";
pub const ICP_SWAP_CANISTER_ID: &str = "5qx27-tyaaa-aaaal-qjafa-cai";
pub const LIBRARIAN: &str = "xswc6-jimwj-wnqog-3gmkv-hglw4-aedfy-bqmr2-5uyut-cnbbg-4wvsk-bqe";
pub const RANDOM_USER: &str = "xswc6-jimwj-wnqog-3gmkv-hglw4-aedfy-bqmr2-5uyut-cnbbg-4wvsk-bqe";
pub const FRONTEND_CANISTER_ID: &str = "xo3nl-yaaaa-aaaap-abl4q-cai";
pub const MAX_ALEX: u64 = 2100000000000000; // 21 million
pub const LBRY_CANISTER_ID: &str = "hdtfn-naaaa-aaaam-aciva-cai";

pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}
pub(crate) fn add_to_total_LBRY_burned(amount: u64) -> Result<(), String> {
    let current_total = get_total_LBRY_burn();
    let new_total = current_total
        .checked_add(amount)
        .ok_or("Arithmetic overflow occurred in fn add_to_total_LBRY_burned() ")?;
    let mut result = get_total_lbry_burned_mem();
    result.insert((), new_total);
    Ok(())
}

pub(crate) fn update_to_current_threshold(index: u32) -> Result<(), String> {
    let current_index = get_current_threshold_index();
    if current_index != index {
        let new_index = index;
        let mut result = get_current_threshold_index_mem();
        result.insert((), new_index);
    }
    Ok(())
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
    ic_cdk::println!("Error Logged :{}", message);
}
