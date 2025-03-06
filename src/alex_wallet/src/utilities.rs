use candid::Principal;
use crate::{UserIdList, USER_WALLETS, WALLET_COUNTER};

/// Initialize counters for engines and nodes
pub fn init_counter() {
    WALLET_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        let _ = counter.insert((), 0);
    });
}

/// Get and increment the wallet counter, returning the current value
pub fn get_and_increment_wallet_counter() -> u64 {
    WALLET_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        let current = counter.get(&()).unwrap_or(0);
        let next = current + 1;
        let _ = counter.insert((), next);
        current
    })
}

//
// User Wallet Management
//

/// Get all wallet IDs associated with a user
pub fn get_user_wallet_ids(principal: &Principal) -> Vec<u64> {
    USER_WALLETS.with(|user_wallets| {
        user_wallets.borrow()
            .get(principal)
            .map(|list| list.0)
            .unwrap_or_default()
    })
}

/// Associate a wallet ID with a user
pub fn add_wallet_to_user(principal: &Principal, wallet_id: u64) {
    USER_WALLETS.with(|user_wallets| {
        let mut user_wallets = user_wallets.borrow_mut();
        let mut ids = user_wallets
            .get(principal)
            .map(|list| list.0)
            .unwrap_or_default();
        ids.push(wallet_id);
        user_wallets.insert(*principal, UserIdList(ids));
    });
}