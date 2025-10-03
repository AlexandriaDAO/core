/// Arweave SIWA (Sign-In with Arweave) message type
///
/// This module provides a comprehensive SIWA message implementation that:
/// - Uses ARAddress for type-safe address and public key handling
/// - Integrates with stable storage for message persistence
/// - Implements SIWA message formatting (similar to SIWE but for Arweave)
/// - Provides expiration and validation logic
///
/// KEY DIFFERENCES FROM ETHEREUM/SOLANA:
/// - Uses Arweave network instead of chain_id/cluster
/// - RSA-PSS signatures instead of ECDSA/Ed25519
/// - Base64URL addresses instead of hex/Base58 addresses
/// - "Sign in with Arweave" instead of "Sign in with Ethereum"
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

use super::super::settings::ArweaveSettings;
use super::address::ARAddress;

//===================================================================================================
// ARWEAVE MESSAGE TYPE
//===================================================================================================

/// Type-safe SIWA message following SIWA standard (Sign-In With Arweave)
///
/// Represents an Arweave Sign-In message with proper validation and formatting.
/// Similar to SIWE but adapted for Arweave's ecosystem and RSA-PSS signatures.
///
/// Usage examples:
/// ```rust
/// // Create new message for an address and public key
/// let address = ARAddress::new("1seRanklLU_1VTGkEk7P0xAwMJfA7owA1JHW5KyZKlY", "MIIBIjANBgkqhkiG...")?;
/// let message = ARMessage::new(address)?;
///
/// // Check if expired
/// if message.is_expired() {
///     return Err(AuthError::MessageExpired);
/// }
///
/// // Convert to SIWA format for signing
/// let siwa_text = message.to_siwa();
///
/// // Save to storage
/// message.save()?;
/// ```
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub struct ARMessage {
    /// The domain requesting the signing (e.g., "myapp.com")
    pub domain: String,

    /// The Arweave address performing the signing (with public key)
    pub address: ARAddress,

    /// Human-readable statement describing the signing request
    pub statement: String,

    /// The URI of the dApp requesting the signing
    pub uri: String,

    /// The SIWA version (typically "1")
    pub version: String,

    /// The Arweave network where the address resides ("mainnet" or "testnet")
    pub network: String,

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
impl Storable for ARMessage {
    fn to_bytes(&self) -> Cow<[u8]> {
        candid::encode_one(self)
            .expect("Failed to serialize ARMessage: should never fail for valid messages")
            .into()
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes)
            .expect("Failed to deserialize ARMessage: stable storage may be corrupted")
    }

    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(&self)
            .expect("Failed to serialize ARMessage: should never fail for valid messages")
    }

    const BOUND: Bound = Bound::Unbounded;
}

//===================================================================================================
// STABLE STORAGE FOR MESSAGES
//===================================================================================================

thread_local! {
    /// Stable storage for Arweave messages
    /// Maps: random_32_byte_id → ARMessage
    static AR_MESSAGES: RefCell<StableBTreeMap<[u8; 32], ARMessage, Memory>> =
        RefCell::new(StableBTreeMap::init(get_memory(memory_ids::ARWEAVE_MESSAGES)));
}

//===================================================================================================
// MESSAGE CREATION AND VALIDATION
//===================================================================================================

impl ARMessage {
    /// Create a new SIWA message for the given address
    ///
    /// Uses current Arweave settings to populate message fields.
    /// Generates a cryptographically secure nonce for replay attack prevention.
    ///
    /// # Usage
    /// ```rust
    /// let address = ARAddress::new("1seRanklLU_1VTGkEk7P0xAwMJfA7owA1JHW5KyZKlY", "MIIBIjANBgkqhkiG...")?;
    /// let message = ARMessage::new(address)?;
    /// let message_id = message.save();
    /// ```
    pub fn new(address: ARAddress) -> AuthResult<Self> {
        // Get current Arweave settings
        let settings = ArweaveSettings::get();

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
            network: settings.network,
            nonce,
            created_at: current_time,
            expires_at,
        })
    }

    /// Get a human-readable summary of this message
    ///
    /// Useful for logging and debugging.
    ///
    /// # Usage
    /// ```rust
    /// ic_cdk::println!("Message: {}", message.summary());
    /// ```
    pub fn summary(&self) -> String {
        format!(
            "ARMessage(address: {}, network: {}, expires: {})",
            self.address.address(),
            self.network,
            format_timestamp(self.expires_at)
        )
    }
}

