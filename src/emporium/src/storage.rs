use candid::{CandidType, Principal};
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
pub const LISTING_MEM_ID: MemoryId = MemoryId::new(0);

thread_local! {

    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );
    
    pub static LISTING: RefCell<StableBTreeMap<u64, Nft, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(LISTING_MEM_ID))
        )
    );
}
const MAX_VALUE_SIZE: u32 = 100;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Nft {
   pub owner: Principal,
   pub price:u64,
   pub token_id: u64,  
   pub status: String, //replace with enums
}


impl Storable for Nft {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded { 
        max_size: MAX_VALUE_SIZE, 
        is_fixed_size: false 
    };
}