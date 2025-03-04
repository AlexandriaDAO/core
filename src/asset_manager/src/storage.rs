use std::{borrow::Cow, cell::RefCell};

use candid::{CandidType, Decode, Encode, Principal};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    storable::Bound,
    DefaultMemoryImpl, StableBTreeMap, Storable,
};
type Memory = VirtualMemory<DefaultMemoryImpl>;

use serde::Deserialize;
pub const USERS_ASSET_CANISTERS_MEM_ID: MemoryId = MemoryId::new(0);

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );
    pub static USERS_ASSET_CANISTERS: RefCell<StableBTreeMap<Principal, UserCanisterRegistry, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USERS_ASSET_CANISTERS_MEM_ID))
        )
    );
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UserCanisterRegistry {
    pub owner: Principal,
    pub assigned_canister_id: Principal,
    pub last_updated: u64,
    pub last_payment:u64,
    pub created_at:u64,
}


const MAX_VALUE_SIZE: u32 = 200;

impl Storable for UserCanisterRegistry {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

