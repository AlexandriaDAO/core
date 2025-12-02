use ic_cdk::{caller, query};

use crate::models::game::{Game, GameSummary};
use crate::store;
use crate::core::multiplier::{calculate_multiplier, calculate_next_multiplier, get_multiplier_table};
use crate::constants::GRID_SIZE;

/// Get user's active game (if any)
#[query]
pub fn get_active_game() -> Option<Game> {
    let user = caller();

    store::get_user_active_game(user)
        .and_then(|game_id| store::get_game(game_id))
        .map(|mut game| {
            // Don't reveal server seed for active games
            game.server_seed = None;
            game
        })
}

/// Get a specific game by ID
#[query]
pub fn get_game(game_id: u64) -> Option<Game> {
    let user = caller();

    store::get_game(game_id).map(|mut game| {
        // Only the player can see their game details
        if game.player != user {
            // Hide sensitive info for non-owners
            game.server_seed = None;
            game.client_seed = String::new();
        }
        game
    })
}

/// Get user's game history
#[query]
pub fn get_game_history(limit: u32, offset: u32) -> Vec<GameSummary> {
    let user = caller();

    let game_ids = store::get_user_game_history(user, limit as usize, offset as usize);

    game_ids
        .into_iter()
        .filter_map(|id| store::get_game(id))
        .map(|game| game.to_summary())
        .collect()
}

/// Calculate multiplier for given configuration (preview)
#[query]
pub fn calculate_multiplier_preview(mine_count: u8, revealed_count: u8) -> f64 {
    calculate_multiplier(GRID_SIZE, mine_count, revealed_count)
}

/// Calculate next click multiplier (preview)
#[query]
pub fn calculate_next_multiplier_preview(mine_count: u8, current_revealed: u8) -> f64 {
    calculate_next_multiplier(GRID_SIZE, mine_count, current_revealed)
}

/// Get full multiplier progression table for a mine count
#[query]
pub fn get_multiplier_progression(mine_count: u8) -> Vec<f64> {
    get_multiplier_table(mine_count)
}

/// Check if RNG is initialized (useful for frontend to know if games can start)
#[query]
pub fn is_ready() -> bool {
    crate::core::randomness::is_rng_initialized()
}

/// Get canister statistics
#[query]
pub fn get_stats() -> Stats {
    Stats {
        total_games: get_total_games_count(),
        is_rng_ready: crate::core::randomness::is_rng_initialized(),
    }
}

#[derive(candid::CandidType, serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct Stats {
    pub total_games: u64,
    pub is_rng_ready: bool,
}

fn get_total_games_count() -> u64 {
    store::GAME_COUNTER.with(|counter| {
        counter.borrow().get(&0).unwrap_or(1) - 1
    })
}
