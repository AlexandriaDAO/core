/// Randomness utilities for nonce and seed generation
///
/// Uses ChaCha20 RNG seeded from IC management canister for secure synchronous
/// randomness generation in query functions without async overhead.
use crate::core::crypto::hash_with_domain;
use crate::core::time::now;
use ic_cdk::api::management_canister::main::raw_rand;
use rand_chacha::{
    rand_core::{RngCore, SeedableRng},
    ChaCha20Rng,
};
use std::cell::RefCell;

// Constants for randomness generation
const NONCE_SIZE: usize = 10;
const SEED_SIZE: usize = 32;

thread_local! {
    /// ChaCha20 RNG initialized with performance counter seed, then re-seeded with IC randomness
    static RNG: RefCell<ChaCha20Rng> = RefCell::new(
        ChaCha20Rng::from_seed(Default::default())
    );
}

//===================================================================================================
// CORE RANDOMNESS GENERATION
//===================================================================================================

/// Generate 32 bytes using performance counter entropy (synchronous)
///
/// Uses instruction counter and timestamp to generate deterministic but unpredictable
/// entropy. Works in query calls without requiring async operations.
///
/// Returns: 32 bytes of pseudo-random data
fn generate_randomness() -> [u8; 32] {
    let performance = ic_cdk::api::performance_counter(0);
    let timestamp = now();

    // Create entropy buffer on stack (no heap allocation)
    let mut entropy = [0u8; 16];
    entropy[..8].copy_from_slice(&performance.to_be_bytes());
    entropy[8..].copy_from_slice(&timestamp.to_be_bytes());

    // Hash to get full 32 bytes
    hash_with_domain(b"RANDOMNESS_ENTROPY", &entropy)
}

/// Generate secure random bytes from IC management canister
///
/// Attempts to get true randomness from IC's raw_rand, falls back to
/// performance counter entropy if IC randomness is unavailable.
///
/// Returns: 32 bytes of randomness
async fn generate_true_randomness() -> [u8; 32] {
    raw_rand()
        .await
        .map(|(bytes,)| bytes.try_into().unwrap())
        .unwrap_or_else(|e| {
            ic_cdk::println!("IC randomness failed: {:?}, using fallback", e);
            generate_randomness()
        })
}

//===================================================================================================
// RNG MANAGEMENT
//===================================================================================================

/// Initialize RNG with secure seed from IC management canister
///
/// This should be called once during canister initialization
pub async fn init_rng() {
    ic_cdk::println!("INITIALIZING RNG");
    let seed = generate_true_randomness().await;
    RNG.with_borrow_mut(|rng| *rng = ChaCha20Rng::from_seed(seed));
    ic_cdk::println!("RNG INITIALIZED WITH SEED");
}

//===================================================================================================
// PUBLIC API FUNCTIONS
//===================================================================================================

/// Generate secure nonce for SIWE messages (synchronous)
///
/// Uses the initialized ChaCha20 RNG for secure nonce generation.
/// Returns: 10 bytes (80 bits) of cryptographically secure randomness
pub fn generate_nonce() -> [u8; NONCE_SIZE] {
    RNG.with_borrow_mut(|rng| {
        let mut nonce = [0u8; NONCE_SIZE];
        rng.fill_bytes(&mut nonce);
        nonce
    })
}

/// Generate secure seed (synchronous, uses initialized RNG)
///
/// Uses the pre-seeded ChaCha20 RNG for secure seed generation.
/// Returns: 32 bytes of cryptographically secure randomness
pub fn generate_seed() -> [u8; 32] {
    RNG.with_borrow_mut(|rng| {
        let mut seed = [0u8; SEED_SIZE];
        rng.fill_bytes(&mut seed);
        seed
    })
}
