use candid::{CandidType, Decode, Encode, Principal};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;
use serde::{Serialize, Deserialize};

use crate::models::activity::Activity;

type Memory = VirtualMemory<DefaultMemoryImpl>;

// Memory IDs for different maps
const ACTIVITIES_MEM_ID: MemoryId = MemoryId::new(0);
const USER_ACTIVITIES_MEM_ID: MemoryId = MemoryId::new(1);
const ARWEAVE_ACTIVITIES_MEM_ID: MemoryId = MemoryId::new(2);
const ACTIVITY_COUNTER_MEM_ID: MemoryId = MemoryId::new(3);
const USER_REACTIONS_MEM_ID: MemoryId = MemoryId::new(4);

const MAX_VALUE_SIZE: u32 = 65536; // 64KB

// Wrapper structs for Storable implementation
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct StorableString(pub String);

impl Storable for StorableString {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Decode!(bytes.as_ref(), String).unwrap())
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct StorablePrincipal(pub Principal);

impl Storable for StorablePrincipal {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Decode!(bytes.as_ref(), Principal).unwrap())
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 64,
        is_fixed_size: false,
    };
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ActivityIdList(pub Vec<u64>);

#[derive(Debug, Clone)]
pub struct StorableActivityIdList(pub ActivityIdList);

impl Storable for StorableActivityIdList {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Decode!(bytes.as_ref(), ActivityIdList).unwrap())
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

#[derive(Debug, Clone)]
pub struct StorableActivity(pub Activity);

impl Storable for StorableActivity {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Decode!(bytes.as_ref(), Activity).unwrap())
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

// Composite key for user reactions (arweave_id + user)
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct UserReactionKey {
    pub arweave_id: String,
    pub user: Principal,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct StorableUserReactionKey(pub UserReactionKey);

impl Storable for StorableUserReactionKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Decode!(bytes.as_ref(), UserReactionKey).unwrap())
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    // Main activities storage: activity_id -> Activity
    pub static ACTIVITIES: RefCell<StableBTreeMap<u64, StorableActivity, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(ACTIVITIES_MEM_ID)),
        )
    );

    // User activities index: user -> list of activity_ids
    pub static USER_ACTIVITIES: RefCell<StableBTreeMap<StorablePrincipal, StorableActivityIdList, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USER_ACTIVITIES_MEM_ID)),
        )
    );

    // Arweave activities index: arweave_id -> list of activity_ids
    pub static ARWEAVE_ACTIVITIES: RefCell<StableBTreeMap<StorableString, StorableActivityIdList, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(ARWEAVE_ACTIVITIES_MEM_ID)),
        )
    );

    // Counter for generating unique activity IDs
    pub static ACTIVITY_COUNTER: RefCell<StableBTreeMap<u64, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(ACTIVITY_COUNTER_MEM_ID)),
        )
    );

    // User reactions index: (arweave_id, user) -> activity_id (for quick reaction lookups/updates)
    pub static USER_REACTIONS: RefCell<StableBTreeMap<StorableUserReactionKey, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USER_REACTIONS_MEM_ID)),
        )
    );
}

/// Initialize the counter if it doesn't exist
pub fn init_counters() {
    ACTIVITY_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        if counter.get(&0).is_none() {
            counter.insert(0, 1); // Start activity IDs from 1
        }
    });
}

/// Get the next activity ID and increment the counter
pub fn get_next_activity_id() -> u64 {
    ACTIVITY_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        let current = counter.get(&0).unwrap_or(1);
        counter.insert(0, current + 1);
        current
    })
}