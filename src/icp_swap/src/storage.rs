use candid::Deserialize;
use candid::{CandidType, Principal};
use std::cell::RefCell;
use std::collections::{BTreeSet, HashMap};


thread_local! {
    pub static STATE: RefCell<State> = RefCell::new(State{pending_requests: BTreeSet::new()});
    pub static STAKES: RefCell<Stakes> = RefCell::new(Stakes { stakes: HashMap::new()});
    pub static ARCHIVED_TRANSACTION_LOG: RefCell<Trxs> = RefCell::new(Trxs { archive_trx: HashMap::new()});
    pub static TOTAL_ALEX_STAKED:  RefCell<u64> = RefCell::new(0);
    pub static TOTAL_ICP_AVAILABLE: RefCell<u64> = RefCell::new(0);
    pub static TOTAL_UNCLAIMED_ICP_REWARD:RefCell<u64> = RefCell::new(0);
    pub static LBRY_RATIO: RefCell<LbryRatio> = RefCell::new(LbryRatio {
        ratio: 0,
        time: 0,
    });
    pub static TOTAL_ARCHIVED_BALANCE: RefCell<u64> = RefCell::new(0);
    pub static APY: RefCell<DailyValues> = RefCell::new(DailyValues::default());
    pub static DISTRIBUTION_INTERVALS: RefCell<u32> = RefCell::new(0);


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
pub struct State {
    pub pending_requests: BTreeSet<Principal>,
}
#[derive(CandidType, Deserialize, Clone)]
pub struct ArchiveBalance {
    pub icp: u64,
}
#[derive(CandidType, Deserialize, Clone)]
pub struct Trxs {
    pub archive_trx: HashMap<Principal, ArchiveBalance>,
}

#[derive(CandidType, Deserialize, Default)]
pub struct DailyValues {
   pub values: HashMap<u32, u128>,
}