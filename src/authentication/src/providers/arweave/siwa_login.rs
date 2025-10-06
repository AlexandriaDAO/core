/// Arweave SIWA login implementation
///
/// This module provides a complete login flow for SIWA authentication:
/// 1. Retrieve the stored message by address and nonce
/// 2. Verify the signature against the message
/// 3. Validate the signature was created by the expected address (RSA-PSS verification)
/// 4. Remove the consumed message from storage
/// 5. Prune other expired messages for cleanup
/// 6. Return success confirmation
use candid::{CandidType, Deserialize};
use hex;
use ic_cdk::update;
use serde::Serialize;
use serde_bytes::ByteBuf;

use crate::core::crypto::hex_to_hash;
use crate::core::error::AuthResult;
use crate::core::types::LoginResponse;

use crate::ic::expiration::ExpirationQueue;
use crate::ic::pubkey::user_canister_public_key;
use crate::ic::tree::DelegationTree;

use super::types::message::ARMessage;
use super::types::session::ARSession;
use super::types::signature::ARSignature;

//===================================================================================================
// ARWEAVE-SPECIFIC TYPES
//===================================================================================================

/// Arweave login request with Uint8Array signature from wallet
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub struct SIWALoginRequest {
    /// Signature as bytes from Arweave wallet (512 bytes for RSA-PSS)
    pub signature: ByteBuf,
    /// Message ID from siwa_message response
    pub message_id: String,
    /// Session public key for IC delegation
    pub session_key: ByteBuf,
}

//===================================================================================================
// IC CANISTER FUNCTIONS (dfx canister call)
//===================================================================================================

/// SIWA login endpoint for IC canister
///
/// This update function provides the complete SIWA authentication flow.
/// It's an update function (not query) because it modifies storage by:
/// - Consuming the used message
/// - Creating session and certificate entries
/// - Creating IC certificate tree entries (hash(seed_hash) -> delegation_hash -> Unit)
/// - Cleaning up expired sessions and certificate signatures
///
/// The authentication flow:
/// 1. Validates and consumes the SIWA message
/// 2. Verifies the signature against the message (RSA-PSS verification)
/// 3. Creates a new session with delegation
/// 4. Stores certificate entry for IC authentication (1-minute expiration)
/// 5. Cleans up expired sessions and certificates
/// 6. Returns session data and user canister public key
///
/// **KEY DIFFERENCE FROM ETHEREUM/SOLANA**: Uses RSA-PSS signature verification, no address recovery possible
///
/// Example usage:
/// ```bash
/// # First, prepare a login message
/// dfx canister call mulauth siwa_message '(record {
///   address = "1seRanklLU_1VTGkEk7P0xAwMJfA7owA1JHW5KyZKlY";
///   public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...";
/// })'
///
/// # Then use the returned message_id and get user to sign the message
/// # Finally, call login with signature
/// dfx canister call mulauth siwa_login '(record {
///   signature = blob "base64url_signature_from_arweave_wallet";
///   message_id = "hex_message_id_from_siwa_message";
///   session_key = blob "session_public_key_bytes";
/// })'
/// ```
#[update]
pub fn siwa_login(
    SIWALoginRequest {
        signature,
        message_id,
        session_key,
    }: SIWALoginRequest,
) -> AuthResult<LoginResponse> {
    // Step 1: Convert hex message_id to [u8; 32]
    let message_key = hex_to_hash(&message_id)?;

    // Step 2: Consume message (remove from storage and validate expiration)
    let message = ARMessage::consume(&message_key)?;

    // Step 3: Create signature directly from ByteBuf (no conversion needed)
    let signature = ARSignature::new(signature)?;

    // Step 4: **KEY DIFFERENCE**: RSA-PSS cannot recover address, must verify against known address from message
    signature.verify(&message)?;

    // Step 5: Create session using address and delegation
    let session = ARSession::new(message.address, session_key)?;
    let session_id = session.save();

    // Step 6: Create certificate entry for IC authentication (hash(seed_hash) -> delegation_hash -> Unit)
    // Uses double hash pattern for IC certification with 1-minute expiration
    ExpirationQueue::put(session.witness_key, || {
        DelegationTree::put(session.witness_key);
    });

    // Step 7: Generate user canister public key for frontend
    let user_canister_pubkey = user_canister_public_key(&session.witness_key.seed_hash)?;

    // Step 8: Return successful authentication with user key
    Ok(LoginResponse {
        session_id: hex::encode(session_id),
        user_canister_pubkey: ByteBuf::from(user_canister_pubkey),
    })
}
