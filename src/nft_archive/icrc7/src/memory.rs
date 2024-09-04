use crate::{
    icrc37_types::{CollectionApprovalInfo, TokenApprovalInfo, UserAccount},
    icrc7_types::Transaction,
    state::{Icrc7Token, MEMORY_MANAGER},
};
use ic_stable_structures::{
    memory_manager::{MemoryId, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap,
};

// A memory for upgrades, where data from the heap can be serialized/deserialized.
const UPGRADES: MemoryId = MemoryId::new(0);

pub type Memory = VirtualMemory<DefaultMemoryImpl>;

pub fn get_upgrades_memory() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(UPGRADES))
}

pub fn get_token_map_memory() -> StableBTreeMap<u128, Icrc7Token, Memory> {
    StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))))
}

pub fn get_log_memory() -> StableBTreeMap<u128, Transaction, Memory> {
    StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))))
}

pub fn get_token_approvals_memory() -> StableBTreeMap<u128, TokenApprovalInfo, Memory> {
    StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3))))
}

pub fn get_collection_approvals_memory(
) -> StableBTreeMap<UserAccount, CollectionApprovalInfo, Memory> {
    StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4))))
}
