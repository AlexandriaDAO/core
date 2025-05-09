use crate::storage::refresh_random_shelf_candidates;
use ic_cdk;

#[ic_cdk::update]
pub fn debug_trigger_refresh_random_candidates() -> Result<(), String> {
    ic_cdk::println!("DEBUG: Manually triggering refresh_random_shelf_candidates...");
    refresh_random_shelf_candidates();
    ic_cdk::println!("DEBUG: refresh_random_shelf_candidates finished.");
    Ok(())
} 