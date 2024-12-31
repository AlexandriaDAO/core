use candid::{CandidType, Nat};
use candid::{Decode, Deserialize, Encode};
use std::borrow::Cow;
use std::cell::RefCell;

use ic_stable_structures::memory_manager::VirtualMemory;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::{DefaultMemoryImpl, Storable};
type Memory = VirtualMemory<DefaultMemoryImpl>;
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager},
    StableBTreeMap,
};
pub const LOGS_MEM_ID: MemoryId = MemoryId::new(0);

thread_local! {

    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    pub static LOGS: RefCell<StableBTreeMap<u64, Log, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(LOGS_MEM_ID))
        )
    );
}
const MAX_VALUE_SIZE: u32 = 200;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Log {
    pub alex_supply: Nat,
    pub lbry_supply: Nat,
    pub nft_supply: Nat,
    pub total_lbry_burn: u64,
    pub alex_rate: u64,
    pub staker_count: u64,
    pub total_alex_staked: Nat,
    pub apy: Nat,
    pub time: u64,
}

impl Storable for Log {
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
