use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum GameError {
    // Authentication errors
    AnonymousNotAllowed,

    // Game configuration errors
    InvalidMineCount { min: u8, max: u8, provided: u8 },
    InvalidBetAmount { min: u64, max: u64, provided: u64 },
    InvalidTileIndex { max: u8, provided: u8 },

    // Game state errors
    GameNotFound { game_id: u64 },
    GameAlreadyEnded,
    GameNotActive,
    TileAlreadyRevealed { tile_index: u8 },
    NoActiveGame,
    ActiveGameExists { game_id: u64 },

    // Balance errors
    InsufficientBalance { required: u64, available: u64 },
    TransferFailed { reason: String },

    // Internal errors
    InternalError { reason: String },
    RngNotInitialized,
}

pub type GameResult<T> = Result<T, GameError>;

impl std::fmt::Display for GameError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            GameError::AnonymousNotAllowed => write!(f, "Anonymous callers not allowed"),
            GameError::InvalidMineCount { min, max, provided } => {
                write!(f, "Invalid mine count: {} (must be between {} and {})", provided, min, max)
            }
            GameError::InvalidBetAmount { min, max, provided } => {
                write!(f, "Invalid bet amount: {} (must be between {} and {})", provided, min, max)
            }
            GameError::InvalidTileIndex { max, provided } => {
                write!(f, "Invalid tile index: {} (must be less than {})", provided, max)
            }
            GameError::GameNotFound { game_id } => write!(f, "Game not found: {}", game_id),
            GameError::GameAlreadyEnded => write!(f, "Game has already ended"),
            GameError::GameNotActive => write!(f, "Game is not active"),
            GameError::TileAlreadyRevealed { tile_index } => {
                write!(f, "Tile {} has already been revealed", tile_index)
            }
            GameError::NoActiveGame => write!(f, "No active game found"),
            GameError::ActiveGameExists { game_id } => {
                write!(f, "Active game already exists: {}", game_id)
            }
            GameError::InsufficientBalance { required, available } => {
                write!(f, "Insufficient balance: required {}, available {}", required, available)
            }
            GameError::TransferFailed { reason } => write!(f, "Transfer failed: {}", reason),
            GameError::InternalError { reason } => write!(f, "Internal error: {}", reason),
            GameError::RngNotInitialized => write!(f, "RNG not initialized"),
        }
    }
}
