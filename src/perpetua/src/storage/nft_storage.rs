use candid::{CandidType, Decode, Deserialize, Encode};
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell; // Required for MAP.with, etc.

// Imports from parent storage module
use super::{MEMORY_MANAGER, Memory, MemoryId};

// No common types needed directly from common_types.rs for StringVec itself

// --- StringVec for NFT shelves ---
#[derive(CandidType, Deserialize, Clone, Debug, Default)]
pub struct StringVec(pub Vec<String>); // Stores ShelfIds associated with an NFT ID

impl Storable for StringVec {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(self).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self { Decode!(bytes.as_ref(), Self).unwrap() }
    const BOUND: Bound = Bound::Unbounded;
}

// Constants
pub const MAX_NFT_ID_LENGTH: usize = 100; // Max length for NFT IDs (key in NFT_SHELVES)

// Memory ID
pub(crate) const NFT_SHELVES_MEM_ID: MemoryId = MemoryId::new(2);

thread_local! {
    // K: nft_id (String), V: StringVec (list of ShelfIds)
    pub static NFT_SHELVES: RefCell<StableBTreeMap<String, StringVec, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(NFT_SHELVES_MEM_ID)))
    );
} 