use candid::candid_method;
use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use std::mem;

use ic_cdk::storage;

use crate::{
    state::{StableState, State, DEFAULT_MAX_TRANSACTIONS_PER_GET_TRANSACTION_RESPONSE, STATE},
    types::ArchiveInitArgs,
};

#[init]
#[candid_method(init)]
pub fn init(arg: ArchiveInitArgs) {
    let ledger_id = ic_cdk::caller();
    STATE.with(|s| {
        let mut s = s.borrow_mut();
        let state = State {
            max_pages: arg.max_pages,
            max_records: arg.max_records,
            block_index_offset: arg.first_index,
            block_index: arg.first_index,
            max_transactions_per_response: DEFAULT_MAX_TRANSACTIONS_PER_GET_TRANSACTION_RESPONSE,
            index_type: arg.index_type,
            ledger_id,
        };
        *s = state;
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    let state = STATE.with(|state| mem::take(&mut *state.borrow_mut()));
    let stable_state = StableState { state };
    storage::stable_save((stable_state,)).unwrap();
}
#[post_upgrade]
fn post_upgrade() {
    let (StableState { state },) = storage::stable_restore().unwrap();
    STATE.with(|state0| *state0.borrow_mut() = state);
}
