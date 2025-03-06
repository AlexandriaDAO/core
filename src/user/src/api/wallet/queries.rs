use ic_cdk::api::caller;
use ic_cdk_macros::query;
use candid::Principal;

use crate::errors::general::GeneralError;
use crate::store::{WALLETS, USER_WALLETS};
use crate::models::wallet::Wallet;

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