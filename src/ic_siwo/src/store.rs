use candid::Principal;
use std::cell::RefCell;

use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap,
};

use rand_chacha::ChaCha20Rng;

use crate::types::State;
use crate::settings::types::Settings;
use crate::challenge::map::ChallengeMap;

thread_local! {
    pub(crate) static STATE: State = State::default();

    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // The random number generator is used to generate nonces for challenges.
    pub(crate) static RNG: RefCell<Option<ChaCha20Rng>> = const { RefCell::new(None) };

    // The settings control the behavior of the Oisy library. The settings must be initialized before any other library functions are called.
    pub(crate) static SETTINGS: RefCell<Option<Settings>> = const { RefCell::new(None) };

    pub(crate) static IC_OISY: RefCell<StableBTreeMap<Principal, Principal, VirtualMemory<DefaultMemoryImpl>>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );

    pub(crate) static OISY_IC: RefCell<StableBTreeMap<Principal, Principal, VirtualMemory<DefaultMemoryImpl>>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );

    // Challenges are stored in global state during the login process. The key is the
    // principal and the value is the challenge. After a successful
    // login, the challenge is removed from state.
    pub(crate) static CHALLENGES: RefCell<ChallengeMap> = RefCell::new(ChallengeMap::new());

}