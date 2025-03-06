use candid::{CandidType, Decode, Encode, Principal};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::{DefaultMemoryImpl, Storable};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    StableBTreeMap,
};
use serde::Deserialize;
use std::borrow::Cow;
use std::cell::RefCell;

use crate::ExecutionError;
type Memory = VirtualMemory<DefaultMemoryImpl>;

pub const LBRY_THRESHOLDS: [u64; 18] = [
    21_000,         // 21,000.00
    42_000,         // 42,000.00
    84_000,         // 84,000.00
    168_000,        // 168,000.00
    336_000,        // 336,000.00
    672_000,        // 672,000.00
    1_344_000,      // 1,344,000.00
    2_688_000,      // 2,688,000.00
    5_376_000,      // 5,376,000.00
    10_752_000,     // 10,752,000.00
    21_504_000,     // 21,504,000.00
    43_008_000,     // 43,008,000.00
    86_016_000,     // 86,016,000.00
    172_032_000,    // 172,032,000.00
    344_064_000,    // 344,064,000.00
    688_128_000,    // 688,128,000.00
    1_376_256_000,  // 1,376,256,000.00
    61_632_592_000, // 61,632,592,000.00  61632592000
];

pub const ALEX_PER_THRESHOLD: [u64; 18] = [
    //upto 4 decimals
    50_000, // 5.0000
    25_000, // 2.5000
    12_500, // 1.2500
    6_250,  // 0.6250
    3_125,  // 0.3125
    1_562,  // 0.1562
    781,    // 0.0781
    391,    // 0.0391
    195,    // 0.0195
    98,     // 0.0098
    49,     // 0.0049
    24,     // 0.0024
    12,     // 0.0012
    6,      // 0.0006
    3,      // 0.0003
    2,      // 0.0002
    1,      // 0.0001
    1,      // 0.0001
];
pub const TOTAL_LBRY_BURNED_MEM_ID: MemoryId = MemoryId::new(0);
pub const CURRENT_THRESHOLD_MEM_ID: MemoryId = MemoryId::new(1);
pub const TOKEN_LOGS_MEM_ID: MemoryId = MemoryId::new(2);
pub const LOGS_COUNTER_ID: MemoryId = MemoryId::new(3);


thread_local! {
    //Tokenomics
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    pub static TOTAL_LBRY_BURNED: RefCell<StableBTreeMap<(), u64, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(TOTAL_LBRY_BURNED_MEM_ID)))
    );
    pub static CURRENT_THRESHOLD_INDEX: RefCell<StableBTreeMap<(), u32, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(CURRENT_THRESHOLD_MEM_ID)))
    );
    pub static LOGS: RefCell<Vec<Logs>> = RefCell::new(Vec::new());

    pub static TOKEN_LOGS: RefCell<StableBTreeMap<u64, TokenLogs, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(TOKEN_LOGS_MEM_ID)))
    );
    pub static TOKEN_LOG_COUNTER: RefCell<u64> = RefCell::new(0);


}

pub fn get_total_lbry_burned_mem() -> StableBTreeMap<(), u64, Memory> {
    TOTAL_LBRY_BURNED.with(|burned_map| {
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(TOTAL_LBRY_BURNED_MEM_ID)))
    })
}

pub fn get_current_threshold_index_mem() -> StableBTreeMap<(), u32, Memory> {
    CURRENT_THRESHOLD_INDEX.with(|threshold_map| {
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(CURRENT_THRESHOLD_MEM_ID)))
    })
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Logs{
    pub log:String,
    pub time:u64
}


#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TokenLogs {
    pub log_id:u64,
    pub timestamp: u64,
    pub caller: Principal,
    pub function: String,
    pub log_type: TokenLogType,
}
#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum TokenLogType {
    Info {
        detail: String,
    },
    Error {
        error: ExecutionError,
    },
}

impl Storable for TokenLogs {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}
