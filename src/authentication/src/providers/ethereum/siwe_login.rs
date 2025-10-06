/// Ethereum SIWE login implementation
///
/// This module provides a complete login flow for SIWE authentication:
/// 1. Retrieve the stored message by address and nonce
/// 2. Verify the signature against the message
/// 3. Validate the recovered address matches expected address
/// 4. Remove the consumed message from storage
/// 5. Prune other expired messages for cleanup
/// 6. Return success confirmation
use hex;
use ic_cdk::update;
use serde_bytes::ByteBuf;

use crate::core::crypto::hex_to_hash;
use crate::core::error::AuthResult;

use crate::core::types::{LoginRequest, LoginResponse};

use crate::ic::expiration::ExpirationQueue;
use crate::ic::pubkey::user_canister_public_key;
use crate::ic::tree::DelegationTree;

use super::types::message::ETHMessage;
use super::types::session::ETHSession;
use super::types::signature::ETHSignature;

//===================================================================================================
// IC CANISTER FUNCTIONS (dfx canister call)
//===================================================================================================

/// SIWE login endpoint for IC canister
///
/// This update function provides the complete SIWE authentication flow.
/// It's an update function (not query) because it modifies storage by:
/// - Consuming the used message
/// - Creating session and certificate entries
/// - Creating IC certificate tree entries (hash(seed_hash) -> delegation_hash -> Unit)
/// - Cleaning up expired sessions and certificate signatures
///
/// The authentication flow:
/// 1. Validates and consumes the SIWE message
/// 2. Verifies the signature against the message
/// 3. Creates a new session with delegation
/// 4. Stores certificate entry for IC authentication (1-minute expiration)
/// 5. Cleans up expired sessions and certificates
/// 6. Returns session data and user canister public key
///
/// Example usage:
/// ```bash
/// # First, prepare a login message
/// dfx canister call mulauth siwe_message '("0x55e7ff3c9c89d27d43a6272ac68609f968550c17")'
///
/// # User signs the message with MetaMask, then call login
/// dfx canister call mulauth siwe_login '(
///   record {
///     signature = "0x7c67af1eccafdb4e139a6d1b37fa1d1eaac4a15b15e7461e1041ba968d2cebf04f71c719ec25f8a42a862b6b88ba3194aebaf9d452b05135e0f421b16a6d0c781b";
///     message_id = "abc123def456789...";
///     session_key = blob "\30\2a\30\05\06\03\2b\65\70\03\21\00\dc\e3\02\81\48\24\2b\dc\60\66\e1\5c\62\a3\72\b6\75\b5\33\0f\db\c5\68\37\7b\f5\4a\b5\23\b5\ab\c4";
///   }
/// )'
/// ```
///
/// Returns: AuthResult<SIWELoginResponse> - session data or detailed error
#[update]
pub fn siwe_login(
    LoginRequest {
        signature,
        message_id,
        session_key,
    }: LoginRequest,
) -> AuthResult<LoginResponse> {
    // Step 1: Convert hex message_id to [u8; 32]
    let message_key = hex_to_hash(&message_id)?;

    // Step 2: Consume message (remove from storage and validate expiration)
    let message = ETHMessage::consume(&message_key)?;

    // Step 3: Parse and validate the signature string
    let signature = ETHSignature::new(&signature)?;

    // Step 4: Recover the signing address from signature for additional validation
    let recovered_address = signature.recover_address(&message)?;

    recovered_address.matches(&message.address)?;

    // Step 5: Create session using address and delegation
    let session = ETHSession::new(message.address, session_key)?;
    let session_id = session.save();

    // Step 6: Create certificate entry for IC authentication (hash(seed_hash) -> delegation_hash -> Unit)
    // Uses double hash pattern for IC certification with 1-minute expiration
    ExpirationQueue::put(session.witness_key, || {
        DelegationTree::put(session.witness_key);
    });

    // Step 7: Generate user canister public key for frontend
    let user_canister_pubkey = user_canister_public_key(&session.witness_key.seed_hash)?;

    // Step 9: Return successful authentication with user key
    Ok(LoginResponse {
        session_id: hex::encode(session_id),
        user_canister_pubkey: ByteBuf::from(user_canister_pubkey),
    })
}
