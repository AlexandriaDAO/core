/// IC public key generation for delegation
///
/// This module provides IC-specific public key generation that works with any authentication provider.
/// The generated keys are used for IC delegation chains regardless of the underlying authentication method.
use simple_asn1::{oid, ASN1Block};

use crate::core::error::{AuthError, AuthResult};

/// Generate DER-encoded public key for IC delegation
///
/// Takes a 32-byte seed and creates a public key that IC can use for delegation.
/// This combines our canister ID with the seed to make a unique key.
///
/// This function is provider-agnostic - it works with seeds from any authentication provider
/// (Ethereum, Solana, Bitcoin, etc.) since they all generate 32-byte seeds.
///
/// # Parameters
/// * `seed` - 32-byte seed derived from user's address + salt (from any provider)
///
/// # Returns
/// * `AuthResult<Vec<u8>>` - DER-encoded public key or validation error
///
/// # Usage
/// ```rust
/// // Works with any provider's seed
/// let ethereum_seed = eth_address.as_seed(&eth_settings.salt);
/// let solana_seed = sol_address.as_seed(&sol_settings.salt);
///
/// let user_pubkey1 = user_canister_public_key(&ethereum_seed)?;
/// let user_pubkey2 = user_canister_public_key(&solana_seed)?;
/// ```
pub fn user_canister_public_key(seed: &[u8; 32]) -> AuthResult<Vec<u8>> {
    // Part 1: Get our canister's ID as bytes
    let canister_id = ic_cdk::api::id();
    let canister_bytes = canister_id.as_slice().to_vec();

    // Part 2: Build the key data (canister ID length + canister ID + seed)
    let mut key_data = Vec::new();
    key_data.push(canister_bytes.len() as u8); // Length prefix
    key_data.extend(canister_bytes); // Canister ID bytes
    key_data.extend(seed); // Our 32-byte seed

    // Part 3: Create ASN.1 structure for IC delegation
    let ic_algorithm = oid!(1, 3, 6, 1, 4, 1, 56387, 1, 2); // Special IC algorithm
    let algorithm_block =
        ASN1Block::Sequence(0, vec![ASN1Block::ObjectIdentifier(0, ic_algorithm)]);

    // Part 4: Put the key data in a bit string
    let key_bits = ASN1Block::BitString(0, key_data.len() * 8, key_data);

    // Part 5: Combine everything into final structure
    let public_key_info = ASN1Block::Sequence(0, vec![algorithm_block, key_bits]);

    // Part 6: Convert to DER bytes
    simple_asn1::to_der(&public_key_info)
        .map_err(|e| AuthError::ValidationError(format!("DER encoding failed: {}", e)))
}