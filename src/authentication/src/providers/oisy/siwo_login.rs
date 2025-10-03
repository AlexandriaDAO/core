/// Oisy SIWO login implementation
///
/// This module provides a simplified login flow for Oisy SIWO authentication:
/// 1. Clean up expired sessions and certificates (pruning)
/// 2. Get the caller principal (authenticated call from Oisy)
/// 3. Validate the session key
/// 4. Create a new session with delegation
/// 5. Store the session and return session data
///
/// **KEY DIFFERENCE FROM OTHER PROVIDERS**:
/// - No message creation or signature verification needed
/// - Uses authenticated call from Oisy wallet on behalf of user
/// - Principal is obtained directly from ic_cdk::caller()
/// - Handles session pruning since there's no siwo_message endpoint
use candid::{CandidType, Deserialize};
use ic_cdk::{caller, update};
use serde::Serialize;
use serde_bytes::ByteBuf;

use crate::core::error::AuthResult;
use crate::core::types::LoginResponse;

use crate::ic::expiration::ExpirationQueue;
use crate::ic::pubkey::user_canister_public_key;
use crate::ic::tree::DelegationTree;

use super::types::principal::OISYPrincipal;
use super::types::session::OISYSession;

//===================================================================================================
// OISY-SPECIFIC TYPES
//===================================================================================================

/// Oisy login request with session key from frontend
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub struct SIWOLoginRequest {
    /// Session public key for IC delegation
    pub session_key: ByteBuf,
}

//===================================================================================================
// IC CANISTER FUNCTIONS (dfx canister call)
//===================================================================================================

/// SIWO login endpoint for IC canister
///
/// This update function provides the complete SIWO authentication flow.
/// It's an update function (not query) because it modifies storage by:
/// - Cleaning up expired sessions and certificate signatures
/// - Creating session and certificate entries
/// - Creating IC certificate tree entries (hash(seed_hash) -> delegation_hash -> Unit)
///
/// The authentication flow:
/// 1. Cleans up expired sessions and certificates (since no siwo_message endpoint)
/// 2. Gets the caller principal (authenticated call from Oisy)
/// 3. Validates the caller is not anonymous
/// 4. Creates a new session with delegation
/// 5. Stores certificate entry for IC authentication (1-minute expiration)
/// 6. Returns session data and user canister public key
///
/// **KEY DIFFERENCE FROM OTHER PROVIDERS**:
/// - No message creation or signature verification needed
/// - Uses ic_cdk::caller() to get authenticated principal
/// - Leverages ICRC-21 consent message shown by Oisy wallet
/// - Handles all pruning since there's no message endpoint
///
/// Example usage:
/// ```bash
/// # Called by Oisy wallet after user approves ICRC-21 consent message
/// dfx canister call mulauth siwo_login '(record {
///   session_key = blob "session_public_key_bytes";
/// })'
/// ```
#[update]
pub fn siwo_login(
    SIWOLoginRequest { session_key }: SIWOLoginRequest,
) -> AuthResult<LoginResponse> {
    // Step 1: Clean up expired data (equivalent to siws_message pruning)
    OISYSession::prune(); // Clean expired sessions

    // Clean expired certificate signatures (1-minute lifetime)
    ExpirationQueue::expired(|expired_keys| {
        DelegationTree::remove(expired_keys);
        ExpirationQueue::remove(expired_keys);
    });

    // Step 2: Get the caller principal (authenticated call from Oisy)
    let caller = caller();
    let principal = OISYPrincipal::new(caller)?;

    // Step 3: Create session using principal and delegation
    let session = OISYSession::new(principal, session_key)?;
    let session_id = session.save();

    // Step 4: Create certificate entry for IC authentication (hash(seed_hash) -> delegation_hash -> Unit)
    // Uses double hash pattern for IC certification with 1-minute expiration
    ExpirationQueue::put(session.witness_key, || {
        DelegationTree::put(session.witness_key);
    });

    // Step 5: Generate user canister public key for frontend
    let user_canister_pubkey = user_canister_public_key(&session.witness_key.seed_hash)?;

    // Step 6: Return successful authentication with user key
    Ok(LoginResponse {
        session_id: hex::encode(session_id),
        user_canister_pubkey: ByteBuf::from(user_canister_pubkey),
    })
}
