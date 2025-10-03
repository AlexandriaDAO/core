/// Solana SIWS (Sign-In with Solana) message type
///
/// This module provides a comprehensive SIWS message implementation that:
/// - Uses SOLAddress for type-safe address handling
/// - Integrates with stable storage for message persistence
/// - Implements SIWS message formatting (similar to SIWE but for Solana)
/// - Provides expiration and validation logic
///
/// KEY DIFFERENCES FROM ETHEREUM:
/// - Uses Solana cluster instead of chain_id
/// - No EIP-191 prefix needed - uses raw UTF-8 bytes for signing
/// - Base58 addresses instead of hex addresses
/// - "Sign in with Solana" instead of "Sign in with Ethereum"
use candid::{CandidType, Deserialize};
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use serde::Serialize;
use std::borrow::Cow;
use std::cell::RefCell;
use std::fmt;

use crate::core::error::AuthError;
use crate::core::error::AuthResult;
use crate::core::randomness::generate_nonce;
use crate::core::randomness::generate_seed;
use crate::core::storage::{get_memory, memory_ids, Memory};
use crate::core::time::{format_timestamp, now};

use super::super::settings::SolanaSettings;
use super::address::SOLAddress;

//===================================================================================================
// SOLANA MESSAGE TYPE
//===================================================================================================

/// Type-safe SIWS message following SIWS standard (Sign-In With Solana)
///
/// Represents a Solana Sign-In message with proper validation and formatting.
/// Similar to SIWE but adapted for Solana's ecosystem and Ed25519 signatures.
///
/// Usage examples:
/// ```rust
/// // Create new message for an address
/// let address = SOLAddress::new("11111111111111111111111111111112")?;
/// let message = SOLMessage::new(address)?;
///
/// // Check if expired
/// if message.is_expired() {
///     return Err(AuthError::MessageExpired);
/// }
///
/// // Convert to SIWS format for signing
/// let siws_text = message.to_siws();
///
/// // Save to storage
/// message.save()?;
/// ```
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub struct SOLMessage {
    /// The domain requesting the signing (e.g., "myapp.com")
    pub domain: String,

    /// The Solana address performing the signing (validated)
    pub address: SOLAddress,

    /// Human-readable statement describing the signing request
    pub statement: String,

    /// The URI of the dApp requesting the signing
    pub uri: String,

    /// The SIWS version (typically "1")
    pub version: String,

    /// The Solana cluster where the address resides
    pub cluster: String,

    /// Cryptographically secure nonce to prevent replay attacks
    pub nonce: String,

    /// When this message was created (nanoseconds since epoch)
    pub created_at: u64,

    /// When this message expires (nanoseconds since epoch)
    pub expires_at: u64,
}

//===================================================================================================
// STABLE STORAGE COMPATIBILITY
//===================================================================================================

/// Implement Storable trait for stable storage compatibility
impl Storable for SOLMessage {
    fn to_bytes(&self) -> Cow<[u8]> {
        candid::encode_one(self)
            .expect("Failed to serialize SOLMessage: should never fail for valid messages")
            .into()
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes)
            .expect("Failed to deserialize SOLMessage: stable storage may be corrupted")
    }

    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(&self)
            .expect("Failed to serialize SOLMessage: should never fail for valid messages")
    }

    const BOUND: Bound = Bound::Unbounded;
}

//===================================================================================================
// STABLE STORAGE FOR MESSAGES
//===================================================================================================

thread_local! {
    /// Stable storage for Solana messages
    /// Maps: random_32_byte_id → SOLMessage
    static SOL_MESSAGES: RefCell<StableBTreeMap<[u8; 32], SOLMessage, Memory>> =
        RefCell::new(StableBTreeMap::init(get_memory(memory_ids::SOLANA_MESSAGES)));
}

//===================================================================================================
// MESSAGE CREATION AND VALIDATION
//===================================================================================================

impl SOLMessage {
    /// Create a new SIWS message for the given address
    ///
    /// Uses current Solana settings to populate message fields.
    /// Generates a cryptographically secure nonce for replay attack prevention.
    ///
    /// Usage: Primary method for creating messages during authentication
    /// ```rust
    /// let address = SOLAddress::new("11111111111111111111111111111112")?;
    /// let message = SOLMessage::new(address)?;
    /// let message_id = message.save();
    /// ```
    pub fn new(address: SOLAddress) -> AuthResult<Self> {
        // Get current Solana settings
        let settings = SolanaSettings::get();

        // Generate cryptographically secure nonce
        let nonce_bytes = generate_nonce();
        let nonce = hex::encode(nonce_bytes);

        // Set timestamps
        let current_time = now();
        let expires_at = current_time.saturating_add(settings.message_ttl);

        Ok(Self {
            domain: settings.domain,
            address,
            statement: settings.statement,
            uri: settings.uri,
            version: settings.version,
            cluster: settings.cluster,
            nonce,
            created_at: current_time,
            expires_at,
        })
    }
}

//===================================================================================================
// STORAGE OPERATIONS
//===================================================================================================

