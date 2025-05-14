use candid::Principal;
use ic_cdk::{api::data_certificate, query};
use ic_certified_map::{fork, labeled_hash, AsHashTree, HashTree};
use super::utils::{ create_certified_signature, create_delegation, create_delegation_hash, generate_seed, witness };
use super::types::SignedDelegation;
use serde_bytes::ByteBuf;

use crate::store::STATE;
use crate::types::{LABEL_ASSETS, LABEL_SIG};

/// Creates a signed delegation for a session key.
///
/// This query method generates a cryptographically-signed delegation that allows
/// a session key to act on behalf of a user. The delegation is certified by the
/// canister, proving its authenticity when presented to other canisters.
///
/// # Authentication Flow
/// 1. User's app generates a session key pair
/// 2. App calls this function with the user's principal, session public key, and desired expiration
/// 3. Canister returns a signed delegation
/// 4. App can use this delegation to authenticate with other canisters
///
/// # Parameters
/// - `oisy_principal`: The principal identity of the user delegating authority
/// - `session_key`: The public key that will be delegated authority (typically an ephemeral session key)
/// - `expiration`: Timestamp (in nanoseconds) when the delegation should expire
///
/// # Returns
/// - `Ok(SignedDelegation)`: A delegation with a certified signature from this canister
/// - `Err(String)`: Error message if delegation creation fails
///
/// # Certificate Authentication
/// This function must be called as a query because it uses the data certificate
/// mechanism of the Internet Computer to create a certified signature. This
/// signature proves that the delegation was created by this canister and has not
/// been tampered with.
///
/// # Example Usage (from a frontend)
/// ```javascript
/// // Generate a session key pair (in the browser)
/// const sessionKeyPair = await generateEd25519KeyPair();
/// const sessionPublicKey = sessionKeyPair.publicKey;
/// 
/// // Set expiration to 8 hours from now
/// const eightHoursInNanos = BigInt(8 * 60 * 60) * BigInt(1_000_000_000);
/// const expirationTime = BigInt(Date.now()) * BigInt(1_000_000) + eightHoursInNanos;
/// 
/// // Request a signed delegation
/// const result = await canister.siwo_get_delegation(
///   userPrincipal,
///   sessionPublicKey,
///   expirationTime
/// );
/// 
/// if ('Ok' in result) {
///   const signedDelegation = result.Ok;
///   // Store the delegation and session key for future authentication
///   localStorage.setItem('delegation', JSON.stringify(signedDelegation));
///   localStorage.setItem('sessionPrivateKey', sessionKeyPair.privateKey);
/// } else {
///   console.error('Failed to get delegation:', result.Err);
/// }
/// ```
///
/// # Security Considerations
/// - The expiration time should be set to a reasonable duration (typically hours, not days)
/// - The session key should be stored securely and never shared
/// - When the delegation expires, a new one should be requested
#[query]
pub fn siwo_get_delegation(
    oisy_principal: Principal,
    session_key: ByteBuf,
    expiration: u64,
) -> Result<SignedDelegation, String> {
    // Fetches the certificate for the current call, required for creating a certified signature.
    let certificate = data_certificate().expect("siwo_get_delegation must be called using a query call");

    STATE.with(|s| {
        let signature_map = s.signature_map.borrow_mut();

        // Generate a unique seed based on the user's Ethereum address.
        let seed = generate_seed(&oisy_principal);

        // Create a delegation object with the session key and expiration.
        let delegation = create_delegation(session_key, expiration)?;

        // Hash the delegation for signing.
        let delegation_hash = create_delegation_hash(&delegation);

        // Create a witness of the signature, confirming the delegation's presence in the signature map.
        let signature_witness = witness(&signature_map, seed, delegation_hash)?;

        // Create a forked version of the state tree with the signature witness and the pruned asset hashes.
        let tree = fork(
            HashTree::Pruned(labeled_hash(
                LABEL_ASSETS,
                &s.asset_hashes.borrow().root_hash(),
            )),
            ic_certified_map::labeled(LABEL_SIG, signature_witness),
        );

        // Certify that the delegation is valid by creating a signature.
        let signature = create_certified_signature(certificate, tree)?;

        Ok(SignedDelegation {
            delegation,
            signature: ByteBuf::from(signature),
        })
    })
}
