use candid::{CandidType, Nat, Principal};
use candid::{Decode, Deserialize, Encode};
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::BTreeSet;

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
    pub static STATE: RefCell<State> = RefCell::new(State{pending_requests: BTreeSet::new()});

    pub static LISTING: RefCell<StableBTreeMap<String, Nft, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(LISTING_MEM_ID))
        )
    );
}
const MAX_VALUE_SIZE: u32 = 200;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Nft {
    pub owner: Principal,
    pub price: u64,
    pub token_id: Nat,
    pub status: NftStatus, // Replaced String with NftStatus enum
    pub time: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Listing {
    pub nfts: Vec<(String, Nft)>,
    pub total_pages: u64,
    pub current_page: u64,
    pub page_size: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum NftStatus {
    Listed,
    Unlisted,
    Reimbursed,
}

impl Storable for Nft {
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
pub struct State {
    pub pending_requests: BTreeSet<Principal>,
}