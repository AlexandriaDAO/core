//===================================================================================================
// CORE DELEGATION MODULE - PROVIDER-AGNOSTIC IC DELEGATION MANAGEMENT
//===================================================================================================
//
// This module provides IC-compatible delegation types and functionality that can be used
// by all authentication providers (Ethereum, Solana, Arweave, etc.).
//
// The delegation system allows temporary session keys to act on behalf of user identities
// within the Internet Computer ecosystem.

use candid::CandidType;
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;
use simple_asn1::from_der;

use crate::core::crypto::{
    hash_combined, hash_key_value_pair, hash_with_domain, leb128_encode_u64,
};
use crate::core::error::{AuthError, AuthResult};

//===================================================================================================
// DELEGATION TYPES
//===================================================================================================

/// IC Delegation structure for any authentication provider
///
/// Contains the essential components needed for IC identity delegation:
/// - pubkey: DER-encoded session public key from frontend
/// - expiration: When this delegation expires (nanoseconds since epoch)
///
/// This type is provider-agnostic and works with Ethereum, Solana, Arweave, etc.
#[derive(Clone, Debug, PartialEq, CandidType, Deserialize, Serialize)]
pub struct Delegation {
    /// DER-encoded session public key (from frontend)
    pub pubkey: ByteBuf,

    /// Expiration time in nanoseconds since UNIX epoch
    pub expiration: u64,
}

/// Signed delegation for frontend consumption
///
/// Contains the delegation and IC signature (witness) for creating
/// a DelegationChain in the frontend. This is the final structure
/// returned by delegation endpoints across all providers.
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct SignedDelegation {
    /// The delegation object
    pub delegation: Delegation,

    /// IC signature (witness) proving delegation validity
    pub signature: Vec<u8>,
}

//===================================================================================================
// DELEGATION IMPLEMENTATION
//===================================================================================================

impl Delegation {
    /// Validate session key format and structure
    ///
    /// # Parameters
    /// * `session_key` - DER-encoded public key from frontend to validate
    ///
    /// # Returns
    /// * `AuthResult<()>` - Ok if valid, AuthError with details if invalid
    ///
    /// # Usage
    /// ```rust
    /// Delegation::validate(&session_key)?;
    /// ```
    pub fn validate(session_key: &ByteBuf) -> AuthResult<()> {
        // Validate session key is not empty
        if session_key.is_empty() {
            return Err(AuthError::ValidationError(
                "Session key is empty".to_string(),
            ));
        }

        // Validate the session key is DER-encoded public key from frontend
        from_der(&session_key).map_err(|e| {
            AuthError::ValidationError(format!("Session key should be DER-encoded: {}", e))
        })?;

        Ok(())
    }

    /// Create new delegation with session key and expiration time
    ///
    /// # Parameters
    /// * `session_key` - DER-encoded public key from frontend (e.g., sessionKey.getPublicKey().toDer())
    /// * `expiration` - When this delegation expires (nanoseconds since UNIX epoch)
    ///
    /// # Returns
    /// * `AuthResult<Delegation>` - New delegation or validation error
    ///
    /// # Usage
    /// ```rust
    /// let session_key = ByteBuf::from(der_bytes_from_frontend);
    /// let expiration = now() + session_ttl;
    /// let delegation = Delegation::new(session_key, expiration)?;
    /// ```
    pub fn new(session_key: ByteBuf, expiration: u64) -> AuthResult<Self> {
        // Validate using the separate validate method
        Self::validate(&session_key)?;

        Ok(Self {
            pubkey: session_key,
            expiration,
        })
    }

    /// Get a summary of this delegation for logging
    ///
    /// # Usage
    /// ```rust
    /// ic_cdk::println!("Created: {}", delegation.summary());
    /// ```
    pub fn summary(&self) -> String {
        format!(
            "Delegation(pubkey_hex: {}, pubkey_len: {}, expiration: {})",
            hex::encode(&self.pubkey),
            self.pubkey.len(),
            self.expiration,
        )
    }

    /// Create a hash of this delegation (IC-compatible format)
    ///
    /// This follows IC delegation standards for compatibility.
    /// The hash uniquely identifies this delegation for signature map storage.
    ///
    /// # Returns
    /// * `[u8; 32]` - Hash compatible with IC delegation standard
    ///
    /// # Usage
    /// ```rust
    /// let delegation_hash = delegation.as_hash();
    /// certificate_tree.put(user_seed, delegation_hash);
    /// ```
    pub fn as_hash(&self) -> [u8; 32] {
        // Create key-value pairs using optimized functions
        let pubkey_pair = hash_key_value_pair("pubkey", &self.pubkey);
        let expiration_pair =
            hash_key_value_pair("expiration", &leb128_encode_u64(self.expiration));

        // Sort pairs for deterministic hashing (IC requirement)
        let mut pairs = vec![&pubkey_pair[..], &expiration_pair[..]];
        pairs.sort_unstable();

        // Combine sorted pairs and apply IC domain separation
        let map_hash = hash_combined(&pairs);
        hash_with_domain(b"ic-request-auth-delegation", &map_hash)
    }
}
