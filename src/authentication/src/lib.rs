// Core utilities shared across all authentication providers
mod core;
// IC-specific implementations and types
mod ic;
// Provider-specific implementations
mod providers;

use ic_cdk::{api::caller, export_candid, init, update};
use ic_cdk_timers;
use std::time::Duration;

use crate::core::randomness::init_rng;
use crate::providers::arweave::settings::init_arweave_settings;
use crate::providers::ethereum::settings::init_ethereum_settings;
use crate::providers::oisy::settings::init_oisy_settings;
use crate::providers::solana::settings::init_solana_settings;

// Re-export types needed for export_candid!()
pub use crate::core::error::{AuthError, AuthResult};
pub use crate::core::types::{LoginRequest, LoginResponse, MessageResponse};
pub use crate::ic::delegation::SignedDelegation;
pub use crate::providers::arweave::settings::ArweaveSettings;
pub use crate::providers::arweave::siwa_login::SIWALoginRequest;
pub use crate::providers::arweave::siwa_message::{SIWAMessageRequest, SIWAMessageResponse};
pub use crate::providers::ethereum::settings::EthereumSettings;
pub use crate::providers::ethereum::types::message::ETHMessage;
pub use crate::providers::oisy::icrc21::types::{
    Icrc21ConsentInfo, Icrc21ConsentMessageRequest, Icrc21Error,
};
pub use crate::providers::oisy::settings::OisySettings;
pub use crate::providers::oisy::siwo_login::SIWOLoginRequest;
pub use crate::providers::solana::settings::SolanaSettings;
pub use crate::providers::solana::siws_login::SIWSLoginRequest;
pub use crate::providers::solana::siws_message::SIWSMessageResponse;

#[init]
fn init_canister() {
    // Initialize Arweave settings storage (synchronous)
    if let Err(e) = init_arweave_settings() {
        ic_cdk::println!("Failed to initialize Arweave settings: {}", e);
    }

    // Initialize Ethereum settings storage (synchronous)
    if let Err(e) = init_ethereum_settings() {
        ic_cdk::println!("Failed to initialize Ethereum settings: {}", e);
    }

    // Initialize Oisy settings storage (synchronous)
    if let Err(e) = init_oisy_settings() {
        ic_cdk::println!("Failed to initialize Oisy settings: {}", e);
    }

    // Initialize Solana settings storage (synchronous)
    if let Err(e) = init_solana_settings() {
        ic_cdk::println!("Failed to initialize Solana settings: {}", e);
    }

    // Initialize RNG with timer (can't use inter-canister calls in init)
    ic_cdk_timers::set_timer(Duration::ZERO, || {
        ic_cdk::spawn(init_rng());
    });
}

#[update]
async fn whoami() -> String {
    caller().to_text()
}

export_candid!();
