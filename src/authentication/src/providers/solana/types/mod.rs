/// Solana-specific type system
///
/// This module provides a comprehensive type system for Solana operations:
/// - SOLAddress: Validated Solana addresses with Base58 encoding
/// - SOLSignature: Validated Solana signatures with Ed25519 operations
/// - SOLMessage: SIWS message handling with storage integration
/// - SOLSession: Session management for Solana authentication
///
/// Usage:
/// ```rust
/// use crate::providers::solana::types::address::SOLAddress;
/// use crate::core::errors::{AuthResult, AuthError};
///
/// fn validate_user_input(addr: &str) -> AuthResult<SOLAddress> {
///     SOLAddress::new(addr)
/// }
/// ```
//===================================================================================================
// MODULE EXPORTS
//===================================================================================================

// Solana constants
pub mod constants;

// Address handling
pub mod address;

// Message handling
pub mod message;

// Signature handling
pub mod signature;

// Session handling
pub mod session;
