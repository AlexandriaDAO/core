use ic_cdk::{caller, update};

use crate::constants::{GRID_SIZE, MIN_MINES, MAX_MINES, MIN_BET, MAX_BET, LBRY_TRANSFER_FEE};
use crate::core::multiplier::{calculate_multiplier, calculate_potential_win};
use crate::core::provably_fair::{generate_mine_positions, hash_server_seed};
use crate::core::randomness::{generate_server_seed, is_rng_initialized};
use crate::core::balance::{
    get_user_kairos_balance, get_house_balance, transfer_bet_to_house,
    transfer_winnings_to_user,
};
use crate::errors::game::{GameError, GameResult};
use crate::guard::not_anon;
use crate::models::balance::BalanceInfo;
use crate::models::game::{
    CashoutResult, ClickResult, Game, GameConfig, GameStatus, StartGameResponse, TileState,
};
use crate::store;

/// Start a new game
/// Pre-requisite: User must have transferred LBRY to their Kairos subaccount
/// via NFT Manager's spend_for_app function
#[update(guard = "not_anon")]
pub async fn start_game(config: GameConfig) -> GameResult<StartGameResponse> {
    let user = caller();

    // Check RNG is initialized
    if !is_rng_initialized() {
        return Err(GameError::RngNotInitialized);
    }

    // Validate configuration
    if config.mine_count < MIN_MINES || config.mine_count > MAX_MINES {
        return Err(GameError::InvalidMineCount {
            min: MIN_MINES,
            max: MAX_MINES,
            provided: config.mine_count,
        });
    }

    if config.bet_amount < MIN_BET || config.bet_amount > MAX_BET {
        return Err(GameError::InvalidBetAmount {
            min: MIN_BET,
            max: MAX_BET,
            provided: config.bet_amount,
        });
    }

    // Check user doesn't have an active game
    if let Some(existing_id) = store::get_user_active_game(user) {
        return Err(GameError::ActiveGameExists { game_id: existing_id });
    }

    // Check user has sufficient LBRY in their Kairos subaccount
    let user_balance = get_user_kairos_balance(user).await.map_err(|e| {
        GameError::InternalError { reason: e }
    })?;

    if user_balance < config.bet_amount {
        return Err(GameError::InsufficientBalance {
            required: config.bet_amount,
            available: user_balance,
        });
    }

    // Generate server seed
    let server_seed = generate_server_seed().ok_or(GameError::RngNotInitialized)?;
    let server_seed_hash = hash_server_seed(&server_seed);

    // Generate mine positions
    let mine_positions = generate_mine_positions(&server_seed, &config.client_seed, config.mine_count);

    // Create game
    let game_id = store::get_next_game_id();
    let game = Game::new(
        game_id,
        user,
        config.bet_amount,
        config.mine_count,
        server_seed,
        server_seed_hash.clone(),
        config.client_seed,
        mine_positions,
        ic_cdk::api::time(),
    );

    // Save game
    store::save_game(&game);
    store::set_user_active_game(user, game_id);

    Ok(StartGameResponse {
        game_id,
        server_seed_hash,
        bet_amount: config.bet_amount,
        mine_count: config.mine_count,
    })
}

/// Click a tile in an active game
#[update(guard = "not_anon")]
pub async fn click_tile(game_id: u64, tile_index: u8) -> GameResult<ClickResult> {
    let user = caller();

    // Validate tile index
    if tile_index >= GRID_SIZE {
        return Err(GameError::InvalidTileIndex {
            max: GRID_SIZE,
            provided: tile_index,
        });
    }

    // Get and validate game
    let mut game = store::get_game(game_id).ok_or(GameError::GameNotFound { game_id })?;

    if game.player != user {
        return Err(GameError::GameNotFound { game_id });
    }

    if game.status != GameStatus::Active {
        return Err(GameError::GameNotActive);
    }

    // Check if tile already revealed
    let tile = &game.tiles[tile_index as usize];
    if tile.state != TileState::Hidden {
        return Err(GameError::TileAlreadyRevealed { tile_index });
    }

    // Reveal the tile
    let is_mine = game.tiles[tile_index as usize].is_mine;

    if is_mine {
        // Hit a mine - game over
        game.tiles[tile_index as usize].state = TileState::Mine;
        game.status = GameStatus::Lost;
        game.ended_at = Some(ic_cdk::api::time());

        // Reveal all mines
        for tile in &mut game.tiles {
            if tile.is_mine {
                tile.state = TileState::Mine;
            }
        }

        // Transfer bet from user's Kairos subaccount to house pool
        // We transfer the bet minus the fee
        let transfer_amount = game.bet_amount.saturating_sub(LBRY_TRANSFER_FEE);
        if transfer_amount > 0 {
            transfer_bet_to_house(user, transfer_amount).await.map_err(|e| {
                GameError::InternalError { reason: format!("Failed to transfer bet to house: {}", e) }
            })?;
        }

        store::save_game(&game);
        store::clear_user_active_game(user);
        store::add_to_user_history(user, game_id);

        Ok(ClickResult {
            game_id,
            tile_index,
            is_mine: true,
            game_status: GameStatus::Lost,
            new_multiplier: game.current_multiplier,
            potential_win: 0,
            revealed_count: game.revealed_count,
            mine_positions: Some(game.get_mine_positions()),
            server_seed: game.server_seed.clone(),
        })
    } else {
        // Safe tile
        game.tiles[tile_index as usize].state = TileState::Revealed;
        game.revealed_count += 1;

        // Update multiplier
        game.current_multiplier = calculate_multiplier(GRID_SIZE, game.mine_count, game.revealed_count);
        game.potential_win = calculate_potential_win(game.bet_amount, game.current_multiplier);

        store::save_game(&game);

        Ok(ClickResult {
            game_id,
            tile_index,
            is_mine: false,
            game_status: GameStatus::Active,
            new_multiplier: game.current_multiplier,
            potential_win: game.potential_win,
            revealed_count: game.revealed_count,
            mine_positions: None,
            server_seed: None,
        })
    }
}

