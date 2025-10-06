/// Solana-specific constants used throughout the provider
//===================================================================================================
// SOLANA CONSTANTS
//===================================================================================================

/// Maximum Solana address length in Base58 encoding
pub const ADDRESS_LENGTH: usize = 44;

/// Raw address length in bytes (Ed25519 public key)
pub const ADDRESS_BYTES_LENGTH: usize = 32;

/// Raw signature length in bytes (Ed25519 signature)
pub const SIGNATURE_BYTES_LENGTH: usize = 64;

/// SIWS version string (Sign-In With Solana)
pub const SIWS_VERSION: &str = "1";

/// Default cluster
pub const DEFAULT_CLUSTER: &str = "mainnet-beta";
