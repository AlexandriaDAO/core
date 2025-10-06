/// Session management for Ethereum SIWE authentication
///
/// Represents user sessions with delegation hashes for session persistence.
/// Follows the same patterns as ETHMessage, ETHSignature, etc.
use candid::{CandidType, Deserialize};
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use serde::Serialize;
use std::cell::RefCell;

use crate::core::error::AuthResult;
use crate::core::storage::Memory;
use crate::core::storage::{get_memory, memory_ids};
use crate::core::time::now;
use crate::core::{randomness::generate_seed, types::WitnessKey};
use crate::ic::delegation::Delegation;

use super::super::settings::EthereumSettings;
use super::address::ETHAddress;

//===================================================================================================
// SESSION TYPE
//===================================================================================================

/// Represents an active user session with delegation information
#[derive(Clone, Debug, PartialEq, CandidType, Deserialize, Serialize)]
pub struct ETHSession {
    /// ETH address for this session
    pub address: ETHAddress,
    /// The witness key (seed_hash + delegation_hash) for IC certificate operations
    pub witness_key: WitnessKey,
    /// The complete delegation for this session (contains session_key and expiration)
    pub delegation: Delegation,
    /// When this session was created (nanoseconds since UNIX epoch)
    pub created_at: u64,
}

//===================================================================================================
// STORABLE IMPLEMENTATION
//===================================================================================================

impl Storable for ETHSession {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        candid::encode_one(self)
            .expect("Failed to serialize ETHSession: should never fail for valid sessions")
            .into()
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes)
            .expect("Failed to deserialize ETHSession: stable storage may be corrupted")
    }

    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(&self)
            .expect("Failed to serialize ETHSession: should never fail for valid sessions")
    }

    const BOUND: Bound = Bound::Unbounded;
}

//===================================================================================================
// SESSION STORAGE
//===================================================================================================

thread_local! {
    static ETH_SESSIONS: RefCell<StableBTreeMap<[u8; 32], ETHSession, Memory>> =
        RefCell::new(StableBTreeMap::init(get_memory(memory_ids::ETHEREUM_SESSIONS)));
}

//===================================================================================================
// SESSION IMPLEMENTATION
//===================================================================================================

impl ETHSession {
    /// Create new session from ETHAddress and session_key
    ///
    /// # Parameters
    /// * `address` - Ethereum address for this session
    /// * `session_key` - DER-encoded session public key from frontend
    ///
    /// # Returns
    /// * `AuthResult<ETHSession>` - New session or validation error
    ///
    /// # Usage
    /// ```rust
    /// let session = ETHSession::new(address, session_key)?;
    /// let session_id = session.save();
    /// ```
    pub fn new(address: ETHAddress, session_key: serde_bytes::ByteBuf) -> AuthResult<Self> {
        // Get settings internally
        let settings = EthereumSettings::get();

        // Validate session key first
        Delegation::validate(&session_key)?;

        // Calculate expiration from settings
        let expiration = now() + settings.session_ttl;

        // Create delegation using struct initialization
        let delegation = Delegation::new(session_key, expiration)?;

        // Generate seed hash from address + salt
        let seed_hash = address.as_seed(&settings.salt);

        // Calculate delegation hash
        let delegation_hash = delegation.as_hash();

        // Create witness key for IC certificate operations
        let witness_key = WitnessKey::new(seed_hash, delegation_hash);

        Ok(ETHSession {
            address,
            witness_key,
            delegation,
            created_at: now(),
        })
    }

    /// Save session and return session_id
    pub fn save(&self) -> [u8; 32] {
        // Generate unique session ID using IC-compatible randomness
        let session_id = generate_seed();

        // Store session: session_id -> session_data
        ETH_SESSIONS.with(|sessions| {
            sessions.borrow_mut().insert(session_id, self.clone());
        });

        session_id
    }
}

//===================================================================================================
// SESSION STATIC METHODS
//===================================================================================================

impl ETHSession {

    /// Get expired session keys (session IDs)
    pub fn expired_keys() -> Vec<[u8; 32]> {
        let current_time = now();
        ETH_SESSIONS.with(|sessions| {
            sessions
                .borrow()
                .iter()
                .filter_map(|entry| {
                    (entry.value().delegation.expiration <= current_time).then_some(*entry.key())
                })
                .collect()
        })
    }

    /// Get a session by session_id
    pub fn get(key: [u8; 32]) -> Option<Self> {
        ETH_SESSIONS.with(|sessions| sessions.borrow().get(&key))
    }

    /// Remove sessions by their session_ids
    pub fn remove(keys: &[[u8; 32]]) {
        ETH_SESSIONS.with(|sessions| {
            let mut sessions_ref = sessions.borrow_mut();
            for &key in keys {
                sessions_ref.remove(&key);
            }
        })
    }

    /// Remove all expired sessions from storage
    pub fn prune() {
        let expired_keys = Self::expired_keys();
        Self::remove(&expired_keys);
    }
}
