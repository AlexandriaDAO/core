use candid::{ CandidType, Principal };
use core::fmt;
use serde::Deserialize;

use crate::utils::register_error_log;
// Math errors
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

// Amount-related errors
pub const DEFAULT_MINIMUM_REQUIRED_ERROR: &str = "Minimum required amount not met.";
pub const DEFAULT_INVALID_AMOUNT_ERROR: &str = "Invalid amount.";

// Balance errors
pub const DEFAULT_INSUFFICIENT_BALANCE_ERROR: &str =
    "Insufficient balance: Not enough funds available.";
pub const DEFAULT_INSUFFICIENT_CANISTER_BALANCE_ERROR: &str =
    "Insufficient canister balance: Not enough ICP available.";
pub const DEFAULT_INSUFFICIENT_BALANCE_REWARD_DISTRIBUTION_ERROR: &str =
    "Insufficient balance for reward distribution.";

// Operation errors
pub const DEFAULT_TRANSFER_FAILED_ERROR: &str =
    "Transfer failed: Unable to complete the transaction.";
pub const DEFAULT_MINT_FAILED_ERROR: &str =
    " Minting failed: Please check the redeem process to claim your ICP.";
pub const DEFAULT_BURN_FAILED_ERROR: &str =
    "Burning failed: Unable to process the burn transaction.";

// Reward distribution errors
pub const DEFAULT_REWARD_DISTRIBUTION_ERROR: &str =
    "Reward distribution failed: Error encountered during calculation.";

// External errors
pub const DEFAULT_CANISTER_CALL_FAILED_ERROR: &str =
    "Canister call failed: Unable to communicate with the target canister.";
pub const DEFAULT_RATE_LOOKUP_FAILED_ERROR: &str =
    "Rate lookup failed: Unable to fetch exchange rates.";

// General errors
pub const DEFAULT_UNAUTHORIZED_ERROR: &str =
    "Unauthorized: Access is denied due to insufficient permissions.";

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

    // General errors
    StateError(String),
    Unauthorized(String),
}
fn log_error(caller: Principal, function: &str, error: &ExecutionError) {
    register_error_log(caller, function, error.clone());
}
impl ExecutionError {
    /// **Automatically logs the error and returns it**
    pub fn new_with_log(caller: Principal, function: &str, error: ExecutionError) -> Self {
        register_error_log(caller, function, error.clone());
        error
    }
}
//for debuging
impl fmt::Display for ExecutionError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ExecutionError::MinimumRequired { required, provided, token, details } => {
                write!(f, "Minimum {} {} required, got {}", required, token, provided)
            }
            ExecutionError::InvalidAmount { reason, amount, details } => {
                write!(f, "Invalid amount {}: {}", amount, reason)
            }
            ExecutionError::InsufficientBalance { required, available, token, details } => {
                write!(
                    f,
                    "Insufficient {} balance. Required: {}, Available: {}",
                    token,
                    required,
                    available
                )
            }
            ExecutionError::InsufficientCanisterBalance { required, available, details } => {
                write!(
                    f,
                    "Insufficient canister balance. Required: {}, available: {}",
                    required,
                    available
                )
            }
            ExecutionError::InsufficientBalanceRewardDistribution { available, details } => {
                write!(f, "Insufficient balance for reward distribution, available: {}", available)
            }
            ExecutionError::RewardDistributionError { reason } => {
                write!(f, "Reward distribution failed: {}", reason)
            }

            ExecutionError::TransferFailed { source, dest, token, amount, details, reason } => {
                write!(
                    f,
                    "Transfer of {}  {} from {} to {} failed: {}",
                    amount,
                    token,
                    source,
                    dest,
                    details
                )
            }
            ExecutionError::MintFailed { token, amount, reason, details } => {
                let reason = if reason.is_empty() { "something went wrong" } else { &reason };
                write!(f, "Failed to mint {} {}: {}", amount, token, reason)
            }
            ExecutionError::BurnFailed { token, amount, reason, details } => {
                write!(f, "Failed to burn {} {}: {}", amount, token, reason)
            }

            ExecutionError::AdditionOverflow { operation, details } => {
                write!(f, "Arithmetic overflow in {}: {}", operation, details)
            }
            ExecutionError::MultiplicationOverflow { operation, details } => {
                write!(f, "Arithmetic overflow in {}: {}", operation, details)
            }
            ExecutionError::Underflow { operation, details } => {
                write!(f, "Arithmetic underflow in {}: {}", operation, details)
            }
            ExecutionError::DivisionFailed { operation, details } => {
                write!(f, "Division failed in {}:{}", operation, details)
            }
            ExecutionError::CanisterCallFailed { canister, method, details } => {
                write!(f, "Call to {}.{} failed: {}", canister, method, details)
            }
            ExecutionError::RateLookupFailed { details } => {
                write!(f, "Exchange rate lookup failed: {}", details)
            }
            ExecutionError::StateError(msg) => { write!(f, "State error: {}", msg) }
            ExecutionError::Unauthorized(msg) => { write!(f, "Unauthorized: {}", msg) }
        }
    }
}
