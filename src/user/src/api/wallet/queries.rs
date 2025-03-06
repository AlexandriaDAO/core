use ic_cdk::api::caller;
use ic_cdk_macros::query;
use candid::Principal;

use crate::errors::general::GeneralError;
use crate::store::{WALLETS, USER_WALLETS};
use crate::models::wallet::Wallet;

fn wallet_canister_id() -> Principal {
    let wallet_canister_id = "yh7mi-3yaaa-aaaap-qkmpa-cai";
    Principal::from_text(wallet_canister_id).expect("failed to create canister ID")
}

#[derive(candid::CandidType, serde::Serialize)]
pub struct WalletKeyResponse {
    id: u64,
    key: String,
    n: String,
}

#[query]
pub fn get_wallet_key(wallet_id: u64) -> Result<WalletKeyResponse, String> {
    let caller = caller();

    // Debug: Print the caller's principal
    ic_cdk::println!("Caller: {}", caller);

    // Ensure only the wallet canister can call this function
    if caller != wallet_canister_id() {
        ic_cdk::println!("Unauthorized caller: {}", caller);
        return Err(GeneralError::NotAuthorized.to_string());
    }

    // Debug: Print the wallet ID being requested
    ic_cdk::println!("Requested wallet ID: {}", wallet_id);

    WALLETS.with(|wallets| {
        let wallets = wallets.borrow();

        // Debug: Print the number of wallets in storage
        ic_cdk::println!("Total wallets in storage: {}", wallets.len());

        // Look up the wallet by ID
        match wallets.get(&wallet_id) {
            Some(wallet) => {
                // Debug: Print the found wallet details
                ic_cdk::println!("Found wallet: ID={}, Key={}, Owner={}", wallet.id, wallet.key, wallet.public.n);

                // Return the wallet key response
                Ok(WalletKeyResponse {
                    id: wallet.id,
                    key: wallet.key.clone(),
                    n: wallet.public.n.to_string(),
                })
            }
            None => {
                // Debug: Print that the wallet was not found
                ic_cdk::println!("Wallet with ID {} not found", wallet_id);

                // Return a not found error
                Err(GeneralError::NotFound("Wallet not found".to_string()).to_string())
            }
        }
    })
}

/// Retrieves multiple wallets by their ids
/// Returns a vector of wallets, skipping any IDs that don't exist
#[query]
pub fn get_wallets(ids: Vec<u64>) -> Result<Vec<Wallet>, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    if ids.is_empty() {
        return Err(GeneralError::InvalidInput("No wallet IDs provided".to_string()).to_string());
    }

    Ok(WALLETS.with(|wallets| {
        let wallets = wallets.borrow();
        ids.iter()
            .filter_map(|id| wallets.get(id).map(|n| n.clone()))
            .collect()
    }))
}

/// Retrieves multiple wallets by their ids
/// Returns error if any of the requested wallets don't exist
#[query]
pub fn get_wallets_strict(ids: Vec<u64>) -> Result<Vec<Wallet>, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    if ids.is_empty() {
        return Err(GeneralError::InvalidInput("No wallet IDs provided".to_string()).to_string());
    }

    WALLETS.with(|wallets| {
        let wallets = wallets.borrow();
        
        // Check if all IDs exist first
        if ids.iter().any(|id| !wallets.contains_key(id)) {
            return Err(GeneralError::NotFound("One or more wallets not found".to_string()).to_string());
        }

        // Get all wallets (we know they exist)
        Ok(ids.iter()
            .map(|id| wallets.get(id).unwrap().clone())
            .collect())
    })
}

#[query]
pub fn get_user_wallets(user: Principal) -> Vec<Wallet> {
    WALLETS.with(|wallets| {
        let wallets = wallets.borrow();
        USER_WALLETS.with(|user_wallets| {
            user_wallets.borrow()
                .get(&user)
                .map(|list| {
                    list.0.iter()
                        .filter_map(|id| wallets.get(id).map(|n| n.clone()))
                        .collect()
                })
                .unwrap_or_default()
        })
    })
}

#[query]
pub fn get_my_wallets() -> Vec<Wallet> {
    get_user_wallets(caller())
}

/// Returns active wallets for a specific user or all active wallets if no user specified
#[query]
pub fn get_active_wallets(user: Option<Principal>) -> Vec<Wallet> {
    match user {
        Some(user) => {
            // Get specific user's active wallets
            WALLETS.with(|wallets| {
                let wallets = wallets.borrow();
                USER_WALLETS.with(|user_wallets| {
                    user_wallets.borrow()
                        .get(&user)
                        .map(|list| {
                            list.0.iter()
                                .filter_map(|id| wallets.get(id))
                                .filter(|wallet| wallet.active)
                                .map(|n| n.clone())
                                .collect()
                        })
                        .unwrap_or_default()
                })
            })
        },
        None => {
            // Get all active wallets
            WALLETS.with(|wallets| {
                wallets.borrow()
                    .iter()
                    .filter(|(_, wallet)| wallet.active)
                    .map(|(_, wallet)| wallet.clone())
                    .collect()
            })
        }
    }
}

#[query]
pub fn get_my_active_wallets() -> Vec<Wallet> {
    get_active_wallets(Some(caller()))
}