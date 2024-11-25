use candid::Principal;
use ic_cdk::query;

use crate::{Miner, USERS_MINING};


#[query]
pub fn get_all_mining() -> Vec<(Principal, Miner)> {
    USERS_MINING.with(|users_mining| {
        let users_mining_map = users_mining.borrow();
        users_mining_map
            .iter()
            .map(|(principal, mine)| (principal.clone(), mine.clone())) // Clone to ensure ownership
            .collect()
    })
}