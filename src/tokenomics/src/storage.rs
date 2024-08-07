use std::cell::RefCell;
use std::collections::BTreeSet;
use std::sync::Arc;
use std::sync::Mutex;

use candid::Principal;
type Users = BTreeSet<Principal>;
pub const LBRY_THRESHOLDS: [u64; 23] = [
    10_000_000_000,         // 100.0
    20_000_000_000,         // 200.0
    40_000_000_000,         // 400.0
    100_000_000_000,        // 1,000.0
    200_000_000_000,        // 2,000.0
    400_000_000_000,        // 4,000.0
    800_000_000_000,        // 8,000.0
    1_600_000_000_000,      // 16,000.0
    3_200_000_000_000,      // 32,000.0
    6_400_000_000_000,      // 64,000.0
    12_800_000_000_000,     // 128,000.0
    25_600_000_000_000,     // 256,000.0
    51_200_000_000_000,     // 512,000.0
    102_400_000_000_000,    // 1,024,000.0
    204_800_000_000_000,    // 2,048,000.0
    409_600_000_000_000,    // 4,096,000.0
    819_200_000_000_000,    // 8,192,000.0
    1_638_400_000_000_000,  // 16,384,000.0
    3_276_800_000_000_000,  // 32,768,000.0
    6_553_600_000_000_000,  // 65,536,000.0
    13_107_200_000_000_000, // 131,072,000.0
    26_214_400_000_000_000, // 262,144,000.0
    52_428_800_000_000_000, // 524,288,000.0
];

pub const ALEX_PER_THRESHOLD: [u64; 23] = [
    //upto 4 decimals
    1000_0000, // 1000.0
    500_0000,  // 500.0
    250_0000,  // 250.0
    125_0000,  // 125.0
    63_0000,   // 63.0
    32_0000,   // 32.0
    16_0000,   // 16.0
    7_0000,    // 7.0
    4_0000,    // 4.0
    2_0000,    // 2.0
    1_0000,    // 1.0
    5_000,     // 0.5
    25_00,     // 0.25
    13_00,     // 0.13
    6_00,      // 0.06
    3_00,      // 0.03
    15_0,      // 0.015
    100,       // 0.01
    75,        // 0.0075
    50,         // 0.005
    30,         // 0.003
    20,         // 0.002
    15,        // 0.0015
];
// pub const ALEX_PER_THRESHOLD: [u64; 23] = [
//     100_000_000_000, // 1000.0
//     50_000_000_000,  // 500.0
//     25_000_000_000,  // 250.0
//     12_500_000_000,  // 125.0
//     6_300_000_000,   // 63.0
//     3_200_000_000,   // 32.0
//     1_600_000_000,   // 16.0
//     700_000_000,     // 7.0
//     400_000_000,     // 4.0
//     200_000_000,     // 2.0
//     100_000_000,     // 1.0
//     50_000_000,      // 0.5
//     25_000_000,      // 0.25
//     13_000_000,      // 0.13
//     6_000_000,       // 0.06
//     3_000_000,       // 0.03
//     1_500_000,       // 0.015
//     1_000_000,       // 0.01
//     750_000,         // 0.0075
//     500_000,         // 0.005
//     300_000,         // 0.003
//     200_000,         // 0.002
//     150_000,         // 0.0015
// ];

thread_local! {
    pub static ALLOWED_CALLERS: RefCell<Users> = RefCell::default();
      //Tokenomics
     pub static TOTAL_LBRY_BURNED: Arc<Mutex<u64>> = Arc::new(Mutex::new(0));
     pub static CURRENT_THRESHOLD: Arc<Mutex<u32>> = Arc::new(Mutex::new(0));
     pub static TOTAL_ALEX_MINTED: Arc<Mutex<u64>> = Arc::new(Mutex::new(0));
}
