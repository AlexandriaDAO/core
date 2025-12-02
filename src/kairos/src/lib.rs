use ic_cdk_macros::{init, post_upgrade, update};
use std::time::Duration;

use crate::store::init_counters;
use crate::core::randomness::{init_rng, is_rng_initialized};

pub mod api;
pub mod constants;
pub mod core;
pub mod errors;
pub mod guard;
pub mod models;
pub mod store;

// Re-export types for Candid generation
pub use api::queries::*;
pub use api::updates::*;
pub use errors::game::{GameError, GameResult};
pub use models::balance::BalanceInfo;
pub use models::game::{
    CashoutResult, ClickResult, Game, GameConfig, GameStatus, GameSummary, StartGameResponse,
    Tile, TileState,
};

ic_cdk::export_candid!();

fn schedule_rng_init() {
    ic_cdk_timers::set_timer(Duration::ZERO, || {
        ic_cdk::spawn(async {
            init_rng().await;
        });
    });
}

#[init]
fn init() {
    ic_cdk::setup();
    init_counters();
    schedule_rng_init();
    ic_cdk::println!("KAIROS: Canister initialized");
}

#[post_upgrade]
fn post_upgrade() {
    ic_cdk::setup();
    schedule_rng_init();
    ic_cdk::println!("KAIROS: Canister upgraded, RNG re-initializing");
}

/// Manually initialize RNG if needed (admin function)
#[update]
pub async fn admin_init_rng() -> Result<String, String> {
    if is_rng_initialized() {
        return Ok("RNG already initialized".to_string());
    }
    init_rng().await;
    if is_rng_initialized() {
        Ok("RNG initialized successfully".to_string())
    } else {
        Err("Failed to initialize RNG".to_string())
    }
}
