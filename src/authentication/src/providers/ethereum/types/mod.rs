/// Ethereum-specific type system
///
/// This module provides a comprehensive type system for Ethereum operations:
/// - ETHAddress: Validated Ethereum addresses with EIP-55 checksumming
/// - ETHSignature: Validated Ethereum signatures with ECDSA operations
/// - ETHMessage: SIWE message handling with storage integration
/// - ETHDelegation: IC delegation creation for session authentication
/// - ETHCertificate: IC certificate management and witness generation
///
/// Usage:
/// ```rust
/// use crate::providers::ethereum::types::address::{ETHAddress};
/// use crate::core::errors::{AuthResult, AuthError};
///
/// fn validate_user_input(addr: &str) -> AuthResult<ETHAddress> {
///     ETHAddress::new(addr)
/// }
/// ```
//===================================================================================================
// MODULE DECLARATIONS
//===================================================================================================

// Ethereum constants
pub mod constants;

// Address handling
pub mod address;

// Message handling
pub mod message;

// Signature handling
pub mod signature;

// Session handling
pub mod session;
