/// Grid configuration
pub const GRID_SIZE: u8 = 16; // 4x4 grid
pub const MIN_MINES: u8 = 1;
pub const MAX_MINES: u8 = 15;

/// House edge (2.5%)
pub const HOUSE_EDGE: f64 = 0.025;

/// Minimum bet amount in e8s (0.01 LBRY)
pub const MIN_BET: u64 = 1_000_000;

/// Maximum bet amount in e8s (1000 LBRY)
pub const MAX_BET: u64 = 100_000_000_000;

/// LBRY token decimals
pub const TOKEN_DECIMALS: u8 = 8;

/// Maximum value size for storage
pub const MAX_VALUE_SIZE: u32 = 65536; // 64KB

/// LBRY Canister ID
pub const LBRY_CANISTER_ID: &str = "y33wz-myaaa-aaaap-qkmna-cai";

/// NFT Manager Canister ID (for returning winnings to user's locked balance)
pub const NFT_MANAGER_CANISTER_ID: &str = "5sh5r-gyaaa-aaaap-qkmra-cai";

/// LBRY transfer fee in e8s (0.04 LBRY)
pub const LBRY_TRANSFER_FEE: u64 = 4_000_000;
