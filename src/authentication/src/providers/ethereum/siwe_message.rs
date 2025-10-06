use ic_cdk::update;

use crate::core::error::AuthResult;
use crate::core::types::MessageResponse;
use crate::ic::expiration::ExpirationQueue;
use crate::ic::tree::DelegationTree;

use super::types::address::ETHAddress;
use super::types::message::ETHMessage;
use super::types::session::ETHSession;

/// Generate a SIWE message for user authentication
///
/// Example call:
/// ```
/// dfx canister call mulauth siwe_message '("0x742c8ab5ad3d9c3fc3b0f1d4a2a4c8b5f8e7d329")'
/// ```
///
/// Returns: MessageResponse with message text and nonce
//===================================================================================================
// IC CANISTER FUNCTIONS (dfx canister call)
//===================================================================================================

#[update]
pub fn siwe_message(address: String) -> AuthResult<MessageResponse> {
    ETHMessage::prune(); // Clean expired messages
    ETHSession::prune(); // Clean expired sessions

    // Clean expired certificate signatures (1-minute lifetime)
    ExpirationQueue::expired(|expired_keys| {
        DelegationTree::remove(expired_keys);
        ExpirationQueue::remove(expired_keys);
    });

    // Create ETHAddress with validation (auto-checksums user input)
    let eth_address = ETHAddress::new(&address)?;

    // Create ETH message using type-safe constructor
    let message = ETHMessage::new(eth_address)?;

    // Store message for later verification and get message_id
    let message_id = message.save();

    // Return both the SIWE message text and message_id for frontend use
    Ok(MessageResponse {
        message: message.to_eip4361(),
        message_id: hex::encode(message_id),
    })
}
