use candid::{candid_method, Principal};
use ic_cdk_macros::update;

use crate::{
    guards::owner_guard,
    state::{with_archive_opts, with_blocks, BLOCK_MAP, STATE},
    types::Block,
};

#[update(guard = "owner_guard")]
#[candid_method(update)]
fn append_blocks(new_blocks: Vec<Block>) {
    let max_records = with_archive_opts(|opts| opts.max_records);
    let mut block_index = with_archive_opts(|opts| opts.block_index);

    with_blocks(|blocks| {
        let new_blocks_size = new_blocks.len() as u128;
        if max_records < (blocks.len() as u128).saturating_add(new_blocks_size) {
            ic_cdk::api::trap("no space left");
        }
    });

    for block in new_blocks {
        block_index = block_index + 1;
        BLOCK_MAP.with(|p| {
            let mut block_map = p.borrow_mut();

            block_map.insert(block_index, block)
        });
    }

    STATE.with(|s| {
        let mut state = s.borrow_mut();
        state.block_index = block_index;
    })
}

#[update(guard = "owner_guard")]
pub fn update_owner(owner: Principal) -> bool {
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        state.ledger_id = owner;
    });
    return true;
}
