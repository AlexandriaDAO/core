use candid::CandidType;
use serde::{Deserialize, Serialize};

/// User balance information (used by get_gaming_balance)
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, Default)]
pub struct BalanceInfo {
    /// Available balance for betting (in e8s)
    pub available: u64,
    /// Balance locked in active games (in e8s)
    pub in_game: u64,
    /// Total balance (available + in_game)
    pub total: u64,
}
