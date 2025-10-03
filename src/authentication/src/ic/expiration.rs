//===================================================================================================
// CORE EXPIRATION TRACKING - SHARED ACROSS ALL AUTHENTICATION PROVIDERS
//===================================================================================================
//
// This module provides expiration tracking functionality for delegation signatures.
// It handles the cleanup of expired certificate entries with a provider-agnostic API
// that works with any authentication provider.

use crate::core::{time::now, types::WitnessKey};
use candid::CandidType;
use serde::Deserialize;
use std::cell::RefCell;

//===================================================================================================
// CONSTANTS
//===================================================================================================

/// Delegation signature expires after 1 minute for security
const DELEGATION_SIGNATURE_EXPIRES_AT: u64 = 60 * 1_000_000_000; // 1 minute in nanoseconds

//===================================================================================================
// EXPIRATION ENTRY TYPE
//===================================================================================================

/// Certificate expiration tracking entry
/// Used internally for delegation signature cleanup (1-minute expiration)
#[derive(Clone, Debug, PartialEq, Eq, CandidType, Deserialize)]
pub struct ExpirationEntry {
    /// The witness key (user + delegation) that expires
    pub witness_key: WitnessKey,

    /// When this entry expires (nanoseconds since UNIX epoch)
    pub expires_at: u64,
}

impl ExpirationEntry {
    /// Create a new expiration entry
    /// Calculates expiration time internally (1 minute from now)
    pub fn new(witness_key: WitnessKey) -> Self {
        let expires_at = now().saturating_add(DELEGATION_SIGNATURE_EXPIRES_AT);
        Self {
            witness_key,
            expires_at,
        }
    }
}

//===================================================================================================
// EXPIRATION QUEUE MANAGEMENT
//===================================================================================================

thread_local! {
    /// Expiration queue for certificate cleanup
    /// Tracks when delegation signatures should be removed (1 minute expiration)
    static EXPIRATION_QUEUE: RefCell<Vec<ExpirationEntry>> = RefCell::new(Vec::new());
}

/// Expiration queue manager for delegation signature cleanup
pub struct ExpirationQueue;

impl ExpirationQueue {
    /// Add entry and execute callback
    pub fn put<F>(witness_key: WitnessKey, callback: F)
    where
        F: FnOnce(),
    {
        EXPIRATION_QUEUE.with(|queue| {
            queue.borrow_mut().push(ExpirationEntry::new(witness_key));
        });
        callback();
    }

    /// Get expired entries and execute callback with them
    pub fn expired<F>(callback: F)
    where
        F: FnOnce(&[WitnessKey]),
    {
        let current_time = now();
        let expired_keys: Vec<WitnessKey> = EXPIRATION_QUEUE.with(|queue| {
            queue
                .borrow()
                .iter()
                .filter_map(|entry| {
                    if entry.expires_at <= current_time {
                        Some(entry.witness_key)
                    } else {
                        None
                    }
                })
                .collect()
        });
        callback(&expired_keys);
    }

    /// Remove specific witness keys from queue using retain (single pass)
    pub fn remove(witness_keys: &[WitnessKey]) {
        EXPIRATION_QUEUE.with(|queue| {
            queue
                .borrow_mut()
                .retain(|entry| !witness_keys.contains(&entry.witness_key));
        });
    }
}
