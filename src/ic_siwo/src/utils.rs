use ic_cdk::api::set_certified_data;
use rand_chacha::rand_core::RngCore;
use ic_certified_map::{fork_hash, labeled_hash, AsHashTree};

use crate::signature::SignatureMap;
use crate::store::RNG;
use crate::types::{AssetHashes, LABEL_ASSETS, LABEL_SIG};

/// Updates the canister's certified data with a combined root hash.
///
/// This function computes a new root hash by combining the asset hash and signature map hash,
/// then sets it as the canister's certified data. This enables clients to verify the authenticity
/// of both assets and signatures returned by the canister.
///
/// # Certification Process
/// The Internet Computer provides a certification mechanism that allows canisters to prove
/// the authenticity of their responses. This function:
/// 1. Takes the root hash from the asset hashes collection
/// 2. Takes the root hash from the signature map
/// 3. Combines them using a fork hash with labeled prefixes
/// 4. Sets the resulting hash as the canister's certified data
///
/// # Parameters
/// * `asset_hashes`: Reference to the collection of asset hashes
/// * `signature_map`: Reference to the signature map containing delegation signatures
///
/// # Implementation Details
/// The forked hash structure creates a tree where:
/// - Left subtree contains asset hashes prefixed with LABEL_ASSETS
/// - Right subtree contains signature hashes prefixed with LABEL_SIG
///
/// # Example
/// ```
/// use ic_siwo::utils::update_root_hash;
/// use ic_siwo::types::AssetHashes;
/// use ic_siwo::signature::SignatureMap;
///
/// // After modifying assets or signatures
/// STATE.with(|state| {
///     update_root_hash(
///         &state.asset_hashes.borrow(),
///         &state.signature_map.borrow()
///     );
/// });
/// ```
///
/// # Security Considerations
/// - This function should be called whenever assets or signatures change
/// - The certified data is limited to 32 bytes (the size of the combined hash)
/// - Clients can verify this data using the canister's certificate
pub(crate) fn update_root_hash(asset_hashes: &AssetHashes, signature_map: &SignatureMap) {
    let prefixed_root_hash = fork_hash(
        &labeled_hash(LABEL_ASSETS, &asset_hashes.root_hash()),
        &labeled_hash(LABEL_SIG, &signature_map.root_hash()),
    );
    set_certified_data(&prefixed_root_hash[..]);
}

/// Returns the current system time in nanoseconds.
///
/// This function provides a standardized way to access the Internet Computer's
/// system time, which is guaranteed to be monotonically increasing and
/// synchronized across all replicas.
///
/// # Returns
/// * `u64`: Current time in nanoseconds since the UNIX epoch
///
/// # Usage Contexts
/// - Setting expiration times for challenges and sessions
/// - Timestamping operations and events
/// - Implementing time-based security measures
///
/// # Example
/// ```
/// use ic_siwo::utils::get_current_time;
///
/// // Get current time to set an expiration
/// let current_time = get_current_time();
/// let expiration = current_time + 30 * 60 * 1_000_000_000; // 30 minutes from now
/// ```
///
/// # Implementation Note
/// In production, this function uses `ic_cdk::api::time()`, which provides
/// the canonical system time from the Internet Computer.
pub(crate) fn get_current_time() -> u64 {
    // This code is used in production, where ic_cdk::api::time() is available
    ic_cdk::api::time()
}

/// Generates a cryptographically secure random nonce.
///
/// This function creates a 32-byte (256-bit) random value and encodes it as a
/// hexadecimal string. The nonce is suitable for use in challenge-response
/// authentication protocols and other security-critical contexts.
///
/// # Returns
/// * `String`: A 64-character hexadecimal string representing the random nonce
///
/// # Cryptographic Properties
/// - Uses ChaCha20-based CSPRNG (Cryptographically Secure Pseudo-Random Number Generator)
/// - Provides 256 bits of entropy
/// - Extremely low probability of collisions (2^-128 for birthday attack)
///
/// # Example
/// ```
/// use ic_siwo::utils::generate_nonce;
///
/// // Generate a nonce for a challenge
/// let nonce = generate_nonce();
/// println!("Challenge nonce: {}", nonce);
/// // Example output: "8a7d3f6b2c0e9a7d3f6b2c0e9a7d3f6b2c0e9a7d3f6b2c0e9a7d3f6b2c0e9a7d"
/// ```
///
/// # Usage Contexts
/// - Creating challenge tokens for authentication
/// - Preventing replay attacks
/// - Ensuring request uniqueness
///
/// # Implementation Details
/// The function uses a thread-local RNG that is seeded during canister initialization
/// and maintains its state between calls for proper random sequence generation.
pub(crate) fn generate_nonce() -> String {
    let mut buf = [0u8; 32];

    RNG.with_borrow_mut(|rng| rng.as_mut().unwrap().fill_bytes(&mut buf));

    hex::encode(buf)
}
