use ic_cdk;
use candid::{Nat, Principal};
use ic_cdk::api::call::CallResult;

mod storage; // Import the new storage module
use storage::TokenIdList; // Import the TokenIdList wrapper type

pub const ICRC7_CANISTER_ID: &str = "53ewn-qqaaa-aaaap-qkmqq-cai";
pub const ICRC7_SCION_CANISTER_ID: &str = "uxyan-oyaaa-aaaap-qhezq-cai";
const ICRC7_TOKEN_FETCH_BATCH_SIZE: u32 = 100;

// Storage keys for different ICRC7 sources
const STORAGE_KEY_ICRC7_MAIN: u8 = 0;
const STORAGE_KEY_ICRC7_SCION: u8 = 1;

pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

pub fn icrc7_principal() -> Principal {
    get_principal(ICRC7_CANISTER_ID)
}

pub fn icrc7_scion_principal() -> Principal {
    get_principal(ICRC7_SCION_CANISTER_ID)
}

// Private helper function to store token IDs for a given canister and storage key
async fn _store_token_ids_for_target_canister(
    target_canister_principal: Principal,
    storage_key: u8,
) -> Result<(), String> {
    let batch_size_nat = Nat::from(ICRC7_TOKEN_FETCH_BATCH_SIZE);
    let mut all_fetched_token_ids_this_run: Vec<Nat> = Vec::new();
    let mut current_offset = Nat::from(0u32);
    let mut any_tokens_fetched_in_this_run = false;

    ic_cdk::println!(
        "Starting to fetch all token IDs for storage key {} from canister: {}",
        storage_key,
        target_canister_principal
    );

    loop {
        let call_args = (current_offset.clone(), batch_size_nat.clone());
        ic_cdk::println!(
            "Calling icrc7_tokens for key {} on {} with offset: {}, limit: {}",
            storage_key,
            target_canister_principal,
            current_offset,
            batch_size_nat
        );

        let result: CallResult<(Vec<Nat>,)> =
            ic_cdk::call(target_canister_principal, "icrc7_tokens", call_args).await;

        match result {
            Ok((batch_of_tokens,)) => {
                ic_cdk::println!(
                    "Received batch of {} tokens for key {}.",
                    batch_of_tokens.len(),
                    storage_key
                );

                if batch_of_tokens.is_empty() {
                    ic_cdk::println!(
                        "Received an empty batch for key {}, assuming no more tokens to fetch.",
                        storage_key
                    );
                    break;
                }

                all_fetched_token_ids_this_run.extend(batch_of_tokens.clone());
                any_tokens_fetched_in_this_run = true;
                current_offset += Nat::from(batch_of_tokens.len());
            }
            Err((code, msg)) => {
                let error_message = format!(
                    "Error calling icrc7_tokens for key {}: code {:?}, message: {}. Halting fetch.",
                    storage_key, code, msg
                );
                ic_cdk::println!("{}", error_message);
                return Err(error_message);
            }
        }
    }

    all_fetched_token_ids_this_run.sort_unstable();
    all_fetched_token_ids_this_run.dedup();

    let final_token_count = all_fetched_token_ids_this_run.len();
    let token_id_list_to_store = TokenIdList(all_fetched_token_ids_this_run);

    storage::TOKEN_ID_LIST.with(|map| {
        map.borrow_mut().insert(storage_key, token_id_list_to_store);
    });

    if any_tokens_fetched_in_this_run {
        ic_cdk::println!(
            "Successfully fetched and stored token list for key {}. Total unique tokens now: {}.",
            storage_key,
            final_token_count
        );
    } else {
        ic_cdk::println!(
            "No token IDs were found on canister {} for key {}. Stored list is now empty. Total unique tokens: 0.",
            target_canister_principal,
            storage_key
        );
    }
    Ok(())
}

#[ic_cdk::update]
async fn store_icrc7_main_token_ids() -> Result<(), String> {
    _store_token_ids_for_target_canister(icrc7_principal(), STORAGE_KEY_ICRC7_MAIN).await
}

#[ic_cdk::update]
async fn store_icrc7_scion_token_ids() -> Result<(), String> {
    _store_token_ids_for_target_canister(icrc7_scion_principal(), STORAGE_KEY_ICRC7_SCION).await
}

#[ic_cdk::query]
fn get_stored_icrc7_main_token_ids() -> Option<Vec<Nat>> {
    storage::TOKEN_ID_LIST.with(|map| {
        map.borrow()
            .get(&STORAGE_KEY_ICRC7_MAIN)
            .map(|token_id_list| token_id_list.0.clone())
    })
}

#[ic_cdk::query]
fn get_stored_icrc7_main_token_ids_count() -> usize {
    storage::TOKEN_ID_LIST.with(|map| {
        map.borrow()
            .get(&STORAGE_KEY_ICRC7_MAIN)
            .map_or(0, |token_id_list| token_id_list.0.len())
    })
}

#[ic_cdk::query]
fn get_stored_icrc7_scion_token_ids() -> Option<Vec<Nat>> {
    storage::TOKEN_ID_LIST.with(|map| {
        map.borrow()
            .get(&STORAGE_KEY_ICRC7_SCION)
            .map(|token_id_list| token_id_list.0.clone())
    })
}

#[ic_cdk::query]
fn get_stored_icrc7_scion_token_ids_count() -> usize {
    storage::TOKEN_ID_LIST.with(|map| {
        map.borrow()
            .get(&STORAGE_KEY_ICRC7_SCION)
            .map_or(0, |token_id_list| token_id_list.0.len())
    })
}

ic_cdk::export_candid!();