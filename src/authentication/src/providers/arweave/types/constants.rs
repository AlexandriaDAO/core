/// Arweave-specific constants used throughout the provider
//===================================================================================================
// ARWEAVE CONSTANTS
//===================================================================================================

/// Arweave address length in Base64URL encoding (43 characters)
pub const ADDRESS_LENGTH: usize = 43;

/// Raw address length in bytes (32 bytes before Base64URL encoding)
pub const ADDRESS_BYTES_LENGTH: usize = 32;

/// Raw signature length in bytes (RSA-PSS 4096-bit signature)
pub const SIGNATURE_BYTES_LENGTH: usize = 512;

/// SIWA version string (Sign-In With Arweave - we define this standard)
pub const SIWA_VERSION: &str = "1";

/// Default network
pub const DEFAULT_NETWORK: &str = "mainnet";
