//===================================================================================================
// CORE DELEGATION TREE - SHARED ACROSS ALL AUTHENTICATION PROVIDERS
//===================================================================================================
//
// This module provides IC certificate tree management for all authentication providers.
// It handles the temporary RbTree storage required for IC authentication with a
// provider-agnostic API that works with any wallet type (Ethereum, Solana, Arweave, etc.).

use ic_cdk::api::set_certified_data;
use ic_certified_map::{labeled, labeled_hash, AsHashTree, Hash, HashTree, RbTree};
use std::cell::RefCell;

use crate::core::crypto::hash_bytes;
use crate::core::error::{AuthError, AuthResult};
use crate::core::types::WitnessKey;

use super::proof::DelegationProof;

//===================================================================================================
// INTERNAL DELEGATION TYPES
//===================================================================================================

/// Empty unit type for IC certificate compliance
#[derive(Default)]
struct Unit;

impl AsHashTree for Unit {
    fn root_hash(&self) -> Hash {
        ic_certified_map::leaf_hash(&b""[..])
    }
    fn as_hash_tree(&self) -> HashTree<'_> {
        HashTree::Leaf(std::borrow::Cow::from(&b""[..]))
    }
}

//===================================================================================================
// DELEGATION STORAGE
//===================================================================================================

/// Label for signature tree in IC certificate structure
const LABEL_SIG: &[u8] = b"sig";

thread_local! {
    /// Temporary storage for IC certificate generation
    /// Lost on upgrade but rebuilt from stable sessions
    /// Maps: hash(seed_hash) -> delegation_hash -> Unit (IC compatible structure)
    /// Supports multiple concurrent sessions per user, IC expects sig/hash(seed_hash)/delegation_hash -> empty leaf
    static CERTIFICATES: RefCell<RbTree<Hash, RbTree<Hash, Unit>>> =
        RefCell::new(RbTree::new());
}

//===================================================================================================
// DELEGATION TREE MANAGEMENT
//===================================================================================================

/// Provider-agnostic delegation tree manager for IC authentication
///
/// This struct provides certificate tree operations that work with any authentication provider.
/// It manages the temporary RbTree storage required for IC delegation certificates and handles
/// the cryptographic proof generation needed for frontend verification.
pub struct DelegationTree;

impl DelegationTree {
    /// Store a certification mapping in the certificate map
    ///
    /// This creates a new certificate entry that maps hash(seed_hash) -> delegation_hash -> Unit
    /// and updates the IC certified data root hash. Used during login to establish the
    /// cryptographic link between user identity and delegation for IC authentication.
    /// This structure is IC compatible: sig/hash(seed_hash)/delegation_hash -> empty leaf
    ///
    /// # Arguments
    /// * `witness_key` - The witness key containing seed_hash and delegation_hash
    ///
    /// # Usage
    /// ```rust
    /// DelegationTree::put(witness_key);
    /// ```
    pub fn put(witness_key: WitnessKey) {
        // Double hash the seed for IC authentication: hash(seed) -> delegation_hash -> Unit
        let certificate_key = hash_bytes(&witness_key.seed_hash);

        CERTIFICATES.with(|certs| {
            let mut certs_ref = certs.borrow_mut();

            if certs_ref.get(&certificate_key[..]).is_none() {
                let mut delegation_tree = RbTree::new();
                delegation_tree.insert(witness_key.delegation_hash, Unit);
                certs_ref.insert(certificate_key, delegation_tree);
            } else {
                certs_ref.modify(&certificate_key[..], |delegation_tree| {
                    delegation_tree.insert(witness_key.delegation_hash, Unit);
                });
            }

            // Update IC certified data with sig label prefix
            let labeled_root_hash = labeled_hash(LABEL_SIG, &certs_ref.root_hash());
            set_certified_data(&labeled_root_hash);
        });
    }

