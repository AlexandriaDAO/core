use candid::{CandidType, Decode, Encode, Nat};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    storable::Bound,
    DefaultMemoryImpl, StableBTreeMap, Storable,
};
use std::{borrow::Cow, cell::RefCell, ops::Deref};

// Define the memory type using VirtualMemory and DefaultMemoryImpl
type Memory = VirtualMemory<DefaultMemoryImpl>;

// Memory ID for the token list stable BTreeMap
const TOKEN_LIST_MEM_ID: MemoryId = MemoryId::new(0); // Using 0 as it's the first/only map here

// Newtype wrapper for Vec<Nat> to overcome the orphan rule
#[derive(CandidType, Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Default)] // Added common derives
pub struct TokenIdList(pub Vec<Nat>);

// Implement Deref to allow easy access to the inner Vec<Nat>
impl Deref for TokenIdList {
    type Target = Vec<Nat>;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

// Implement From<Vec<Nat>> for TokenIdList for easy conversion
impl From<Vec<Nat>> for TokenIdList {
    fn from(vec_nat: Vec<Nat>) -> Self {
        TokenIdList(vec_nat)
    }
}

// Thread-local static for the MemoryManager
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // Thread-local static for the StableBTreeMap storing the token ID list.
    // Now uses TokenIdList as the value type.
    pub static TOKEN_ID_LIST: RefCell<StableBTreeMap<u8, TokenIdList, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(TOKEN_LIST_MEM_ID))
    ));
}

// Implement Storable for TokenIdList
impl Storable for TokenIdList {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap()) // Encode the inner Vec<Nat>
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        TokenIdList(Decode!(bytes.as_ref(), Vec<Nat>).unwrap()) // Decode into Vec<Nat> then wrap
    }

    const BOUND: Bound = Bound::Unbounded;
}
