//===================================================================================================
// CORE TYPES - SHARED ACROSS ALL AUTHENTICATION PROVIDERS
//===================================================================================================
//
// This module contains type definitions used by all authentication providers.
// These types provide a consistent API surface for authentication flows
// regardless of the underlying provider (Ethereum, Solana, Arweave, etc.)

use candid::CandidType;
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;

//===================================================================================================
// AUTHENTICATION REQUEST/RESPONSE TYPES
//===================================================================================================

/// Generic message response structure
/// Returned from message preparation endpoints
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct MessageResponse {
    /// The message text to be signed by the user's wallet
    pub message: String,

    /// The message ID for later verification (hex-encoded)
    pub message_id: String,
}

/// Generic authentication request structure
/// Used by frontend to initiate authentication with any provider
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct LoginRequest {
    /// The signature from the user's wallet (hex-encoded with 0x prefix)
    pub signature: String,

    /// The message ID from message response (hex-encoded)
    pub message_id: String,

    /// The session public key in DER format for IC delegation
    pub session_key: ByteBuf,
}

/// Generic authentication response structure
/// Returned after successful authentication
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct LoginResponse {
    /// Session ID for subsequent delegation requests (hex-encoded)
    pub session_id: String,

    /// User's canister public key for IC identity (hex-encoded DER)
    pub user_canister_pubkey: ByteBuf,
}

//===================================================================================================
// IC DELEGATION TYPES
//===================================================================================================

/// Key pair for IC certificate tree operations and witness generation
/// Used throughout the authentication system to identify specific delegations
/// within the RBTree structure: seed_hash -> [delegation_hash1, delegation_hash2, ...]
#[derive(Clone, Copy, Debug, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub struct WitnessKey {
    /// User's unique identifier derived from their address (will be double-hashed for IC)
    pub seed_hash: [u8; 32],

    /// Hash of the delegation (session key) for this certificate entry
    pub delegation_hash: [u8; 32],
}

impl WitnessKey {
    /// Create a new witness key from seed and delegation hashes
    pub fn new(seed_hash: [u8; 32], delegation_hash: [u8; 32]) -> Self {
        Self {
            seed_hash,
            delegation_hash,
        }
    }
}