use candid::{candid_method, Principal};
use ic_cdk_macros::query;

use crate::{
    state::{with_archive_opts, with_blocks, STATE},
    types::{Block, GetBlocksResult, QueryBlock},
};
use icrc_ledger_types::icrc3::blocks::GetBlocksRequest;
use num_traits::ToPrimitive;

#[query]
#[candid_method(query)]
pub fn get_owner() -> Principal {
    STATE.with(|s| s.borrow().ledger_id)
}

#[query]
#[candid_method(query)]
fn remaining_capacity() -> u64 {
    let total_block_size = with_blocks(|blocks| blocks.len());
    with_archive_opts(|opts| {
        (opts.max_records as u64)
            .checked_sub(total_block_size)
            .expect("bug: archive capacity underflow")
    })
}

#[query]
#[candid_method(query)]
fn get_transaction(index: u128) -> Option<Block> {
    let idx_offset = with_archive_opts(|opts| opts.block_index_offset);
    let relative_idx = (idx_offset <= index).then_some(index - idx_offset)?;

    let block = with_blocks(|blocks| blocks.get(&relative_idx))?;
    Some(block)
}

#[query]
#[candid_method(query)]
fn icrc3_get_blocks(reqs: Vec<GetBlocksRequest>) -> GetBlocksResult {
    const MAX_BLOCKS_PER_RESPONSE: u64 = 100;

    let mut blocks = vec![];
    for req in reqs {
        let mut id = req.start.0.to_u128().unwrap();

        let (start, length) = req
            .as_start_and_length()
            .unwrap_or_else(|msg| ic_cdk::api::trap(&msg));
        let max_length = MAX_BLOCKS_PER_RESPONSE.saturating_sub(blocks.len() as u64);
        if max_length == 0 {
            break;
        }
        let length = length.min(max_length);
        let block_range = block_range(start, length);
        for block in block_range {
            blocks.push(QueryBlock {
                id: id.clone(),
                block: block.value().clone(),
            });
            id += 1u128;
        }
    }

    GetBlocksResult {
        // We return the local log length because the archive
        // knows only about its local blocks.
        log_length: with_blocks(|blocks| blocks.len()) as u128,
        blocks,
        archived_blocks: vec![],
    }
}

fn block_range(start: u64, length: u64) -> Vec<Block> {
    let offset = with_archive_opts(|opts| {
        let block_index_offset = opts.block_index_offset as u64;
        if start < block_index_offset {
            ic_cdk::api::trap(&format!(
                "requested index {} is less than the minimal index {} this archive serves",
                start, block_index_offset
            ));
        }
        start - block_index_offset
    });

    let length = length.min(with_archive_opts(|opts| opts.max_transactions_per_response));
    with_blocks(|blocks| {
        let limit = blocks.len().min(offset.saturating_add(length));
        (offset..limit)
            .map(|i| blocks.get(&(i as u128)).unwrap())
            .collect()
    })
}
