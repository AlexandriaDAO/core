use std::collections::BTreeSet;
use std::sync::Arc;
use std::sync::Mutex;
use std::cell::RefCell;

use candid::Principal;
type Users = BTreeSet<Principal>;

pub const LBRY_THRESHOLDS: [f64; 23] = [
    100.0,
    200.0,
    400.0,
    1000.0,
    2000.0,
    4000.0,
    8000.0,
    16000.0,
    32000.0,
    64000.0,
    128000.0,
    256000.0,
    512000.0,
    1024000.0,
    2048000.0,
    4096000.0,
    8192000.0,
    16384000.0,
    32768000.0,
    65536000.0,
    131072000.0,
    262144000.0,
    524288000.0,
];
pub const ALEX_PER_THRESHOLD: [f64; 23] = [
    1000.0, 500.0, 250.0, 125.0, 63.0, 32.0, 16.0, 7.0, 4.0, 2.0, 1.0, 0.5, 0.25, 0.13, 0.06, 0.03,
    0.015, 0.01, 0.0075, 0.005, 0.003, 0.002, 0.0015,
];

thread_local! {
    pub static ALLOWED_CALLERS: RefCell<Users> = RefCell::default();
      //Tokenomics
     pub static TOTAL_LBRY_BURNED: Arc<Mutex<f64>> = Arc::new(Mutex::new(0.0));
     pub static CURRENT_THRESHOLD: Arc<Mutex<u32>> = Arc::new(Mutex::new(0));
     pub static TOTAL_ALEX_MINTED: Arc<Mutex<f64>> = Arc::new(Mutex::new(0.00));
}