//===================================================================================================
// STORAGE OPERATIONS
//===================================================================================================

impl ARMessage {
    /// Save this message to stable storage and return its ID
    ///
    /// Generates a random 32-byte ID and stores the message.
    /// The ID is used for later retrieval during authentication.
    ///
    /// # Usage
    /// ```rust
    /// let message = ARMessage::new(address)?;
    /// let message_id = message.save();
    /// // Send hex::encode(message_id) to frontend
    /// ```
    pub fn save(&self) -> [u8; 32] {
        let message_id = generate_seed();
        AR_MESSAGES.with(|storage| {
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

    /// Get all message values
    pub fn all_values() -> Vec<ARMessage> {
        AR_MESSAGES.with(|storage| storage.borrow().values().collect())
    }


    /// Get expired message keys
    pub fn expired_keys() -> Vec<[u8; 32]> {
        let current_time = now();
        AR_MESSAGES.with(|storage| {
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
    /// let expired_keys = ARMessage::expired_keys();
    /// ARMessage::purge(&expired_keys);
    /// ```
    pub fn purge(keys: &[[u8; 32]]) {
        AR_MESSAGES.with(|storage| {
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
    /// # Usage
    /// ```rust
    /// let message_key = hex_to_hash(&message_id)?;
    /// let removed_message = ARMessage::remove(&message_key)?;
    /// println!("Removed: {}", removed_message.summary());
    /// ```
    pub fn remove(key: &[u8; 32]) -> AuthResult<Self> {
        AR_MESSAGES.with(|storage| {
            storage
                .borrow_mut()
                .remove(key)
                .ok_or(AuthError::MessageNotFound)
        })
    }

    /// Consume a message for authentication: remove, validate, and return
    ///
    /// Performs atomic message consumption with expiration validation.
    /// This is the primary method for SIWA authentication flow.
    ///
    /// Process:
    /// 1. Removes the message from storage (one-time use)
    /// 2. Validates the message hasn't expired
    /// 3. Returns the valid message for signature verification
    ///
    /// # Usage
    /// ```rust
    /// let message_key = hex_to_hash(&message_id)?;
    /// let message = ARMessage::consume(&message_key)?;
    /// // Message is now removed from storage and ready for signature verification
    /// let is_valid = signature.verify(&message)?;
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

impl ARMessage {
    /// Convert to SIWA formatted string for wallet signing
    ///
    /// This is the format that Arweave wallets expect for SIWA messages.
    /// The user will see this text in their wallet when asked to sign.
    /// Similar to SIWE but adapted for Arweave.
    ///
    /// # Usage
    /// ```rust
    /// let sign_text = message.to_siwa();
    /// // Send to Arweave wallet for signing
    /// ```
    pub fn to_siwa(&self) -> String {
        let issued_at_iso = format_timestamp(self.created_at);
        let expiration_iso = format_timestamp(self.expires_at);

        format!(
            "{domain} wants you to sign in with your Arweave account:\n\
            {address}\n\n\
            {statement}\n\n\
            URI: {uri}\n\
            Version: {version}\n\
            Network: {network}\n\
            Nonce: {nonce}\n\
            Issued At: {issued_at}\n\
            Expiration Time: {expiration}",
            domain = self.domain,
            address = self.address.address(),
            statement = self.statement,
            uri = self.uri,
            version = self.version,
            network = self.network,
            nonce = self.nonce,
            issued_at = issued_at_iso,
            expiration = expiration_iso,
        )
    }
}

//===================================================================================================
// DISPLAY TRAITS
//===================================================================================================

impl fmt::Display for ARMessage {
    /// Display the message in SIWA format
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_siwa())
    }
}
