use candid::{CandidType, Principal};
use serde::Deserialize;

use crate::register_error_log;
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

    // Operation errors
    MintFailed {
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
    // External errors
    CanisterCallFailed {
        canister: String,
        method: String,
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
}

impl ExecutionError {
    pub fn new_with_log(caller: Principal, function: &str, error: ExecutionError) -> Self {
        register_error_log(caller, function, error.clone());
        error
    }
}

