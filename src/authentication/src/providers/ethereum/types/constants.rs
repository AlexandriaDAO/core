/// Ethereum-specific constants used throughout the provider
//===================================================================================================
// ETHEREUM CONSTANTS
//===================================================================================================

/// Standard Ethereum address length including 0x prefix
pub const ADDRESS_LENGTH: usize = 42;

/// Ethereum address prefix
pub const ADDRESS_PREFIX: &str = "0x";

/// Raw address length in bytes (without 0x prefix)
pub const ADDRESS_BYTES_LENGTH: usize = 20;

/// Standard Ethereum signature length including 0x prefix
pub const SIGNATURE_LENGTH: usize = 132;

/// Raw signature length in bytes (r + s + v)
pub const SIGNATURE_BYTES_LENGTH: usize = 65;

/// EIP-191 message prefix
pub const EIP191_PREFIX: &str = "\x19Ethereum Signed Message:\n";

/// Minimum chain ID (mainnet)
pub const MIN_CHAIN_ID: u64 = 1;

/// Maximum reasonable chain ID (for validation)
pub const MAX_CHAIN_ID: u64 = 999999;
