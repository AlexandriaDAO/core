use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::collections::BTreeSet;
use std::cell::RefCell; // Required for MAP.with, etc.

// Imports from parent storage module
use super::{MEMORY_MANAGER, Memory, MemoryId};

// Import common types from sibling module
use super::common_types::NormalizedTag;

// --- PrincipalSet ---
#[derive(CandidType, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
pub struct PrincipalSet(pub BTreeSet<Principal>);

impl Storable for PrincipalSet {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(&self.0).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let set = Decode!(bytes.as_ref(), BTreeSet<Principal>).unwrap();
        Self(set)
    }
    const BOUND: Bound = Bound::Unbounded;
}

// --- NormalizedTagSet ---
#[derive(CandidType, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
pub struct NormalizedTagSet(pub BTreeSet<NormalizedTag>);

impl Storable for NormalizedTagSet {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(&self.0).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let set = Decode!(bytes.as_ref(), BTreeSet<NormalizedTag>).unwrap();
        Self(set)
    }
    const BOUND: Bound = Bound::Unbounded;
}

// Memory IDs
pub(crate) const FOLLOWED_USERS_MEM_ID: MemoryId = MemoryId::new(16);
pub(crate) const FOLLOWED_TAGS_MEM_ID: MemoryId = MemoryId::new(17);

thread_local! {
    // K: Follower Principal, V: Set of followed Principals
    pub static FOLLOWED_USERS: RefCell<StableBTreeMap<Principal, PrincipalSet, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(FOLLOWED_USERS_MEM_ID)))
    );
    // K: Follower Principal, V: Set of followed NormalizedTags
    pub static FOLLOWED_TAGS: RefCell<StableBTreeMap<Principal, NormalizedTagSet, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(FOLLOWED_TAGS_MEM_ID)))
    );
} 