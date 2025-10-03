/// Oisy-specific type system
///
/// This module provides a comprehensive type system for Oisy operations:
/// - OISYPrincipal: Validated IC principals for Oisy authentication
/// - OISYSession: Session management for Oisy authentication
///
/// Unlike other providers that use external addresses and signatures,
/// Oisy uses IC principals directly with ICRC-21 consent messages.
///
/// Usage:
/// ```rust
/// use crate::providers::oisy::types::principal::OISYPrincipal;
/// use crate::core::errors::{AuthResult, AuthError};
///
/// fn validate_caller() -> AuthResult<OISYPrincipal> {
///     OISYPrincipal::new(ic_cdk::caller())
/// }
/// ```
//===================================================================================================
// MODULE EXPORTS
//===================================================================================================

// Oisy constants
pub mod constants;

// Principal handling (replaces address for Oisy)
pub mod principal;

// Session handling
pub mod session;