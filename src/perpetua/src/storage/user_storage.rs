use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::collections::BTreeSet;
use std::cell::RefCell; // Required for MAP.with, etc.

// Imports from parent storage module
use super::{MEMORY_MANAGER, Memory, MemoryId};

// Import common types from sibling module
use super::common_types::ShelfId;

// Imports from other parts of the crate
use crate::ordering::PositionTracker; // For UserProfileOrder

// --- TimestampedShelves ---
#[derive(CandidType, Deserialize, Clone, Debug, Default)]
pub struct TimestampedShelves(pub BTreeSet<(u64, ShelfId)>);

impl Storable for TimestampedShelves {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(self).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self { Decode!(bytes.as_ref(), Self).unwrap() }
    const BOUND: Bound = Bound::Unbounded;
}

// --- UserProfileOrder ---
#[derive(CandidType, Deserialize, Clone, Debug, Default)]
pub struct UserProfileOrderSerializable {
    shelf_positions: Vec<(ShelfId, f64)>,
    is_customized: bool,
}

impl UserProfileOrderSerializable {
     pub fn from_uop(uop: &UserProfileOrder) -> Self {
         Self {
             shelf_positions: uop.shelf_positions.get_ordered_entries(),
             is_customized: uop.is_customized,
         }
     }
}

#[derive(Clone, Debug, Default)]
pub struct UserProfileOrder {
    pub shelf_positions: PositionTracker<ShelfId>,
    pub is_customized: bool,
}

impl Storable for UserProfileOrder {
     fn to_bytes(&self) -> Cow<[u8]> {
        let serializable = UserProfileOrderSerializable {
             shelf_positions: self.shelf_positions.get_ordered_entries(),
             is_customized: self.is_customized,
         };
         Cow::Owned(Encode!(&serializable).expect("Failed to encode UserProfileOrderSerializable"))
     }
     fn from_bytes(bytes: Cow<[u8]>) -> Self {
         let serializable: UserProfileOrderSerializable = Decode!(bytes.as_ref(), UserProfileOrderSerializable).expect("Failed to decode UserProfileOrderSerializable");
         let mut shelf_positions = PositionTracker::<ShelfId>::new();
         for (key, pos) in serializable.shelf_positions {
             shelf_positions.insert(key, pos);
         }
         Self {
             shelf_positions,
             is_customized: serializable.is_customized,
         }
     }
    const BOUND: Bound = Bound::Unbounded;
}

// Memory IDs
pub(crate) const USER_SHELVES_MEM_ID: MemoryId = MemoryId::new(1);
pub(crate) const USER_PROFILE_ORDER_MEM_ID: MemoryId = MemoryId::new(8);

thread_local! {
    pub static USER_SHELVES: RefCell<StableBTreeMap<Principal, TimestampedShelves, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(USER_SHELVES_MEM_ID)))
    );
    pub static USER_PROFILE_ORDER: RefCell<StableBTreeMap<Principal, UserProfileOrder, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(USER_PROFILE_ORDER_MEM_ID)))
    );
} 