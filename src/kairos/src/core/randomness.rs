/// Randomness utilities using ChaCha20 RNG seeded from IC management canister
use ic_cdk::api::management_canister::main::raw_rand;
use rand_chacha::ChaCha20Rng;
use rand_core::{RngCore, SeedableRng};
use std::cell::RefCell;

thread_local! {
    /// ChaCha20 RNG initialized with IC randomness
    static RNG: RefCell<Option<ChaCha20Rng>> = RefCell::new(None);
}

/// Initialize RNG with secure seed from IC management canister
pub async fn init_rng() {
    ic_cdk::println!("KAIROS: Initializing RNG...");

    let seed = match raw_rand().await {
        Ok((bytes,)) => {
            let mut seed = [0u8; 32];
            seed.copy_from_slice(&bytes[..32]);
            seed
        }
        Err(e) => {
            ic_cdk::println!("KAIROS: IC randomness failed: {:?}, using fallback", e);
            generate_fallback_seed()
        }
    };

    RNG.with_borrow_mut(|rng| *rng = Some(ChaCha20Rng::from_seed(seed)));
    ic_cdk::println!("KAIROS: RNG initialized successfully");
}

/// Generate fallback seed using performance counter
fn generate_fallback_seed() -> [u8; 32] {
    let performance = ic_cdk::api::performance_counter(0);
    let timestamp = ic_cdk::api::time();

    let mut seed = [0u8; 32];
    seed[..8].copy_from_slice(&performance.to_be_bytes());
    seed[8..16].copy_from_slice(&timestamp.to_be_bytes());

    // Fill rest with hash-like data
    for i in 16..32 {
        seed[i] = ((performance + timestamp + i as u64) % 256) as u8;
    }

    seed
}

/// Check if RNG is initialized
pub fn is_rng_initialized() -> bool {
    RNG.with_borrow(|rng| rng.is_some())
}

/// Generate random bytes (32 bytes for server seed)
pub fn generate_random_bytes() -> Option<[u8; 32]> {
    RNG.with_borrow_mut(|rng| {
        rng.as_mut().map(|r| {
            let mut bytes = [0u8; 32];
            r.fill_bytes(&mut bytes);
            bytes
        })
    })
}

/// Generate a random server seed as hex string
pub fn generate_server_seed() -> Option<String> {
    generate_random_bytes().map(|bytes| hex::encode(bytes))
}
