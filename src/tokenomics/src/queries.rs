use crate::{
    get_current_threshold_index_mem, get_principal, get_total_lbry_burned_mem, Logs, TokenLogs, ALEX_CANISTER_ID, ALEX_PER_THRESHOLD, LBRY_THRESHOLDS, LOGS, TOKEN_LOGS
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

#[derive(CandidType, Deserialize)]
struct GetTokensArgs {
    start: Option<Nat>,
    length: Option<Nat>,
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
pub async fn get_two_random_nfts() -> CallResult<((Principal, Vec<u8>), (Principal, Vec<u8>))> {
    // Get total supply of Scion NFTs
    let icrc7 = get_principal("53ewn-qqaaa-aaaap-qkmqq-cai");
    let icrc7_scion = get_principal("uxyan-oyaaa-aaaap-qhezq-cai");
    let nft_manager = get_principal("5sh5r-gyaaa-aaaap-qkmra-cai");

    let (total_supply,): (Nat,) = ic_cdk::call(icrc7_scion, "icrc7_total_supply", ()).await?;
    
    // Get random bytes for selecting NFT
    let (random_bytes,): (Vec<u8>,) = 
        ic_cdk::api::call::call(Principal::management_canister(), "raw_rand", ()).await?;
    
    let random_value = u128::from_le_bytes(random_bytes[0..16].try_into().unwrap());
    let supply_u128: u128 = total_supply.0.try_into().unwrap_or(0);
    
    if supply_u128 == 0 {
        return Err((ic_cdk::api::call::RejectionCode::CanisterError, "No NFTs minted yet".to_string()));
    }
    
    // Calculate the starting index for the newest 1000 NFTs
    let start_index = if supply_u128 > 10000 {
        supply_u128 - 10000
    } else {
        0
    };
    let range = supply_u128 - start_index;
    let random_index = start_index + (random_value % range);

    let tokens_call_result: CallResult<(Vec<Nat>,)> = ic_cdk::call(
        icrc7_scion,
        "icrc7_tokens",
        (Some(Nat::from(random_index)), Some(Nat::from(1u32)),)
    ).await;

    let (tokens,) = tokens_call_result?;

    if tokens.is_empty() {
        return Err((ic_cdk::api::call::RejectionCode::CanisterError, "No tokens found".to_string()));
    }

    let rand_nft_id = tokens[0].clone();
    
    // Fix: Correct return type handling for icrc7_owner_of
    let (rand_owners,): (Vec<Option<Account>>,) = 
        ic_cdk::call(icrc7_scion, "icrc7_owner_of", (vec![rand_nft_id.clone()],)).await?;
    
    let rand_nft_owner = rand_owners
        .get(0)
        .and_then(|o| o.as_ref())
        .map(|a| a.owner)
        .ok_or((ic_cdk::api::call::RejectionCode::CanisterError, "No owner found for Scion NFT".to_string()))?;

    let args = (rand_nft_id.clone(), rand_nft_owner);
    let (og_nft_id,): (Nat,) = ic_cdk::call(nft_manager, "scion_to_og_id", args).await?;
    
    // Fix: Correct return type handling for icrc7_owner_of
    let (og_owners,): (Vec<Option<Account>>,) = 
        ic_cdk::call(icrc7, "icrc7_owner_of", (vec![og_nft_id.clone()],)).await?;
    
    let og_nft_owner = og_owners
        .get(0)
        .and_then(|o| o.as_ref())
        .map(|a| a.owner)
        .ok_or((ic_cdk::api::call::RejectionCode::CanisterError, "No owner found for OG NFT".to_string()))?;

    let (scion_subaccount,): (Vec<u8>,) = 
        ic_cdk::call(nft_manager, "to_nft_subaccount", (rand_nft_id,)).await?;
    let (og_subaccount,): (Vec<u8>,) = 
        ic_cdk::call(nft_manager, "to_nft_subaccount", (og_nft_id,)).await?;

    Ok((
        (nft_manager, scion_subaccount),
        (nft_manager, og_subaccount)
    ))
}

#[query]
fn get_logs() -> Vec<Logs> {
    LOGS.with(|logs| logs.borrow().clone())
}



#[query]
fn get_token_logs(page: Option<u64>, page_size: Option<u64>) -> PaginatedTokenLogs {
    let page = page.unwrap_or(1).max(1); // Ensure page is at least 1
    let page_size = page_size.unwrap_or(10).max(1); // Ensure page_size is at least 1

    TOKEN_LOGS.with(|logs| {
        let logs = logs.borrow();
        let total_count = logs.len() as u64;
        let total_pages = (total_count as f64 / page_size as f64).ceil() as u64;
        let start_index = ((page - 1) * page_size) as usize;

        let logs = logs
            .iter()
            .rev()
            .skip(start_index)
            .take(page_size as usize)
            .map(|(_, log)| log.clone())
            .collect();

        PaginatedTokenLogs {
            logs,
            total_pages,
            current_page: page,
            page_size,
        }
    })
}

#[derive(CandidType, Deserialize)]
pub struct PaginatedTokenLogs {
    logs: Vec<TokenLogs>,
    total_pages: u64,
    current_page: u64,
    page_size: u64,
}