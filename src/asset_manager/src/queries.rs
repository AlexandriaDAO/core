use candid::Principal;
use ic_cdk::caller;

use crate::{UserCanisterRegistry, USERS_ASSET_CANISTERS};

#[ic_cdk::query]
fn get_all_user_asset_canisters() -> Vec<(Principal, UserCanisterRegistry)> {
    // Access the USERS_ASSET_CANISTERS map and collect all key-value pairs
    USERS_ASSET_CANISTERS.with(|canisters| {
        let canisters_map = canisters.borrow();

        // Convert the HashMap to a Vec of (Principal, UserCanisterRegistry)
        canisters_map.iter().map(|(principal, registry)| (principal, registry.clone())).collect()
    })
}


#[ic_cdk::query]
fn get_caller_asset_canister() -> Option<UserCanisterRegistry> {
    let caller_principal = caller();

    USERS_ASSET_CANISTERS.with(|canisters| {
        let canisters_map = canisters.borrow();

        // Retrieve the UserCanisterRegistry associated with the caller's Principal
        canisters_map.get(&caller_principal)
    })
}