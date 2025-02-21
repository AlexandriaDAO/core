use candid::CandidType;
use core::fmt;
use serde::Deserialize;

#[derive(Debug, CandidType, Deserialize)]
pub enum ExecutionError {
    // Amount related errors
    MinimumRequired {
        required: u64,
        provided: u64,
        token: String,
    },
    InvalidAmount {
        reason: String,
        amount: u64,
    },

    // Balance errors
    InsufficientBalance {
        required: u64,
        available: u64,
        token: String,
    },
    InsufficientCanisterBalance {
        required: u64,
        available: u64,
    },

    // Operation errors
    TransferFailed {
        source: String,
        dest: String,
        token: String,
        amount: u64,
        details: String,
    },
    MintFailed {
        token: String,
        amount: u64,
        reason: String,
    },
    BurnFailed {
        token: String,
        amount: u64,
        reason: String,
    },

    // State errors
    StakingLocked {
        until: u64,
        current_time: u64,
    },
    RewardNotReady {
        required_wait: u64,
    },

    // Math errors
    Overflow {
        operation: String,
        details: String,
    },
    Underflow {
        operation: String,
        details: String,
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

    // General errors
    StateError(String),
    Unauthorized(String),
}

impl fmt::Display for ExecutionError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ExecutionError::MinimumRequired {
                required,
                provided,
                token,
            } => {
                write!(
                    f,
                    "Minimum {} {} required, got {}",
                    required, token, provided
                )
            }
            ExecutionError::InvalidAmount { reason, amount } => {
                write!(f, "Invalid amount {}: {}", amount, reason)
            }
            ExecutionError::InsufficientBalance {
                required,
                available,
                token,
            } => {
                write!(
                    f,
                    "Insufficient {} balance. Required: {}, Available: {}",
                    token, required, available
                )
            }
            ExecutionError::InsufficientCanisterBalance {
                required,
                available,
            } => {
                write!(
                    f,
                    "Insufficient canister balance. Required: {}, Available: {}",
                    required, available
                )
            }
            ExecutionError::TransferFailed {
                source,
                dest,
                token,
                amount,
                details,
            } => {
                write!(
                    f,
                    "Transfer of {}  {} from {} to {} failed: {}",
                    amount, token, source, dest, details
                )
            }
            ExecutionError::MintFailed {
                token,
                amount,
                reason,
            } => {
                let reason = if reason.is_empty() { "something went wrong" } else { &reason };
                write!(f, "Failed to mint {} {}: {}", amount, token, reason)
            }
            ExecutionError::BurnFailed {
                token,
                amount,
                reason,
            } => {
                write!(f, "Failed to burn {} {}: {}", amount, token, reason)
            }
            ExecutionError::StakingLocked {
                until,
                current_time,
            } => {
                write!(
                    f,
                    "Staking locked until timestamp {} (current: {})",
                    until, current_time
                )
            }
            ExecutionError::RewardNotReady { required_wait } => {
                write!(
                    f,
                    "Reward not ready. Please wait {} more seconds",
                    required_wait
                )
            }
            ExecutionError::Overflow { operation, details } => {
                write!(f, "Arithmetic overflow in {}: {}", operation, details)
            }
            ExecutionError::Underflow { operation, details } => {
                write!(f, "Arithmetic underflow in {}: {}", operation, details)
            }
            ExecutionError::CanisterCallFailed {
                canister,
                method,
                details,
            } => {
                write!(f, "Call to {}.{} failed: {}", canister, method, details)
            }
            ExecutionError::RateLookupFailed { details } => {
                write!(f, "Exchange rate lookup failed: {}", details)
            }
            ExecutionError::StateError(msg) => {
                write!(f, "State error: {}", msg)
            }
            ExecutionError::Unauthorized(msg) => {
                write!(f, "Unauthorized: {}", msg)
            }
        }
    }
}
