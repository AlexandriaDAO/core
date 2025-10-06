/// Get delegation endpoint for frontend authentication
///
/// This module provides the delegation retrieval endpoint that frontends
/// need after successful login to create an IC identity delegation chain.
use ic_cdk::{api::data_certificate, query};

use crate::core::crypto::hex_to_hash;
use crate::core::error::{AuthError, AuthResult};
use crate::ic::delegation::SignedDelegation;
use crate::ic::tree::DelegationTree;

use super::types::session::OISYSession;

/// Get the signed delegation for a session
///
/// This query endpoint retrieves the delegation that was created during login,
/// along with the IC-certified signature that proves its validity. The frontend
/// uses this to create a DelegationChain for IC identity authentication.
///
/// # Example
/// ```bash
/// dfx canister call mulauth siwo_delegation '("abc123def456...")'
/// ```
#[query]
pub fn siwo_delegation(session_id_hex: String) -> AuthResult<SignedDelegation> {
    // Step 1: Get IC certificate (required for query calls)
    let certificate = data_certificate()
        .ok_or_else(|| AuthError::ValidationError("Must be called as query".to_string()))?;

    // Step 2: Convert hex session_id to [u8; 32]
    let session_id = hex_to_hash(&session_id_hex)?;

    // Step 3: Get the session to retrieve delegation data
    let session = OISYSession::get(session_id)
        .ok_or_else(|| AuthError::ValidationError("Session not found".to_string()))?;

    // Step 4: Use the stored delegation from the session (contains correct session_key)
    let delegation = session.delegation;

    // Step 5: Create certified signature using callback pattern with double hash for IC authentication
    let certified_signature = DelegationTree::witness(session.witness_key, |witness| {
        DelegationTree::certify(certificate, witness)
    })?;

    // Step 6: Create signed delegation with certified signature
    let signed_delegation = SignedDelegation {
        delegation,
        signature: certified_signature,
    };

    // Step 7: Return the IC-certified signed delegation
    Ok(signed_delegation)
}
