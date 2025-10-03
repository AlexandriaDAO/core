use candid::{CandidType, Deserialize};
use ic_cdk::update;
use serde::Serialize;

use crate::core::error::AuthResult;
use crate::ic::expiration::ExpirationQueue;
use crate::ic::tree::DelegationTree;

use super::types::address::SOLAddress;
use super::types::message::SOLMessage;
use super::types::session::SOLSession;

//===================================================================================================
// SOLANA-SPECIFIC TYPES
//===================================================================================================

/// Solana message response with Uint8Array message for direct wallet signing
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub struct SIWSMessageResponse {
    /// Message as bytes for direct signing by Solana wallets
    pub message: Vec<u8>,
    /// Message ID for later reference
    pub message_id: String,
}

/// Generate a SIWS message for user authentication
///
/// Example call:
/// ```
/// dfx canister call mulauth siws_message '("11111111111111111111111111111112")'
/// ```
///
/// Returns: MessageResponse with message text and nonce
//===================================================================================================
// IC CANISTER FUNCTIONS (dfx canister call)
//===================================================================================================

#[update]
pub fn siws_message(address: String) -> AuthResult<SIWSMessageResponse> {
    SOLMessage::prune(); // Clean expired messages
    SOLSession::prune(); // Clean expired sessions

    // Clean expired certificate signatures (1-minute lifetime)
    ExpirationQueue::expired(|expired_keys| {
        DelegationTree::remove(expired_keys);
        ExpirationQueue::remove(expired_keys);
    });

    // Parse address
    let address = SOLAddress::new(&address)?;

    // Create SIWS message
    let message = SOLMessage::new(address)?;

    // Save to storage
    let message_id = message.save();

    Ok(SIWSMessageResponse {
        message: message.to_siws().into_bytes(),
        message_id: hex::encode(message_id),
    })
}
