use crate::types::{Block, IndexType};
use candid::{CandidType, Decode, Encode, Principal};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use serde::Deserialize;
use std::cell::RefCell;

type Memory = VirtualMemory<DefaultMemoryImpl>;

/// The maximum number of blocks to return in a single get_transactions request.
pub const DEFAULT_MAX_TRANSACTIONS_PER_GET_TRANSACTION_RESPONSE: u64 = 2000;

// For a type to be used in a `StableBTreeMap`, it needs to implement the `Storable`
// trait, which specifies how the type can be serialized/deserialized.
//
// In this example, we're using candid to serialize/deserialize the struct, but you
// can use anything as long as you're maintaining backward-compatibility. The
// backward-compatibility allows you to change your struct over time (e.g. adding
// new fields).
//
// The `Storable` trait is already implemented for several common types (e.g. u64),
// so you can use those directly without implementing the `Storable` trait for them.
impl Storable for Block {
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        std::borrow::Cow::Owned(Encode!(self).unwrap())
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Deserialize, Debug)]
pub struct State {
    pub max_records: u128,
    pub max_pages: u128,
    pub max_transactions_per_response: u64,
    pub index_type: IndexType,
    pub ledger_id: Principal,
    pub block_index_offset: u128,
    pub block_index: u128,
}

#[derive(CandidType, Deserialize)]
pub struct StableState {
    pub state: State,
}

impl Default for State {
    fn default() -> Self {
        State {
            max_records: 0,
            max_pages: 0,
            block_index_offset: 0,
            block_index: 0,
            max_transactions_per_response: DEFAULT_MAX_TRANSACTIONS_PER_GET_TRANSACTION_RESPONSE,

            ledger_id: Principal::anonymous(),
            index_type: IndexType::Stable,
        }
    }
}

thread_local! {
    // The memory manager is used for simulating multiple memories. Given a `MemoryId` it can
    // return a memory that can be used by stable structures.
    pub static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    pub static BLOCK_MAP: RefCell<StableBTreeMap<u128, Block, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );

    pub static STATE: RefCell<State> = RefCell::default();
}

/// A helper function to access the block list.
pub fn with_blocks<R>(f: impl FnOnce(&StableBTreeMap<u128, Block, Memory>) -> R) -> R {
    BLOCK_MAP.with(|cell| f(&cell.borrow()))
}

/// A helper function to access the configuration.
pub fn with_archive_opts<R>(f: impl FnOnce(&State) -> R) -> R {
    STATE.with(|cell| f(&cell.borrow()))
}
