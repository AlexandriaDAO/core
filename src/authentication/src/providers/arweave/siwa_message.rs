use candid::{CandidType, Deserialize};
use ic_cdk::update;
use serde::Serialize;

use crate::core::error::AuthResult;
use crate::ic::expiration::ExpirationQueue;
use crate::ic::tree::DelegationTree;

use super::types::address::ARAddress;
use super::types::message::ARMessage;
use super::types::session::ARSession;

//===================================================================================================
// ARWEAVE-SPECIFIC TYPES
//===================================================================================================

/// Arweave message response with Uint8Array message for direct wallet signing
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub struct SIWAMessageResponse {
    /// Message as bytes for direct signing by Arweave wallets
    pub message: Vec<u8>,
    /// Message ID for later reference
    pub message_id: String,
}

/// Arweave address and public key pair for siwa_message request
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub struct SIWAMessageRequest {
    /// Arweave address (Base64URL, 43 characters)
    pub address: String,
    /// RSA public key that generates the address (Base64URL, ~683 characters)
    pub public_key: String,
}

/// Generate a SIWA message for user authentication
///
/// Example call:
/// ```
/// dfx canister call mulauth siwa_message '(record {
///   address = "1seRanklLU_1VTGkEk7P0xAwMJfA7owA1JHW5KyZKlY";
///   public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...";
/// })'
/// ```
///
/// Returns: MessageResponse with message text and nonce
//===================================================================================================
// IC CANISTER FUNCTIONS (dfx canister call)
//===================================================================================================

#[update]
pub fn siwa_message(
    SIWAMessageRequest { address, public_key }: SIWAMessageRequest,
) -> AuthResult<SIWAMessageResponse> {
    ARMessage::prune(); // Clean expired messages
    ARSession::prune(); // Clean expired sessions

    // Clean expired certificate signatures (1-minute lifetime)
    ExpirationQueue::expired(|expired_keys| {
        DelegationTree::remove(expired_keys);
        ExpirationQueue::remove(expired_keys);
    });

    // Parse address and public key with validation
    let address = ARAddress::new(&address, &public_key)?;

    // Create SIWA message
    let message = ARMessage::new(address)?;

    // Save to storage
    let message_id = message.save();

    Ok(SIWAMessageResponse {
        message: message.to_siwa().into_bytes(),
        message_id: hex::encode(message_id),
    })
}

//===================================================================================================
// QUERY FUNCTIONS FOR TESTING/DEBUGGING (dfx canister call)
//===================================================================================================

// /// Get all stored SIWA messages (for testing/debugging)
// #[ic_cdk::query]
// pub fn siwa_messages() -> Vec<String> {
//     ARMessage::all_values()
//         .iter()
//         .map(|msg| msg.summary())
//         .collect()
// }