    /// Generate witness for IC authentication using callback pattern
    ///
    /// Creates a cryptographic proof that the delegation exists in the main certificate tree.
    /// Uses IC-compatible structure: sig/hash(seed_hash)/delegation_hash path.
    /// Uses a callback to avoid lifetime issues - the witness is passed to the callback function.
    /// Uses internal double hashing: takes seed_hash, hashes it for lookup.
    ///
    /// # Arguments
    /// * `witness_key` - The witness key containing seed_hash and delegation_hash
    /// * `callback` - Function that gets called with the witness tree
    ///
    /// # Returns
    /// * `AuthResult<R>` - Result of the callback function or error message
    ///
    /// # Usage
    /// ```rust
    /// // For certification
    /// let sig = DelegationTree::witness(witness_key, |witness| {
    ///     DelegationTree::certify(certificate, witness)
    /// })?;
    /// ```
    pub fn witness<F, R>(witness_key: WitnessKey, callback: F) -> AuthResult<R>
    where
        F: FnOnce(HashTree) -> AuthResult<R>,
    {
        // Double hash the seed for IC witness compatibility
        let certificate_key = hash_bytes(&witness_key.seed_hash);

        CERTIFICATES.with(|certs| {
            let certs_ref = certs.borrow();

            // Step 1: Verify the delegation exists in our tree structure
            certs_ref
                .get(&certificate_key[..])
                .ok_or(AuthError::DelegationNotFound)?
                .get(&witness_key.delegation_hash[..])
                .ok_or(AuthError::DelegationHashMismatch)?;

            // Step 2: Use nested_witness for proper IC authentication
            // This witnesses the IC-compatible path: hash(seed_hash) -> delegation_hash
            // IC expects: sig/hash(seed_hash)/delegation_hash -> empty leaf
            let signature_witness =
                certs_ref.nested_witness(&certificate_key[..], |delegation_tree| {
                    // Now witness the delegation_hash which maps to Unit (empty leaf)
                    delegation_tree.witness(&witness_key.delegation_hash[..])
                });

            // Step 3: Create labeled witness first
            let labeled_witness = labeled(LABEL_SIG, signature_witness);

            // Step 4: Validate witness integrity against labeled root (what's in certified_data)
            let labeled_witness_hash = labeled_witness.reconstruct();
            let root_hash = certs_ref.root_hash();
            let labeled_root_hash = labeled_hash(LABEL_SIG, &root_hash);

            if labeled_witness_hash != labeled_root_hash {
                return Err(AuthError::WitnessHashMismatch);
            }

            // Step 5: Call the callback with the labeled witness
            callback(labeled_witness)
        })
    }

    /// Create a certified signature by combining IC certificate with witness tree
    ///
    /// This function creates the final certified signature that proves delegation validity
    /// to the IC network. It combines the raw IC certificate with the cryptographic witness
    /// tree and serializes them in the CBOR format required by IC authentication protocols.
    ///
    /// # Arguments
    /// * `certificate` - IC certificate bytes from data_certificate()
    /// * `tree` - Witness tree from witness() function
    ///
    /// # Returns
    /// * `AuthResult<Vec<u8>>` - CBOR-encoded certified signature for IC authentication
    ///
    /// # Usage
    /// ```rust
    /// let cert = data_certificate()?;
    /// let sig = DelegationTree::witness(witness_key, |witness| {
    ///     DelegationTree::certify(cert, witness)
    /// })?;
    /// ```
    pub fn certify(certificate: Vec<u8>, tree: HashTree) -> AuthResult<Vec<u8>> {
        let delegation_proof = DelegationProof::new(certificate, tree);
        delegation_proof.to_cbor()
    }

    /// Remove multiple witness keys in batch
    ///
    /// Removes delegation certificates from the tree structure in a single operation.
    /// If the removal makes a seed_hash subtree empty, the entire subtree is removed.
    /// Updates IC certified data once at the end for efficiency.
    ///
    /// Safe to call with non-existent entries - will be a no-op for those keys.
    ///
    /// # Arguments
    /// * `witness_keys` - The witness keys to remove
    ///
    /// # Usage
    /// ```rust
    /// DelegationTree::remove(&expired_keys);
    /// ```
    pub fn remove(witness_keys: &[WitnessKey]) {
        CERTIFICATES.with(|certs| {
            let mut certs_ref = certs.borrow_mut();

            for &witness_key in witness_keys {
                let certificate_key = hash_bytes(&witness_key.seed_hash);
                let mut is_empty = false;

                certs_ref.modify(&certificate_key[..], |delegation_tree| {
                    delegation_tree.delete(&witness_key.delegation_hash[..]);
                    is_empty = delegation_tree.is_empty();
                });

                if is_empty {
                    certs_ref.delete(&certificate_key[..]);
                }
            }

            // Update certified data once at the end (not in loop)
            let labeled_root_hash = labeled_hash(LABEL_SIG, &certs_ref.root_hash());
            set_certified_data(&labeled_root_hash);
        });
    }
}
