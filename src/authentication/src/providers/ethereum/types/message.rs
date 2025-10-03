/// Ethereum SIWE (Sign-In with Ethereum) message type
///
/// This module provides a comprehensive SIWE message implementation that:
/// - Uses ETHAddress for type-safe address handling
/// - Integrates with stable storage for message persistence
/// - Implements EIP-4361 message formatting
/// - Provides expiration and validation logic
use candid::{CandidType, Deserialize};
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use serde::Serialize;
use std::borrow::Cow;
use std::cell::RefCell;
use std::fmt;
use tiny_keccak::{Hasher, Keccak};

use crate::core::error::AuthError;
use crate::core::error::AuthResult;
use crate::core::randomness::{generate_nonce, generate_seed};
use crate::core::storage::{get_memory, memory_ids, Memory};
use crate::core::time::{format_timestamp, now};

use super::super::settings::EthereumSettings;
use super::address::ETHAddress;
use super::constants::EIP191_PREFIX;

//===================================================================================================
// ETHEREUM MESSAGE TYPE
//===================================================================================================

/// Type-safe SIWE message following EIP-4361 standard
///
/// Represents an Ethereum Sign-In message with proper validation and formatting.
/// This replaces the generic SIWEMessage with Ethereum-specific types and validation.
///
/// Usage examples:
/// ```rust
/// // Create new message for an address
/// let address = ETHAddress::new("0x55e7ff3c9c89d27d43a6272ac68609f968550c17")?;
/// let message = ETHMessage::new(address)?;
///
/// // Check if expired
/// if message.is_expired() {
///     return Err(AuthError::MessageExpired);
/// }
///
/// // Convert to EIP-4361 format for signing
/// let eip4361_text = message.to_eip4361();
///
/// // Save to storage
/// message.save()?;
/// ```
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub struct ETHMessage {
    /// The domain requesting the signing (e.g., "myapp.com")
    pub domain: String,

    /// The Ethereum address performing the signing (validated)
    pub address: ETHAddress,

    /// Human-readable statement describing the signing request
    pub statement: String,

    /// The URI of the dApp requesting the signing
    pub uri: String,

    /// The SIWE version (typically "1")
    pub version: String,

    /// The Ethereum chain ID where the address resides
    pub chain_id: u64,

    /// Cryptographically secure nonce to prevent replay attacks
    pub nonce: String,

    /// When this message was created (nanoseconds since epoch)
    pub created_at: u64,

    /// When this message expires (nanoseconds since epoch)
    pub expires_at: u64,

    /// User's balance (defaults to 0 for all users)
    pub balance: u64,
}

//===================================================================================================
// STORABLE IMPLEMENTATION
//===================================================================================================

