use candid::{CandidType, Decode, Encode, Nat};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    storable::Bound,
    DefaultMemoryImpl, StableBTreeMap, Storable,
};
use std::{borrow::Cow, cell::RefCell, ops::Deref};
use serde;

// Define the memory type using VirtualMemory and DefaultMemoryImpl
type Memory = VirtualMemory<DefaultMemoryImpl>;

// Memory ID for the token list stable BTreeMap
const TOKEN_LIST_MEM_ID: MemoryId = MemoryId::new(0);
const OG_NFT_SBT_COUNTS_MEM_ID: MemoryId = MemoryId::new(1); // New memory ID
const OG_NFT_RARITY_PERCENTAGES_MEM_ID: MemoryId = MemoryId::new(2); // New memory ID for rarity
const EXECUTION_LOGS_MEM_ID: MemoryId = MemoryId::new(3); // New memory ID for execution logs

// Storage keys for different ICRC7 sources (made public)
pub const STORAGE_KEY_ICRC7_MAIN: u8 = 0;
pub const STORAGE_KEY_ICRC7_SCION: u8 = 1;

// Newtype wrapper for Vec<Nat> to overcome the orphan rule
#[derive(CandidType, serde::Serialize, serde::Deserialize, Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Default)]
pub struct TokenIdList(pub Vec<Nat>);

// Newtype wrapper for SBT count
#[derive(CandidType, serde::Serialize, serde::Deserialize, Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Default)]
pub struct SbtCount(pub u32);

// Newtype wrapper for Rarity Percentage
#[derive(CandidType, serde::Serialize, serde::Deserialize, Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Default)]
pub struct RarityPercentage(pub u32);

// Newtype wrapper for log keys
#[derive(CandidType, serde::Serialize, serde::Deserialize, Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Default, Hash)]
pub struct LogKey(pub u64);

// Enum to represent the status of an execution
#[derive(CandidType, serde::Serialize, serde::Deserialize, Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub enum ExecutionStatus {
    Success,
    Failure { error: String },
}

// Struct to store details of a timed execution
#[derive(CandidType, serde::Serialize, serde::Deserialize, Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct ExecutionLogEntry {
    pub timestamp_nanos: u64,
    pub function_name: String,
    pub status: ExecutionStatus,
}

// Newtype wrapper for Nat to make it Storable
#[derive(CandidType, serde::Serialize, serde::Deserialize, Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Default, Hash)]
pub struct StorableNat(pub Nat);

// Implement Deref to allow easy access to the inner Vec<Nat>
impl Deref for TokenIdList {
    type Target = Vec<Nat>;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

// Implement Deref for SbtCount to access inner u32 (optional, but can be convenient)
impl Deref for SbtCount {
    type Target = u32;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

// Implement Deref for RarityPercentage to access inner u32 (optional, but can be convenient)
impl Deref for RarityPercentage {
    type Target = u32;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

// Implement Deref for StorableNat to access inner Nat
impl Deref for StorableNat {
    type Target = Nat;
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

// Implement From<u32> for SbtCount for easy conversion
impl From<u32> for SbtCount {
    fn from(count: u32) -> Self {
        SbtCount(count)
    }
}

// Implement From<u32> for RarityPercentage for easy conversion
impl From<u32> for RarityPercentage {
    fn from(percentage: u32) -> Self {
        RarityPercentage(percentage)
    }
}

// Implement From<Nat> for StorableNat for easy conversion
impl From<Nat> for StorableNat {
    fn from(nat: Nat) -> Self {
        StorableNat(nat)
    }
}

// Implement From<StorableNat> for Nat for easy conversion
impl From<StorableNat> for Nat {
    fn from(storable_nat: StorableNat) -> Self {
        storable_nat.0
    }
}

// Thread-local static for the MemoryManager
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // Thread-local static for the StableBTreeMap storing the token ID list.
    pub static TOKEN_ID_LIST: RefCell<StableBTreeMap<u8, TokenIdList, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(TOKEN_LIST_MEM_ID))
    ));

    // Thread-local static for StableBTreeMap storing OG NFT ID to SBT count.
    // Key is now StorableNat instead of Nat
    pub static OG_NFT_SBT_COUNTS: RefCell<StableBTreeMap<StorableNat, SbtCount, Memory>> = 
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(OG_NFT_SBT_COUNTS_MEM_ID))
    ));

    // Thread-local static for StableBTreeMap storing OG NFT ID to Rarity Percentage.
    pub static OG_NFT_RARITY_PERCENTAGES: RefCell<StableBTreeMap<StorableNat, RarityPercentage, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(OG_NFT_RARITY_PERCENTAGES_MEM_ID))
    ));

    // Thread-local static for StableBTreeMap storing execution logs.
    // Key is LogKey (u64 counter), Value is ExecutionLogEntry
    pub static EXECUTION_LOGS: RefCell<StableBTreeMap<LogKey, ExecutionLogEntry, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(EXECUTION_LOGS_MEM_ID))
    ));

    // Counter for generating unique log keys
    pub static NEXT_LOG_KEY: RefCell<u64> = RefCell::new(0);
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

// Implement Storable for SbtCount
impl Storable for SbtCount {
    fn to_bytes(&self) -> Cow<[u8]> {
        // Use fixed-size big-endian byte representation for the u32
        Cow::Owned(self.0.to_be_bytes().to_vec())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        // Convert fixed-size big-endian byte representation back to u32
        // ic-stable-structures guarantees `bytes` will be of `max_size` when `is_fixed_size` is true.
        let array: [u8; 4] = bytes.as_ref().try_into().expect(
            "SbtCount::from_bytes received slice with incorrect length. Expected 4 bytes for u32."
        );
        SbtCount(u32::from_be_bytes(array))
    }

    const BOUND: Bound = Bound::Bounded { // u32 is bounded
        max_size: std::mem::size_of::<u32>() as u32, // Max size of u32 (4 bytes)
        is_fixed_size: true, // Guarantees to_bytes returns max_size bytes
    };
}

// Implement Storable for RarityPercentage
impl Storable for RarityPercentage {
    fn to_bytes(&self) -> Cow<[u8]> {
        // Use fixed-size big-endian byte representation for the u32
        Cow::Owned(self.0.to_be_bytes().to_vec())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        // Convert fixed-size big-endian byte representation back to u32
        let array: [u8; 4] = bytes.as_ref().try_into().expect(
            "RarityPercentage::from_bytes received slice with incorrect length. Expected 4 bytes for u32."
        );
        RarityPercentage(u32::from_be_bytes(array))
    }

    const BOUND: Bound = Bound::Bounded { // u32 is bounded
        max_size: std::mem::size_of::<u32>() as u32, // Max size of u32 (4 bytes)
        is_fixed_size: true, // Guarantees to_bytes returns max_size bytes
    };
}

// Implement Storable for StorableNat
impl Storable for StorableNat {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        StorableNat(Decode!(bytes.as_ref(), Nat).unwrap())
    }

    const BOUND: Bound = Bound::Unbounded; // Nat can be arbitrarily large
}

// Implement Storable for LogKey
impl Storable for LogKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(self.0.to_be_bytes().to_vec())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let array: [u8; 8] = bytes.as_ref().try_into().expect(
            "LogKey::from_bytes received slice with incorrect length. Expected 8 bytes for u64."
        );
        LogKey(u64::from_be_bytes(array))
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: std::mem::size_of::<u64>() as u32,
        is_fixed_size: true,
    };
}

// Implement Storable for ExecutionLogEntry
impl Storable for ExecutionLogEntry {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded; // String makes it unbounded
}
