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
    
    pub static LISTING_MEM_ID: RefCell<StableBTreeMap<Principal,Miner , Memory>> = RefCell::new(
        StableBTreeMap::init(LISTING_MEM_ID.with(|m| m.borrow().get(LISTING_MEM_ID)))
    );
}
const MAX_VALUE_SIZE: u32 = 100;

#[derive(CandidType, Deserialize, Clone, Debug)]
struct Listing {
    owner: Principal,
    buyer:Principal, // null by defualt
    marked_price:u64,
    sold_price: u64,  
    token_id: u64,  
    status: String, //replace with enums
}



//