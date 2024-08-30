use candid::Deserialize;
use candid::{CandidType, Principal};
use std::cell::Cell;
use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

thread_local! {
    pub static STAKES: RefCell<Stakes> = RefCell::new(Stakes { stakes: HashMap::new()});
    pub static TOTAL_ALEX_STAKED: Arc<Mutex<u64>> = Arc::new(Mutex::new(0));
    pub static TOTAL_ICP_AVAILABLE: Arc<Mutex<u64>>=Arc::new(Mutex::new(0));
    pub static TOTAL_UNCLAIMED_ICP_REWARD: Arc<Mutex<u64>>=Arc::new(Mutex::new(0));
    pub static LBRY_RATIO: RefCell<LbryRatio> = RefCell::new(LbryRatio {
        ratio: 0,
        time: 0,
    });
    pub static REENTRANCY_GUARD: Cell<bool> = Cell::new(false);
}
#[derive(CandidType, Deserialize, Clone)]
pub struct Stakes {
    pub stakes: HashMap<Principal, Stake>,
}
#[derive(CandidType, Deserialize, Clone)]
pub struct Stake {
    pub amount: u64,
    pub time: u64,
    pub reward_icp: u64,
}
#[derive(CandidType, Deserialize, Clone)]
pub struct LbryRatio {
    pub ratio: u64,
    pub time: u64,
}
