use candid::{CandidType, Decode, Encode, Principal};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;
use serde::{Serialize, Deserialize};

use crate::models::game::Game;
use crate::constants::MAX_VALUE_SIZE;

type Memory = VirtualMemory<DefaultMemoryImpl>;

// Memory IDs for different storage maps
const GAMES_MEM_ID: MemoryId = MemoryId::new(0);
const USER_ACTIVE_GAMES_MEM_ID: MemoryId = MemoryId::new(1);
const USER_GAME_HISTORY_MEM_ID: MemoryId = MemoryId::new(2);
// Note: MemoryId 3 was previously used for BALANCES (deprecated - balance now tracked via LBRY subaccounts)
const GAME_COUNTER_MEM_ID: MemoryId = MemoryId::new(4);

// Storable wrapper for Principal
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct StorablePrincipal(pub Principal);

impl Storable for StorablePrincipal {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Decode!(bytes.as_ref(), Principal).unwrap())
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 64,
        is_fixed_size: false,
    };
}

// Storable wrapper for Game
#[derive(Debug, Clone)]
pub struct StorableGame(pub Game);

impl Storable for StorableGame {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Decode!(bytes.as_ref(), Game).unwrap())
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

// Storable wrapper for game ID list (history)
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct GameIdList(pub Vec<u64>);

#[derive(Debug, Clone)]
pub struct StorableGameIdList(pub GameIdList);

impl Storable for StorableGameIdList {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Decode!(bytes.as_ref(), GameIdList).unwrap())
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    // All games: game_id -> Game
    pub static GAMES: RefCell<StableBTreeMap<u64, StorableGame, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(GAMES_MEM_ID)),
        )
    );

    // User active game: user -> game_id (only one active game per user)
    pub static USER_ACTIVE_GAMES: RefCell<StableBTreeMap<StorablePrincipal, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USER_ACTIVE_GAMES_MEM_ID)),
        )
    );

    // User game history: user -> list of game_ids
    pub static USER_GAME_HISTORY: RefCell<StableBTreeMap<StorablePrincipal, StorableGameIdList, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USER_GAME_HISTORY_MEM_ID)),
        )
    );

    // Game ID counter
    pub static GAME_COUNTER: RefCell<StableBTreeMap<u64, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(GAME_COUNTER_MEM_ID)),
        )
    );
}

/// Initialize counters if they don't exist
pub fn init_counters() {
    GAME_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        if counter.get(&0).is_none() {
            counter.insert(0, 1); // Start game IDs from 1
        }
    });
}

/// Get next game ID and increment counter
pub fn get_next_game_id() -> u64 {
    GAME_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        let current = counter.get(&0).unwrap_or(1);
        counter.insert(0, current + 1);
        current
    })
}

// ============== Game Operations ==============

pub fn save_game(game: &Game) {
    GAMES.with(|games| {
        games.borrow_mut().insert(game.id, StorableGame(game.clone()));
    });
}

pub fn get_game(game_id: u64) -> Option<Game> {
    GAMES.with(|games| {
        games.borrow().get(&game_id).map(|g| g.0)
    })
}

pub fn set_user_active_game(user: Principal, game_id: u64) {
    USER_ACTIVE_GAMES.with(|active| {
        active.borrow_mut().insert(StorablePrincipal(user), game_id);
    });
}

pub fn get_user_active_game(user: Principal) -> Option<u64> {
    USER_ACTIVE_GAMES.with(|active| {
        active.borrow().get(&StorablePrincipal(user))
    })
}

pub fn clear_user_active_game(user: Principal) {
    USER_ACTIVE_GAMES.with(|active| {
        active.borrow_mut().remove(&StorablePrincipal(user));
    });
}

pub fn add_to_user_history(user: Principal, game_id: u64) {
    USER_GAME_HISTORY.with(|history| {
        let mut history = history.borrow_mut();
        let key = StorablePrincipal(user);

        let mut game_ids = history
            .get(&key)
            .map(|list| list.0.0)
            .unwrap_or_default();

        game_ids.push(game_id);

        // Keep only last 100 games
        if game_ids.len() > 100 {
            let skip_count = game_ids.len() - 100;
            game_ids = game_ids.into_iter().skip(skip_count).collect();
        }

        history.insert(key, StorableGameIdList(GameIdList(game_ids)));
    });
}

pub fn get_user_game_history(user: Principal, limit: usize, offset: usize) -> Vec<u64> {
    USER_GAME_HISTORY.with(|history| {
        history
            .borrow()
            .get(&StorablePrincipal(user))
            .map(|list| {
                list.0.0
                    .iter()
                    .rev() // Most recent first
                    .skip(offset)
                    .take(limit)
                    .cloned()
                    .collect()
            })
            .unwrap_or_default()
    })
}