impl SOLMessage {
    /// Save this message to stable storage and return its ID
    ///
    /// Generates a random 32-byte ID and stores the message.
    /// The ID is used for later retrieval during authentication.
    ///
    /// Usage: After creating a message for user signing
    /// ```rust
    /// let message = SOLMessage::new(address)?;
    /// let message_id = message.save();
    /// // Send hex::encode(message_id) to frontend
    /// ```
    pub fn save(&self) -> [u8; 32] {
        let message_id = generate_seed();
        SOL_MESSAGES.with(|storage| {
            storage.borrow_mut().insert(message_id, self.clone());
        });
        message_id
    }

    /// Remove all expired messages from storage
    pub fn prune() -> usize {
        let expired_keys = Self::expired_keys();
        let count = expired_keys.len();
        Self::purge(&expired_keys);
        count
    }

    /// Get expired message keys
    pub fn expired_keys() -> Vec<[u8; 32]> {
        let current_time = now();
        SOL_MESSAGES.with(|storage| {
            storage
                .borrow()
                .iter()
                .filter_map(|entry| {
                    (entry.value().expires_at <= current_time).then_some(entry.key().to_owned())
                })
                .collect()
        })
    }


    /// Remove multiple messages from storage by their keys
    ///
    /// Efficiently removes multiple messages in a single storage operation.
    /// Silently ignores keys that don't exist in storage.
    ///
    /// Usage: Bulk cleanup operations, typically called by prune()
    /// ```rust
    /// let expired_keys = SOLMessage::expired_keys();
    /// SOLMessage::purge(&expired_keys);
    /// ```
    pub fn purge(keys: &[[u8; 32]]) {
        SOL_MESSAGES.with(|storage| {
            let mut storage_ref = storage.borrow_mut();
            for key in keys {
                storage_ref.remove(key);
            }
        })
    }

    /// Remove and return a message from storage by key
    ///
    /// Removes the message from storage and returns it if found.
    /// Returns MessageNotFound error if the key doesn't exist.
    ///
    /// Usage: When you need to remove and get the message in one atomic operation
    /// ```rust
    /// let message_key = hex_to_hash(&message_id)?;
    /// let removed_message = SOLMessage::remove(&message_key)?;
    /// println!("Removed: {}", removed_message.summary());
    /// ```
    pub fn remove(key: &[u8; 32]) -> AuthResult<Self> {
        SOL_MESSAGES.with(|storage| {
            storage
                .borrow_mut()
                .remove(key)
                .ok_or(AuthError::MessageNotFound)
        })
    }

    /// Consume a message for authentication: remove, validate, and return
    ///
    /// Performs atomic message consumption with expiration validation.
    /// This is the primary method for SIWS authentication flow.
    ///
    /// Process:
    /// 1. Removes the message from storage (one-time use)
    /// 2. Validates the message hasn't expired
    /// 3. Returns the valid message for signature verification
    ///
    /// Usage: During SIWS login to consume the prepared message
    /// ```rust
    /// let message_key = hex_to_hash(&message_id)?;
    /// let message = SOLMessage::consume(&message_key)?;
    /// // Message is now removed from storage and ready for signature verification
    /// let is_valid = signature.verify(&message, &expected_address)?;
    /// ```
    pub fn consume(key: &[u8; 32]) -> AuthResult<Self> {
        // Step 1: Remove and get the message (propagates MessageNotFound error)
        let message = Self::remove(key)?;

        // Step 2: Check if the removed message was expired
        if now() > message.expires_at {
            return Err(AuthError::MessageExpiredError(
                "Message has expired. Please prepare a new login.".to_string(),
            ));
        }

        // Step 3: Return the valid message
        Ok(message)
    }
}

//===================================================================================================
// MESSAGE FORMATTING AND DISPLAY
//===================================================================================================

impl SOLMessage {
    /// Convert to SIWS formatted string for wallet signing
    ///
    /// This is the format that Solana wallets expect for SIWS messages.
    /// The user will see this text in their wallet when asked to sign.
    /// Similar to SIWE but adapted for Solana.
    ///
    /// Usage: Generate text for wallet signature requests
    /// ```rust
    /// let sign_text = message.to_siws();
    /// // Send to Solana wallet for signing
    /// ```
    pub fn to_siws(&self) -> String {
        let issued_at_iso = format_timestamp(self.created_at);
        let expiration_iso = format_timestamp(self.expires_at);

        format!(
            "{domain} wants you to sign in with your Solana account:\n\
            {address}\n\n\
            {statement}\n\n\
            URI: {uri}\n\
            Version: {version}\n\
            Cluster: {cluster}\n\
            Nonce: {nonce}\n\
            Issued At: {issued_at}\n\
            Expiration Time: {expiration}",
            domain = self.domain,
            address = self.address.as_str(),
            statement = self.statement,
            uri = self.uri,
            version = self.version,
            cluster = self.cluster,
            nonce = self.nonce,
            issued_at = issued_at_iso,
            expiration = expiration_iso,
        )
    }
}

//===================================================================================================
// DISPLAY TRAITS
//===================================================================================================

impl fmt::Display for SOLMessage {
    /// Display the message in SIWS format
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_siws())
    }
}
