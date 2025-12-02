use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

/// Tile state in the game
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum TileState {
    Hidden,
    Revealed,
    Mine,
}

/// Individual tile in the grid
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Tile {
    pub index: u8,
    pub state: TileState,
    pub is_mine: bool,
}

/// Game status
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum GameStatus {
    Active,
    Won,   // Cashed out successfully
    Lost,  // Hit a mine
}

/// Main game structure
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Game {
    pub id: u64,
    pub player: Principal,
    pub bet_amount: u64,           // in e8s
    pub mine_count: u8,            // 1-15
    pub tiles: Vec<Tile>,          // 16 tiles
    pub revealed_count: u8,
    pub current_multiplier: f64,
    pub potential_win: u64,        // bet_amount * current_multiplier
    pub status: GameStatus,
    pub server_seed_hash: String,  // SHA256 hash shown before game starts
    pub server_seed: Option<String>, // Revealed after game ends
    pub client_seed: String,
    pub created_at: u64,
    pub ended_at: Option<u64>,
}

/// Game configuration for starting a new game
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct GameConfig {
    pub bet_amount: u64,
    pub mine_count: u8,
    pub client_seed: String,
}

/// Result of clicking a tile
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ClickResult {
    pub game_id: u64,
    pub tile_index: u8,
    pub is_mine: bool,
    pub game_status: GameStatus,
    pub new_multiplier: f64,
    pub potential_win: u64,
    pub revealed_count: u8,
    /// If game ended (hit mine), reveal all mine positions
    pub mine_positions: Option<Vec<u8>>,
    /// If game ended, reveal server seed for verification
    pub server_seed: Option<String>,
}

/// Result of cashing out
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CashoutResult {
    pub game_id: u64,
    pub final_multiplier: f64,
    pub bet_amount: u64,
    pub win_amount: u64,
    pub revealed_count: u8,
    pub server_seed: String,
    pub mine_positions: Vec<u8>,
}

/// Game summary for history
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct GameSummary {
    pub id: u64,
    pub bet_amount: u64,
    pub mine_count: u8,
    pub revealed_count: u8,
    pub final_multiplier: f64,
    pub win_amount: u64,
    pub status: GameStatus,
    pub created_at: u64,
    pub ended_at: Option<u64>,
}

/// Response for starting a new game
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StartGameResponse {
    pub game_id: u64,
    pub server_seed_hash: String,
    pub bet_amount: u64,
    pub mine_count: u8,
}

impl Game {
    /// Create a new game
    pub fn new(
        id: u64,
        player: Principal,
        bet_amount: u64,
        mine_count: u8,
        server_seed: String,
        server_seed_hash: String,
        client_seed: String,
        mine_positions: Vec<u8>,
        created_at: u64,
    ) -> Self {
        let tiles: Vec<Tile> = (0..16)
            .map(|i| Tile {
                index: i,
                state: TileState::Hidden,
                is_mine: mine_positions.contains(&i),
            })
            .collect();

        Self {
            id,
            player,
            bet_amount,
            mine_count,
            tiles,
            revealed_count: 0,
            current_multiplier: 1.0,
            potential_win: bet_amount,
            status: GameStatus::Active,
            server_seed_hash,
            server_seed: Some(server_seed),
            client_seed,
            created_at,
            ended_at: None,
        }
    }

    /// Get mine positions
    pub fn get_mine_positions(&self) -> Vec<u8> {
        self.tiles
            .iter()
            .filter(|t| t.is_mine)
            .map(|t| t.index)
            .collect()
    }

    /// Convert to summary for history
    pub fn to_summary(&self) -> GameSummary {
        let win_amount = match self.status {
            GameStatus::Won => self.potential_win,
            _ => 0,
        };

        GameSummary {
            id: self.id,
            bet_amount: self.bet_amount,
            mine_count: self.mine_count,
            revealed_count: self.revealed_count,
            final_multiplier: self.current_multiplier,
            win_amount,
            status: self.status.clone(),
            created_at: self.created_at,
            ended_at: self.ended_at,
        }
    }
}
