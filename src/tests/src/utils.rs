use candid::Principal;
use ic_cdk::api::call::RejectionCode;

pub const E8S_PER_ICP: u64 = 100_000_000;
pub const ICP_FEE: u64 = 10_000;
pub const LBRY_FEE: u64 = 4_000_000;
pub const MIN_DELAY_NS: u64 = 2_000_000_000; // 2 seconds in nanoseconds

/// Gets a test subaccount based on a predefined account name
pub fn get_test_subaccount(account_name: &str) -> Result<[u8; 32], RejectionCode> {
    let mut subaccount = [0u8; 32];
    match account_name.to_lowercase().as_str() {
        "admin" => subaccount[0] = 0,
        "alice" => subaccount[0] = 1,
        "bob" => subaccount[0] = 2,
        "charlie" => subaccount[0] = 3,
        _ => {
            ic_cdk::println!("Unknown account name: {}", account_name);
            return Err(RejectionCode::Unknown);
        }
    }
    Ok(subaccount)
} 