/// Cash out winnings from an active game
#[update(guard = "not_anon")]
pub async fn cash_out(game_id: u64) -> GameResult<CashoutResult> {
    let user = caller();

    // Get and validate game
    let mut game = store::get_game(game_id).ok_or(GameError::GameNotFound { game_id })?;

    if game.player != user {
        return Err(GameError::GameNotFound { game_id });
    }

    if game.status != GameStatus::Active {
        return Err(GameError::GameNotActive);
    }

    if game.revealed_count == 0 {
        return Err(GameError::InternalError {
            reason: "Must reveal at least one tile before cashing out".to_string(),
        });
    }

    // Calculate final winnings
    let win_amount = game.potential_win;

    // Update game status
    game.status = GameStatus::Won;
    game.ended_at = Some(ic_cdk::api::time());

    // First, transfer the bet from user's Kairos subaccount to house pool
    let bet_transfer_amount = game.bet_amount.saturating_sub(LBRY_TRANSFER_FEE);
    if bet_transfer_amount > 0 {
        transfer_bet_to_house(user, bet_transfer_amount).await.map_err(|e| {
            GameError::InternalError { reason: format!("Failed to transfer bet to house: {}", e) }
        })?;
    }

    // Then transfer winnings from house pool to user's NFT Manager subaccount (locked balance)
    let winnings_transfer_amount = win_amount.saturating_sub(LBRY_TRANSFER_FEE);
    if winnings_transfer_amount > 0 {
        // Check house has sufficient balance
        let house_balance = get_house_balance().await.map_err(|e| {
            GameError::InternalError { reason: e }
        })?;

        if house_balance < winnings_transfer_amount + LBRY_TRANSFER_FEE {
            return Err(GameError::InternalError {
                reason: "House pool has insufficient balance for payout".to_string(),
            });
        }

        transfer_winnings_to_user(user, winnings_transfer_amount).await.map_err(|e| {
            GameError::InternalError { reason: format!("Failed to transfer winnings: {}", e) }
        })?;
    }

    // Save and cleanup
    store::save_game(&game);
    store::clear_user_active_game(user);
    store::add_to_user_history(user, game_id);

    let server_seed = game.server_seed.clone().unwrap_or_default();
    let mine_positions = game.get_mine_positions();

    Ok(CashoutResult {
        game_id,
        final_multiplier: game.current_multiplier,
        bet_amount: game.bet_amount,
        win_amount,
        revealed_count: game.revealed_count,
        server_seed,
        mine_positions,
    })
}

/// Get user's balance in their Kairos subaccount
#[update(guard = "not_anon")]
pub async fn get_gaming_balance() -> GameResult<BalanceInfo> {
    let user = caller();

    let available = get_user_kairos_balance(user).await.map_err(|e| {
        GameError::InternalError { reason: e }
    })?;

    // Check if user has an active game
    let in_game = if let Some(game_id) = store::get_user_active_game(user) {
        if let Some(game) = store::get_game(game_id) {
            game.bet_amount
        } else {
            0
        }
    } else {
        0
    };

    Ok(BalanceInfo {
        available,
        in_game,
        total: available + in_game,
    })
}

/// Get house pool LBRY balance (admin function for monitoring)
#[update]
pub async fn get_house_pool_balance() -> GameResult<u64> {
    get_house_balance().await.map_err(|e| {
        GameError::InternalError { reason: e }
    })
}

