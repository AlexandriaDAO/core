use crate::{
    get_current_threshold_index_mem, get_principal, get_total_lbry_burned_mem, Logs, ALEX_CANISTER_ID, ALEX_PER_THRESHOLD, LBRY_CANISTER_ID, LBRY_THRESHOLDS, LOGS, RANDOM_USER
};
use candid::{CandidType, Nat, Principal};
use ic_cdk::{
    api::call:: CallResult,
    caller, query, update,
};
use serde::Deserialize;

#[derive(CandidType, Deserialize, Clone)]
pub struct TransactionRecord {
    burn: Option<BurnRecord>,
    kind: String,
    mint: Option<MintRecord>,
    approve: Option<ApproveRecord>,
    timestamp: u64,
    transfer: Option<TransferRecord>,
}

#[derive(CandidType, Deserialize, Clone)]
struct BurnRecord {
    from: Account,
    memo: Option<Vec<u8>>,
    created_at_time: Option<u64>,
    amount: Nat,
    spender: Option<Account>,
}

#[derive(CandidType, Deserialize, Clone)]
struct MintRecord {
    to: Account,
    memo: Option<Vec<u8>>,
    created_at_time: Option<u64>,
    amount: Nat,
}

#[derive(CandidType, Deserialize, Clone)]
struct ApproveRecord {
    fee: Option<Nat>,
    from: Account,
    memo: Option<Vec<u8>>,
    created_at_time: Option<u64>,
    amount: Nat,
    expected_allowance: Option<Nat>,
    expires_at: Option<u64>,
    spender: Account,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct TransferRecord {
    to: Account,
    fee: Option<Nat>,
    from: Account,
    memo: Option<Vec<u8>>,
    created_at_time: Option<u64>,
    amount: Nat,
    spender: Option<Account>,
}

#[derive(CandidType, Deserialize, Clone)]
struct Account {
    owner: Principal,
    subaccount: Option<Vec<u8>>,
}

#[derive(CandidType, Deserialize)]
struct GetTransactionsRequest {
    start: Nat,
    length: Nat,
}

#[derive(CandidType, Deserialize)]
struct GetTransactionsResponse {
    first_index: Nat,
    log_length: Nat,
    transactions: Vec<TransactionRecord>,
}

#[query]
pub fn get_total_LBRY_burn() -> u64 {
    let result = get_total_lbry_burned_mem();
    return result.get(&()).unwrap_or(0);
}

#[query]
pub fn get_current_threshold_index() -> u32 {
    let result = get_current_threshold_index_mem();
    return result.get(&()).unwrap_or(0);
}
#[query]
pub fn get_current_ALEX_rate() -> u64 {
    let current_threshold = get_current_threshold_index();
    ALEX_PER_THRESHOLD[current_threshold as usize]
}
#[query]
pub fn get_current_LBRY_threshold() -> u64 {
    let current_threshold = get_current_threshold_index();
    LBRY_THRESHOLDS[current_threshold as usize]
}

#[query]
pub fn get_max_stats() -> (u64, u64) {
    let max_threshold = LBRY_THRESHOLDS[LBRY_THRESHOLDS.len() - 1];
    let total_burned = get_total_LBRY_burn();
    (max_threshold, total_burned)
}
#[update]
pub async fn fetch_total_minted_ALEX() -> Result<u64, String> {
    let alex_canister_id = get_principal(ALEX_CANISTER_ID);

    // Call the ledger canister's `icrc1_total_supply` method with no input, expecting a `Nat` response
    let result: Result<(Nat,), _> = ic_cdk::call(alex_canister_id, "icrc1_total_supply", ())
        .await
        .map_err(|e: (ic_cdk::api::call::RejectionCode, String)| {
            format!("Failed to call ledger: {:?}", e)
        });

    // Convert the Nat to u64 and handle any potential errors
    match result {
        Ok((total_supply,)) => total_supply
            .0
            .try_into()
            .map_err(|_| "Failed to convert Nat to u64".to_string()),
        Err(_) => Err("Failed to fetch total supply".to_string()),
    }
}

#[query]
pub fn your_principal() -> Result<String, String> {
    Ok(caller().to_string())
}

#[update]
async fn get_latest_transfer_transactions() -> Vec<TransferRecord> {
    let token_canister_id = get_principal(LBRY_CANISTER_ID);

    // First, get the total number of transactions
    let initial_request = GetTransactionsRequest {
        start: Nat::from(0 as u32),
        length: Nat::from(1 as u32), // We only need one transaction to get the log_length
    };

    let total_transactions = match ic_cdk::call::<_, (GetTransactionsResponse,)>(
        token_canister_id,
        "get_transactions",
        (initial_request,),
    )
    .await
    {
        Ok((response,)) => response.log_length,
        Err(e) => {
            ic_cdk::println!("Error calling get_transactions: {:?}", e);
            return vec![];
        }
    };

    // Calculate the start index for the latest 100 transactions
    let start = if total_transactions > Nat::from(100 as u32) {
        total_transactions - Nat::from(100 as u32)
    } else {
        Nat::from(0 as u32)
    };

    // Now, fetch the latest transactions
    let request = GetTransactionsRequest {
        start,
        length: Nat::from(100 as u32),
    };

    match ic_cdk::call::<_, (GetTransactionsResponse,)>(
        token_canister_id,
        "get_transactions",
        (request,),
    )
    .await
    {
        Ok((response,)) => response
            .transactions
            .into_iter()
            .filter_map(|tx| {
                if tx.kind == "transfer" {
                    tx.transfer
                } else {
                    None
                }
            })
            .collect(),
        Err(e) => {
            ic_cdk::println!("Error calling get_transactions: {:?}", e);
            vec![]
        }
    }
}

#[query]
pub async fn get_two_random_users() -> CallResult<(Principal, Principal)> {
    // First, get all latest transfer transactions
    let all_transfers = get_latest_transfer_transactions().await;

    // If we have fewer than 1 transactions, return dummy random user
    if all_transfers.len() < 1 {
        return Ok((get_principal(RANDOM_USER), get_principal(RANDOM_USER)));
    }

    // Get random bytes
    let (random_bytes,): (Vec<u8>,) =
        ic_cdk::api::call::call(Principal::management_canister(), "raw_rand", ()).await?;

    // Use the first 16 bytes (128 bits) of randomness
    let random_value = u128::from_le_bytes(random_bytes[0..16].try_into().unwrap());

    let index1 = (random_value % all_transfers.len() as u128) as usize;
    let mut index2 = ((random_value >> 64) % all_transfers.len() as u128) as usize;

    // Ensure index2 is different from index1
    if index2 == index1 {
        index2 = (index2 + 1) % all_transfers.len();
    }
    let address1 = all_transfers[index1].clone().from.owner;
    let address2 = all_transfers[index2].clone().to.owner;
    ic_cdk::println!("random index are {},{}", index1, index2);
    // Return the two selected
    Ok((address1, address2))
}

#[query]
fn get_logs() -> Vec<Logs> {
    LOGS.with(|logs| logs.borrow().clone())
}
