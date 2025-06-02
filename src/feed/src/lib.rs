use ic_cdk;
use candid::{Nat, Principal};
use ic_cdk::api::call::CallResult;
use ic_cdk_macros::{query, update};
use ic_cdk_timers::TimerId;
use ic_stable_structures::{StableBTreeMap, Storable};
use num_bigint::BigUint;
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use std::{
    cell::RefCell,
    collections::HashMap,
    time::Duration,
};

mod storage; // Import the new storage module
use storage::{TokenIdList, SbtCount, StorableNat, STORAGE_KEY_ICRC7_MAIN, STORAGE_KEY_ICRC7_SCION, OG_NFT_SBT_COUNTS, RarityPercentage, OG_NFT_RARITY_PERCENTAGES, ExecutionLogEntry, LogKey, ExecutionStatus, NEXT_LOG_KEY, EXECUTION_LOGS}; // Added StorableNat, RarityPercentage, OG_NFT_RARITY_PERCENTAGES

pub const ICRC7_CANISTER_ID: &str = "53ewn-qqaaa-aaaap-qkmqq-cai";
pub const ICRC7_SCION_CANISTER_ID: &str = "uxyan-oyaaa-aaaap-qhezq-cai";
const ICRC7_TOKEN_FETCH_BATCH_SIZE: u32 = 100;

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
fn get_stored_icrc7_main_token_ids_count() -> usize {
    storage::TOKEN_ID_LIST.with(|map| {
        map.borrow()
            .get(&STORAGE_KEY_ICRC7_MAIN)
            .map_or(0, |token_id_list| token_id_list.0.len())
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

// Copied and adapted from nft_manager/src/id_converter.rs
fn hash_principal(principal: &Principal) -> u64 {
    let principal_bytes = principal.as_slice();
    
    let mut hasher = Sha256::new();
    hasher.update(principal_bytes);
    let result = hasher.finalize();
    
    let mut bytes = [0u8; 8];
    bytes.copy_from_slice(&result[0..8]);
    u64::from_be_bytes(bytes)
}

// Copied and adapted from nft_manager/src/id_converter.rs
pub fn scion_to_og_id(scion_id: Nat) -> Nat {
    // Convert to BigUint for bitwise operations
    let scion_big: BigUint = scion_id.0.clone(); // .0 to access the BigUint inside Nat
    
    // Extract principal hash (first 64 bits after shifting right)
    let shifted = scion_big.clone() >> 256u32;
    let mask = (BigUint::from(1u64) << 64u32) - BigUint::from(1u64);
    // The hash_principal function is not directly used here as the scion ID
    // already encodes the information needed to reverse the process without
    // needing the original principal. The logic here is to reverse the
    // og_to_scion_id operation.
    let principal_hash_extracted_from_scion_id = shifted & mask;
    
    // Reconstruct original number using XOR
    // This assumes the original og_to_scion_id was:
    // let shifted_original_principal_hash = original_principal_hash_big_uint << 256u32;
    // let scion_result = shifted_original_principal_hash ^ og_big;
    // So, to reverse: og_big = scion_result ^ shifted_original_principal_hash
    let reconstructed_shifted_hash = principal_hash_extracted_from_scion_id << 256u32;
    let result = scion_big ^ reconstructed_shifted_hash;
    
    Nat::from(result)
}

#[update]
async fn update_og_nft_sbt_counts() -> Result<(), String> {
    ic_cdk::println!("Starting update_og_nft_sbt_counts...");

    let sbt_id_list_option = storage::TOKEN_ID_LIST.with(|map| {
        map.borrow().get(&STORAGE_KEY_ICRC7_SCION)
    });

    if let Some(sbt_id_list) = sbt_id_list_option {
        if sbt_id_list.0.is_empty() {
            ic_cdk::println!("No SBTs found in storage. Clearing existing counts (if any) and exiting.");
            // Clear existing counts if no SBTs are found
            OG_NFT_SBT_COUNTS.with(|map_ref| {
                let mut map = map_ref.borrow_mut();
                // Iterating and removing is safer if the map is large, but for smaller maps, re-initializing might be an option
                // For now, let's assume we just want to ensure it's empty or reflects the new (empty) state.
                // A simple approach if we want to clear and a `clear()` method isn't directly available on StableBTreeMap:
                // Re-initialize or iterate and remove. Since StableBTreeMap doesn't have `clear`, we'd have to iterate keys and remove.
                // However, if there are no SBTs, we simply don't add anything, and old counts for non-existent SBT-derived OG IDs become stale.
                // A better approach: calculate new counts and overwrite. If an OG ID no longer has SBTs, it won't be in the new_og_nft_counts.
                // So, we should clear the map first then populate.
                // For StableBTreeMap, clearing involves iterating through keys and removing them one by one, or reinitializing the memory.
                // Let's re-evaluate clearing after calculating new counts.
            });
            // Fall through to the part where we would clear and repopulate.
            // An empty new_og_nft_counts will effectively clear (by not adding back removed items)
        }

        let mut new_og_nft_counts: HashMap<Nat, u32> = HashMap::new();
        ic_cdk::println!("Calculating OG NFT counts from {} stored SBTs.", sbt_id_list.0.len());
        for sbt_id in sbt_id_list.0.iter() {
            let og_id_nat = scion_to_og_id(sbt_id.clone()); // This is Nat
            *new_og_nft_counts.entry(og_id_nat).or_insert(0) += 1;
        }

        ic_cdk::println!("Storing {} unique OG NFT SBT counts.", new_og_nft_counts.len());
        
        // Clear the old map first by removing all existing keys
        let old_keys: Vec<StorableNat> = OG_NFT_SBT_COUNTS.with(|map_ref| { // Keys are StorableNat
            map_ref.borrow().iter().map(|(k, _v)| k.clone()).collect()
        });
        if !old_keys.is_empty() {
             ic_cdk::println!("Clearing {} old entries from OG_NFT_SBT_COUNTS.", old_keys.len());
        }
        OG_NFT_SBT_COUNTS.with(|map_ref| {
            let mut map = map_ref.borrow_mut();
            for key_storable_nat in old_keys { // key_storable_nat is StorableNat
                map.remove(&key_storable_nat); // Remove takes &StorableNat
            }
        });

        // Insert new counts
        OG_NFT_SBT_COUNTS.with(|map_ref| {
            let mut map = map_ref.borrow_mut();
            for (og_id_nat, count) in new_og_nft_counts { // og_id_nat is Nat
                map.insert(StorableNat(og_id_nat), SbtCount(count)); // Wrap Nat in StorableNat for key
            }
        });
        ic_cdk::println!("Successfully updated OG NFT SBT counts.");
        Ok(())
    } else {
        let msg = format!("SBT ID list not found in storage for key {}. Cannot update counts.", STORAGE_KEY_ICRC7_SCION);
        ic_cdk::println!("{}", msg);
        // If no SBT list, clear the counts map as well, as current counts are invalid.
        let old_keys: Vec<StorableNat> = OG_NFT_SBT_COUNTS.with(|map_ref| { // Keys are StorableNat
            map_ref.borrow().iter().map(|(k, _v)| k.clone()).collect()
        });
        if !old_keys.is_empty() {
            ic_cdk::println!("Clearing {} stale entries from OG_NFT_SBT_COUNTS due to missing SBT list.", old_keys.len());
        }
        OG_NFT_SBT_COUNTS.with(|map_ref| {
            let mut map = map_ref.borrow_mut();
            for key_storable_nat in old_keys { // key_storable_nat is StorableNat
                map.remove(&key_storable_nat); // Remove takes &StorableNat
            }
        });
        Err(msg)
    }
}

#[query]
fn get_sbt_counts_for_og_nfts(og_ids: Vec<Nat>) -> HashMap<Nat, u32> {
    let mut result_counts: HashMap<Nat, u32> = HashMap::new();

    OG_NFT_SBT_COUNTS.with(|map_ref| {
        let map = map_ref.borrow();
        for og_id_nat in og_ids { // og_id_nat is Nat
            if let Some(sbt_count) = map.get(&StorableNat(og_id_nat.clone())) { // Wrap Nat in StorableNat for lookup
                result_counts.insert(og_id_nat, sbt_count.0); // Key for HashMap is Nat, value is u32
            }
        }
    });
    
    result_counts
}

#[update]
async fn update_og_nft_rarity_percentages() -> Result<(), String> {
    ic_cdk::println!("Starting update_og_nft_rarity_percentages...");

    let mut og_nft_data: Vec<(Nat, u32)> = OG_NFT_SBT_COUNTS.with(|map_ref| {
        map_ref.borrow().iter()
            .map(|(storable_nat_key, sbt_count_val)| (storable_nat_key.0.clone(), sbt_count_val.0))
            .collect()
    });

    if og_nft_data.is_empty() {
        ic_cdk::println!("No OG NFT SBT counts found. Clearing existing rarity percentages (if any).");
        let old_rarity_keys: Vec<StorableNat> = OG_NFT_RARITY_PERCENTAGES.with(|map_ref| {
            map_ref.borrow().iter().map(|(k, _v)| k.clone()).collect()
        });
        if !old_rarity_keys.is_empty() {
            ic_cdk::println!("Clearing {} old entries from OG_NFT_RARITY_PERCENTAGES.", old_rarity_keys.len());
        }
        OG_NFT_RARITY_PERCENTAGES.with(|map_ref| {
            let mut map = map_ref.borrow_mut();
            for key in old_rarity_keys {
                map.remove(&key);
            }
        });
        return Ok(());
    }

    // Sort NFTs:
    // 1. By SBT count (descending) - more likes = rarer
    // 2. By OG NFT ID (ascending) - lower ID = rarer for ties
    og_nft_data.sort_by(|a, b| {
        match b.1.cmp(&a.1) { // Compare SBT counts (b vs a for descending)
            std::cmp::Ordering::Equal => a.0.cmp(&b.0), // Compare OG NFT IDs (a vs b for ascending)
            other => other,
        }
    });

    let total_unique_nfts = og_nft_data.len();
    ic_cdk::println!("Calculating rarity for {} unique OG NFTs based on SBT counts and IDs.", total_unique_nfts);

    let mut new_rarity_percentages: HashMap<StorableNat, RarityPercentage> = HashMap::new();

    for (rank, (og_id, sbt_count)) in og_nft_data.iter().enumerate() {
        let percentage = if total_unique_nfts == 1 {
            10000 // Represents 100.00%
        } else {
            // Linear distribution: rank 0 gets 10000, rank (total_unique_nfts - 1) gets 0.
            // Formula: 10000 * (total_items - 1 - rank) / (total_items - 1)
            let rarity_val = 10000.0 * (total_unique_nfts - 1 - rank) as f64 / (total_unique_nfts - 1) as f64;
            rarity_val.round() as u32 // Store as u32
        };
        ic_cdk::println!("OG ID: {}, SBTs: {}, Rank: {}, Rarity value (x100): {}", og_id, sbt_count, rank, percentage);
        new_rarity_percentages.insert(StorableNat(og_id.clone()), RarityPercentage(percentage));
    }
    
    // Clear old rarity percentages
    let old_rarity_keys: Vec<StorableNat> = OG_NFT_RARITY_PERCENTAGES.with(|map_ref| {
        map_ref.borrow().iter().map(|(k, _v)| k.clone()).collect()
    });
    if !old_rarity_keys.is_empty() {
        ic_cdk::println!("Clearing {} old entries from OG_NFT_RARITY_PERCENTAGES.", old_rarity_keys.len());
    }
    OG_NFT_RARITY_PERCENTAGES.with(|map_ref| {
        let mut map = map_ref.borrow_mut();
        for key in old_rarity_keys {
            map.remove(&key);
        }
    });

    // Insert new rarity percentages
    OG_NFT_RARITY_PERCENTAGES.with(|map_ref| {
        let mut map = map_ref.borrow_mut();
        for (storable_nat_key, rarity_val) in new_rarity_percentages {
            map.insert(storable_nat_key, rarity_val);
        }
    });

    ic_cdk::println!("Successfully updated OG NFT rarity percentages.");
    Ok(())
}

#[query]
fn get_rarity_percentages_for_og_nfts(og_ids: Vec<Nat>) -> HashMap<Nat, u32> {
    let mut result_percentages: HashMap<Nat, u32> = HashMap::new();

    OG_NFT_RARITY_PERCENTAGES.with(|map_ref| {
        let map = map_ref.borrow();
        for og_id_nat in og_ids { // og_id_nat is Nat
            if let Some(rarity_percentage_val) = map.get(&StorableNat(og_id_nat.clone())) { // Wrap Nat in StorableNat for lookup
                result_percentages.insert(og_id_nat, rarity_percentage_val.0); // Key for HashMap is Nat, value is u32
            }
        }
    });
    
    result_percentages
}

#[query]
fn get_rarity_percentage_distribution() -> HashMap<u32, u32> {
    ic_cdk::println!("Calculating rarity percentage distribution...");
    let mut distribution: HashMap<u32, u32> = HashMap::new();

    OG_NFT_RARITY_PERCENTAGES.with(|map_ref| {
        let map = map_ref.borrow();
        for (_og_id, rarity_percentage_val) in map.iter() {
            *distribution.entry(rarity_percentage_val.0).or_insert(0) += 1;
        }
    });

    ic_cdk::println!("Rarity percentage distribution calculated with {} unique percentages.", distribution.len());
    distribution
}

// Timer setup
const DAILY_UPDATE_INTERVAL_SECS: u64 = 24 * 60 * 60; // 24 hours in seconds

#[ic_cdk::init]
fn init() {
    ic_cdk::println!("Feed canister initialized. Setting up daily update timer.");
    let _timer_id = ic_cdk_timers::set_timer_interval(
        Duration::from_secs(DAILY_UPDATE_INTERVAL_SECS),
        || ic_cdk::spawn(run_daily_updates_sequence())
    );
}

fn add_execution_log(function_name: String, status: ExecutionStatus) {
    let timestamp_nanos = ic_cdk::api::time();
    let log_entry = ExecutionLogEntry {
        timestamp_nanos,
        function_name,
        status,
    };

    let key = NEXT_LOG_KEY.with(|nk| {
        let current_key = *nk.borrow();
        *nk.borrow_mut() = current_key + 1;
        LogKey(current_key)
    });
    
    EXECUTION_LOGS.with(|logs_map| {
        logs_map.borrow_mut().insert(key, log_entry);
    });
    ic_cdk::println!("Logged execution for {}: {:?}", key.0, EXECUTION_LOGS.with(|logs_map| logs_map.borrow().get(&key)));
}

async fn run_daily_updates_sequence() {
    ic_cdk::println!("Starting daily updates sequence...");

    // 1. store_icrc7_scion_token_ids
    let scion_result = store_icrc7_scion_token_ids().await;
    match scion_result {
        Ok(_) => {
            add_execution_log("store_icrc7_scion_token_ids".to_string(), ExecutionStatus::Success);
            ic_cdk::println!("Successfully executed store_icrc7_scion_token_ids.");
        }
        Err(e) => {
            add_execution_log("store_icrc7_scion_token_ids".to_string(), ExecutionStatus::Failure { error: e.clone() });
            ic_cdk::println!("Failed to execute store_icrc7_scion_token_ids: {}. Halting sequence.", e);
            return; // Halt on failure
        }
    }

    // 2. store_icrc7_main_token_ids
    let main_result = store_icrc7_main_token_ids().await;
    match main_result {
        Ok(_) => {
            add_execution_log("store_icrc7_main_token_ids".to_string(), ExecutionStatus::Success);
            ic_cdk::println!("Successfully executed store_icrc7_main_token_ids.");
        }
        Err(e) => {
            add_execution_log("store_icrc7_main_token_ids".to_string(), ExecutionStatus::Failure { error: e.clone() });
            ic_cdk::println!("Failed to execute store_icrc7_main_token_ids: {}. Halting sequence.", e);
            return; // Halt on failure
        }
    }

    // 3. update_og_nft_sbt_counts
    let sbt_counts_result = update_og_nft_sbt_counts().await;
    match sbt_counts_result {
        Ok(_) => {
            add_execution_log("update_og_nft_sbt_counts".to_string(), ExecutionStatus::Success);
            ic_cdk::println!("Successfully executed update_og_nft_sbt_counts.");
        }
        Err(e) => {
            add_execution_log("update_og_nft_sbt_counts".to_string(), ExecutionStatus::Failure { error: e.clone() });
            ic_cdk::println!("Failed to execute update_og_nft_sbt_counts: {}. Halting sequence.", e);
            return; // Halt on failure
        }
    }

    // 4. update_og_nft_rarity_percentages
    let rarity_result = update_og_nft_rarity_percentages().await;
    match rarity_result {
        Ok(_) => {
            add_execution_log("update_og_nft_rarity_percentages".to_string(), ExecutionStatus::Success);
            ic_cdk::println!("Successfully executed update_og_nft_rarity_percentages.");
        }
        Err(e) => {
            add_execution_log("update_og_nft_rarity_percentages".to_string(), ExecutionStatus::Failure { error: e.clone() });
            ic_cdk::println!("Failed to execute update_og_nft_rarity_percentages: {}. Halting sequence.", e);
            // No return needed here as it's the last step
        }
    }
    add_execution_log("DailyUpdateSequenceCompleted".to_string(), ExecutionStatus::Success);
    ic_cdk::println!("Daily updates sequence finished.");
}

#[ic_cdk::query]
fn get_execution_logs(count: usize, start_from_key: Option<u64>) -> Vec<ExecutionLogEntry> {
    let mut logs = Vec::new();

    EXECUTION_LOGS.with(|map_ref| {
        let map = map_ref.borrow();
        let total_logs = NEXT_LOG_KEY.with(|nk| *nk.borrow());

        if map.is_empty() || count == 0 {
            ic_cdk::println!("No logs to retrieve or count is zero.");
            return;
        }

        let effective_start_key_val = match start_from_key {
            Some(key_val) => key_val,
            None => {
                // If no start_from_key, we want the last 'count' logs.
                // The keys are 0-indexed. next_log_key points to the *next* available key.
                // So, the highest current key is total_logs - 1.
                // To get 'count' logs, the first key to fetch would be (total_logs - count), clamped at 0.
                total_logs.saturating_sub(count as u64)
            }
        };
        
        let mut collected_logs: Vec<ExecutionLogEntry> = Vec::new();
        // iter_from iterates forwards. So if start_from_key was None, we start from an earlier key and take 'count'.
        // If start_from_key was Some, we start from that key and take 'count'.
        // Replacing iter_from with iter().skip_while().take() due to compilation issues.
        for (_key, value) in (&*map)
            .iter()
            .skip_while(|(k, _v)| k < &LogKey(effective_start_key_val))
            .take(count) {
            collected_logs.push(value.clone());
        }
        
        // If start_from_key was None, we wanted the *last* N logs. 
        // Our current collected_logs might not be the last N if total_logs < count.
        // The logic for `effective_start_key_val` when None already handles starting from the beginning if needed.
        // The result should already be in chronological order due to iter_from.
        logs = collected_logs;

    });
     ic_cdk::println!("Retrieved {} logs.", logs.len());
    logs
}

#[ic_cdk::query]
fn get_next_log_key_debug() -> u64 {
    NEXT_LOG_KEY.with(|nk| *nk.borrow())
}

ic_cdk::export_candid!();