use candid::{ CandidType, Nat, Principal};
use ic_cdk::call;
use ic_cdk::api::call::RejectionCode;

pub const LBRY_CANISTER_ID: &str = "y33wz-myaaa-aaaap-qkmna-cai";
pub const ALEX_CANISTER_ID: &str = "ysy5f-2qaaa-aaaap-qkmmq-cai";
pub const ICRC7_CANISTER_ID: &str = "53ewn-qqaaa-aaaap-qkmqq-cai";
pub const TOKENOMICS_CANISTER_ID: &str = "5abki-kiaaa-aaaap-qkmsa-cai";
pub const ICP_SWAP_CANISTER_ID: &str = "54fqz-5iaaa-aaaap-qkmqa-cai";




pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

pub async fn get_alex_supply() -> Result<Nat, String> {
    let alex_canister = get_principal(ALEX_CANISTER_ID);

    match call::<(), (Nat,)>(alex_canister, "icrc1_total_supply", ()).await {
        Ok((supply,)) => Ok(supply),
        Err((code, msg)) => Err(format!(
            "ALEX canister call failed with code {:?}: {}",
            code, msg
        )),
    }
}
pub async fn get_lbry_supply() -> Result<Nat, String> {
    let lbry_canister = get_principal(LBRY_CANISTER_ID);

    match call::<(), (Nat,)>(lbry_canister, "icrc1_total_supply", ()).await {
        Ok((supply,)) => Ok(supply),
        Err((code, msg)) => Err(format!(
            "ALEX canister call failed with code {:?}: {}",
            code, msg
        )),
    }
}


pub async fn get_nft_supply() -> Result<Nat, String> {
    let icrc7_canister = get_principal(ICRC7_CANISTER_ID);

    match call::<(), (Nat,)>(icrc7_canister, "icrc7_total_supply", ()).await {
        Ok((supply,)) => Ok(supply),
        Err((code, msg)) => Err(format!(
            "ICRC7 canister call failed with code {:?}: {}",
            code, msg
        )),
    }
}

pub async fn get_total_lbry_burn() -> Result<Nat, String> {
    let tokenomics_canister = get_principal(TOKENOMICS_CANISTER_ID);

    match call::<(), (Nat,)>(tokenomics_canister, "get_total_LBRY_burn", ()).await {
        Ok((lbry,)) => Ok(lbry),
        Err((code, msg)) => Err(format!(
            "Tokenomics canister call failed with code {:?}: {}",
            code, msg
        )),
    }
}


pub async fn get_current_alex_rate() -> Result<Nat, String> {
    let tokenomics_canister = get_principal(TOKENOMICS_CANISTER_ID);

    match call::<(), (Nat,)>(tokenomics_canister, "get_current_ALEX_rate", ()).await {
        Ok((rate,)) => Ok(rate),
        Err((code, msg)) => Err(format!(
            "Tokenomics canister call failed with code {:?}: {}",
            code, msg
        )),
    }
}


pub async fn get_stakers_count() -> Result<Nat, String> {
    let icp_swap: Principal = get_principal(ICP_SWAP_CANISTER_ID);

    match call::<(), (Nat,)>(icp_swap, "get_stakers_count", ()).await {
        Ok((count,)) => Ok(count),
        Err((code, msg)) => Err(format!(
            "ICP swap canister call failed with code {:?}: {}",
            code, msg
        )),
    }
}


pub async fn get_total_alex_staked() -> Result<u64, String> {
    let alex_canister_id: Principal = get_principal(ALEX_CANISTER_ID);
    let canister_id = ic_cdk::api::id();
    let args = BalanceOfArgs {
        owner: canister_id,
        subaccount: None, // Set subaccount to None, or Some(...) if needed
    };

    let result: Result<(Nat,), (RejectionCode, String)> =
        ic_cdk::call(alex_canister_id, "icrc1_balance_of", (args,)).await;

    match result {
        Ok((balance,)) => balance
            .0
            .try_into()
            .map_err(|_| "Balance exceeds u64 max value".to_string()),
        Err((code, msg)) => Err(format!(
            "Failed to call ALEX canister: {:?} - {}",
            code, msg
        )),
    }
}




#[derive(CandidType)]
struct BalanceOfArgs {
    owner: Principal,
    subaccount: Option<Vec<u8>>,
}