/// Implement Storable trait for stable storage compatibility
///
/// This allows ETHMessage to be stored in IC stable structures like StableBTreeMap.
/// Uses Candid serialization for maximum compatibility with IC ecosystem.
impl Storable for ETHMessage {
    fn to_bytes(&self) -> Cow<[u8]> {
        candid::encode_one(self).unwrap().into()
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(&self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

//===================================================================================================
// SESSION STORAGE
//===================================================================================================

thread_local! {
    // Thread-local storage for ETH messages using our type-safe ETHMessage
    static ETH_MESSAGES: RefCell<StableBTreeMap<[u8; 32], ETHMessage, Memory>> =
        RefCell::new(StableBTreeMap::init(
            get_memory(memory_ids::ETHEREUM_MESSAGES)
        ));
}

//===================================================================================================
// ETH MESSAGE IMPLEMENTATION - INSTANCE METHODS
//===================================================================================================

impl ETHMessage {
    /// Save this message to stable storage
    pub fn save(&self) -> [u8; 32] {
        // Generate unique session ID using IC-compatible randomness
        let message_id = generate_seed();

        ETH_MESSAGES.with(|storage| {
            storage.borrow_mut().insert(message_id, self.clone());
        });
        message_id
    }

    /// Hash this message for signature verification using EIP-191 standard
    ///
    /// EIP-191: Standard for hashing messages before signing to prevent transaction replay attacks.
    /// Format: hash("\x19Ethereum Signed Message:\n{length}{message}")
    ///
    /// Usage: When you need to verify a signature against this message
    /// ```rust
    /// let message = ETHMessage::new(address)?;
    /// let hash = message.as_hash()?;
    /// // Use hash to verify signature
    /// ```
    pub fn as_hash(&self) -> AuthResult<[u8; 32]> {
        let eip4361_text = self.to_eip4361();
        Self::hash_text(&eip4361_text)
    }

    /// Get a short summary of the message for logging/debugging
    ///
    /// Usage: Concise representation for logs
    /// ```rust
    /// println!("Processing message: {}", message.summary());
    /// // Output: "ETH message for 0x742c8... (nonce: abc123, expires at 2024-09-21T15:30:45.123Z)"
    /// ```
    pub fn summary(&self) -> String {
        format!(
            "ETH message for {} (nonce: {}, expires at {})",
            self.address,
            self.nonce,
            format_timestamp(self.expires_at)
        )
    }
}

//===================================================================================================
// SIWE MESSAGE IMPLEMENTATION - STATIC METHODS
//===================================================================================================

impl ETHMessage {
    /// Create a new SIWE message for the given Ethereum address
    ///
    /// Uses current Ethereum settings for all configuration values.
    /// Generates a cryptographically secure nonce and sets appropriate timestamps.
    ///
    /// Usage: Primary method for creating messages during login flow
    /// ```rust
    /// let address = ETHAddress::new("0x742c8ab5ad3d9c3fc3b0f1d4a2a4c8b5f8e7d329")?;
    /// let message = ETHMessage::new(address)?;
    /// assert!(!message.is_expired());
    /// ```
    pub fn new(address: ETHAddress) -> AuthResult<Self> {
        // Get current Ethereum settings
        let settings = EthereumSettings::get();

        // Generate cryptographically secure nonce
        let nonce_bytes = generate_nonce();
        let nonce = hex::encode(nonce_bytes);

        // Set timestamps
        let current_time = now();
        let expires_at = current_time + settings.message_ttl;

        Ok(Self {
            domain: settings.domain,
            address,
            statement: settings.statement,
            uri: settings.uri,
            version: settings.version,
            chain_id: settings.chain_id,
            nonce,
            created_at: current_time,
            expires_at,
            balance: 0, // Default balance for all users
        })
    }

    /// Remove all expired messages from storage
    pub fn prune() -> usize {
        let expired_keys = Self::expired_keys();
        let count = expired_keys.len();
        Self::purge(&expired_keys);
        count
    }

    /// Get all messages with their keys
    pub fn all() -> Vec<([u8; 32], ETHMessage)> {
        ETH_MESSAGES.with(|storage| {
            storage
                .borrow()
                .iter()
                .map(|entry| (entry.key().to_owned(), entry.value()))
                .collect()
        })
    }

    /// Get all message keys
    pub fn all_keys() -> Vec<[u8; 32]> {
        ETH_MESSAGES.with(|storage| storage.borrow().keys().collect())
    }

    /// Get all message values
    pub fn all_values() -> Vec<ETHMessage> {
        ETH_MESSAGES.with(|storage| storage.borrow().values().collect())
    }

    /// Get expired messages with their keys
    pub fn expired() -> Vec<([u8; 32], ETHMessage)> {
        let current_time = now();
        ETH_MESSAGES.with(|storage| {
            storage
                .borrow()
                .iter()
                .filter_map(|entry| {
                    (entry.value().expires_at <= current_time)
                        .then_some((entry.key().to_owned(), entry.value()))
                })
                .collect()
        })
    }

    /// Get expired message keys
    pub fn expired_keys() -> Vec<[u8; 32]> {
        let current_time = now();
        ETH_MESSAGES.with(|storage| {
            storage
                .borrow()
                .iter()
                .filter_map(|entry| {
                    (entry.value().expires_at <= current_time).then_some(entry.key().to_owned())
                })
                .collect()
        })
    }

    /// Get expired message values
    pub fn expired_values() -> Vec<ETHMessage> {
        let current_time = now();
        ETH_MESSAGES.with(|storage| {
            storage
                .borrow()
                .iter()
                .filter_map(|entry| {
                    (entry.value().expires_at <= current_time).then_some(entry.value())
                })
                .collect()
        })
    }

    /// Get total count of messages in storage
    pub fn count() -> usize {
        ETH_MESSAGES.with(|storage| storage.borrow().len() as usize)
    }

    /// Remove multiple messages from storage by their keys
    ///
    /// Efficiently removes multiple messages in a single storage operation.
    /// Silently ignores keys that don't exist in storage.
    ///
    /// Usage: Bulk cleanup operations, typically called by prune()
    /// ```rust
    /// let expired_keys = ETHMessage::expired_keys();
    /// ETHMessage::purge(&expired_keys);
    /// ```
    pub fn purge(keys: &[[u8; 32]]) {
        ETH_MESSAGES.with(|storage| {
            let mut storage_ref = storage.borrow_mut();
            for key in keys {
                storage_ref.remove(key);
            }
        })
    }

    /// Get a message from storage by message_id
    ///
    /// Retrieves a message without removing it from storage.
    /// Returns MessageNotFound error if the key doesn't exist.
    ///
    /// Usage: When you need to read a message without consuming it
    /// ```rust
    /// let message_key = hex_to_hash(&message_id)?;
    /// let message = ETHMessage::get(&message_key)?;
    /// println!("Message summary: {}", message.summary());
    /// ```
    pub fn get(key: &[u8; 32]) -> AuthResult<Self> {
        ETH_MESSAGES.with(|storage| storage.borrow().get(key).ok_or(AuthError::MessageNotFound))
    }

    /// Remove and return a message from storage by key
    ///
    /// Removes the message from storage and returns it if found.
    /// Returns MessageNotFound error if the key doesn't exist.
    ///
    /// Usage: When you need to remove and get the message in one atomic operation
    /// ```rust
    /// let message_key = hex_to_hash(&message_id)?;
    /// let removed_message = ETHMessage::remove(&message_key)?;
    /// println!("Removed: {}", removed_message.summary());
    /// ```
    pub fn remove(key: &[u8; 32]) -> AuthResult<Self> {
        ETH_MESSAGES.with(|storage| {
            storage
                .borrow_mut()
                .remove(key)
                .ok_or(AuthError::MessageNotFound)
        })
    }

    /// Consume a message for authentication: remove, validate, and return
    ///
    /// Performs atomic message consumption with expiration validation.
    /// This is the primary method for SIWE authentication flow.
    ///
    /// Process:
    /// 1. Removes the message from storage (one-time use)
    /// 2. Validates the message hasn't expired
    /// 3. Returns the valid message for signature verification
    ///
    /// Usage: During SIWE login to consume the prepared message
    /// ```rust
    /// let message_key = hex_to_hash(&message_id)?;
    /// let message = ETHMessage::consume(&message_key)?;
    /// // Message is now removed from storage and ready for signature verification
    /// let recovered_address = signature.recover_address(&message)?;
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

impl ETHMessage {
    /// Convert to EIP-4361 formatted string for wallet signing
    ///
    /// This is the exact format that wallets expect for SIWE messages.
    /// The user will see this text in their wallet when asked to sign.
    ///
    /// Usage: Generate text for wallet signature requests
    /// ```rust
    /// let sign_text = message.to_eip4361();
    /// // Send to wallet for signing
    /// ```
    pub fn to_eip4361(&self) -> String {
        let issued_at_iso = format_timestamp(self.created_at);
        let expiration_iso = format_timestamp(self.expires_at);

        format!(
            "{domain} wants you to sign in with your Ethereum account:\n\
            {address}\n\n\
            {statement}\n\n\
            URI: {uri}\n\
            Version: {version}\n\
            Chain ID: {chain_id}\n\
            Nonce: {nonce}\n\
            Issued At: {issued_at}\n\
            Expiration Time: {expiration}",
            domain = self.domain,
            address = self.address.as_str(),
            statement = self.statement,
            uri = self.uri,
            version = self.version,
            chain_id = self.chain_id,
            nonce = self.nonce,
            issued_at = issued_at_iso,
            expiration = expiration_iso,
        )
    }

    /// Hash any text using EIP-191 standard (static method)
    ///
    /// EIP-191: Prepends "\x19Ethereum Signed Message:\n{length}" to prevent replay attacks.
    /// This is what wallets actually sign when they sign a message.
    ///
    /// Usage: When you need to hash arbitrary text for signing
    /// ```rust
    /// let hash = ETHMessage::hash_text("Hello World")?;
    /// // This creates the same hash that MetaMask would create
    /// ```
    pub fn hash_text(text: &str) -> AuthResult<[u8; 32]> {
        // Format according to EIP-191: "\x19Ethereum Signed Message:\n{length}{message}"
        let eip191_formatted = format!("{}{}{}", EIP191_PREFIX, text.len(), text);

        // Hash with Keccak256 (Ethereum's hash function)
        let mut keccak256 = [0; 32];
        let mut hasher = Keccak::v256();
        hasher.update(eip191_formatted.as_bytes());
        hasher.finalize(&mut keccak256);

        Ok(keccak256)
    }
}

//===================================================================================================
// DISPLAY AND SERIALIZATION
//===================================================================================================

impl fmt::Display for ETHMessage {
    /// Display as JSON for debugging and logging
    ///
    /// Usage: Easy debugging output
    /// ```rust
    /// println!("Message details: {}", message);
    /// ```
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match serde_json::to_string(self) {
            Ok(json) => write!(f, "{}", json),
            Err(_) => write!(f, "ETHMessage[{}]", self.summary()),
        }
    }
}
