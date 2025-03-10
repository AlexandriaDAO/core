use ic_cdk::api::caller;
use ic_cdk_macros::query;
use candid::Principal;

use crate::errors::GeneralError;
use crate::get_user_wallet_ids;
use crate::store::WALLETS;
use crate::model::Wallet;


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
    // Get wallet IDs for the user
    let wallet_ids = get_user_wallet_ids(&user);

    // Fetch wallet details for each ID
    WALLETS.with(|wallets| {
        let wallets = wallets.borrow();
        wallet_ids
            .iter()
            .filter_map(|id| wallets.get(id).map(|n| n.clone()))
            .collect()
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
            let wallet_ids = get_user_wallet_ids(&user);

            WALLETS.with(|wallets| {
                let wallets = wallets.borrow();
                wallet_ids
                    .iter()
                    .filter_map(|id| wallets.get(id))
                    .filter(|wallet| wallet.active) // Filter for active wallets
                    .map(|n| n.clone())
                    .collect()
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