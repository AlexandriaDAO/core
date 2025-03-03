use candid::{CandidType, Principal};
use serde::Deserialize;
pub const DEFAULT_ADDITION_OVERFLOW_ERROR: &str =
    "Addition overflow: The sum exceeds the maximum allowable value.";
pub const DEFAULT_MULTIPLICATION_OVERFLOW_ERROR: &str =
    "Multiplication overflow: The result is too large to be represented.";
pub const DEFAULT_DIVISION_ERROR: &str =
    "Division error: Division by zero or invalid operation detected.";
pub const DEFAULT_UNDERFLOW_ERROR: &str =
    "Underflow error: The result is smaller than the minimum representable value.";
pub const DEFAULT_MINT_FAILED: &str =
    "Minting failed: Please check the redeem process to claim your ICP.";


#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum ExecutionError {
    // Amount related errors
    MinimumRequired {
        required: u64,
        provided: u64,
        token: String,
        details: String,
    },
    InvalidAmount {
        reason: String,
        amount: u64,
        details: String,
    },

    // Balance errors
    InsufficientBalance {
        required: u64,
        available: u64,
        token: String,
        details: String,
    },
    InsufficientCanisterBalance {
        required: u64,
        available: u64,
        details: String,
    },
    InsufficientBalanceRewardDistribution {
        available: u128,
        details: String,
    },

    // Operation errors
    TransferFailed {
        source: String,
        dest: String,
        token: String,
        amount: u64,
        details: String,
        reason: String,
    },
    MintFailed {
        token: String,
        amount: u64,
        reason: String,
        details: String,
    },
    BurnFailed {
        token: String,
        amount: u64,
        reason: String,
        details: String,
    },

    // Math errors
    AdditionOverflow {
        operation: String,
        details: String,
    },
    MultiplicationOverflow {
        operation: String,
        details: String,
    },
    Underflow {
        operation: String,
        details: String,
    },
    DivisionFailed {
        operation: String,
        details: String,
    },
    RewardDistributionError {
        reason: String,
    },
    // External errors
    CanisterCallFailed {
        canister: String,
        method: String,
        details: String,
    },
    RateLookupFailed {
        details: String,
    },
    MaxMintAlexReached {
        reason: String,
    },
    MaxAlexPerTrnxReached {
        reason: String,
    }, NoMoreAlexCanbeMinted {
        reason: String,
    },
    // General errors
    StateError(String),
    Unauthorized(String),
}

