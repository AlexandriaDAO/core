use crate::store::RNG;
use candid::Principal;
use rand_chacha::{rand_core::SeedableRng, ChaCha20Rng};
use std::time::Duration;

pub(super) fn init_rng() {
    // Initialize the random number generator with a seed from the management canister.
    ic_cdk_timers::set_timer(Duration::ZERO, || {
        ic_cdk::spawn(async {
            let (seed,): ([u8; 32],) =
                ic_cdk::call(Principal::management_canister(), "raw_rand", ())
                    .await
                    .unwrap();
            RNG.with_borrow_mut(|rng| *rng = Some(ChaCha20Rng::from_seed(seed)));
        })
    });
}
