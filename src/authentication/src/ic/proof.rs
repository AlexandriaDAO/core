//===================================================================================================
// CORE DELEGATION PROOF - SHARED ACROSS ALL AUTHENTICATION PROVIDERS
//===================================================================================================
//
// This module provides delegation proof functionality for IC authentication.
// It handles the cryptographic proof generation needed for frontend verification
// with a provider-agnostic API that works with any wallet type.

use ic_certified_map::HashTree;
use serde::Serialize;
use serde_bytes::ByteBuf;

use crate::core::error::{AuthError, AuthResult};

//===================================================================================================
// DELEGATION PROOF TYPE
//===================================================================================================

/// Cryptographic proof of delegation validity for IC authentication
/// Combines IC certificate with witness tree for frontend verification
#[derive(Serialize)]
pub struct DelegationProof<'a> {
    /// Raw IC certificate bytes from data_certificate()
    pub certificate: ByteBuf,

    /// Witness tree proving delegation validity
    pub tree: HashTree<'a>,
}

impl<'a> DelegationProof<'a> {
    /// Create a new delegation proof from certificate and witness tree
    pub fn new(certificate: Vec<u8>, tree: HashTree<'a>) -> Self {
        Self {
            certificate: ByteBuf::from(certificate),
            tree,
        }
    }

    /// Serialize the proof to CBOR format for IC compatibility
    pub fn to_cbor(&self) -> AuthResult<Vec<u8>> {
        // Use self-describing CBOR for IC compatibility
        let mut cbor_serializer = serde_cbor::ser::Serializer::new(Vec::new());
        cbor_serializer.self_describe().map_err(|e| {
            AuthError::SerializationError(format!("CBOR self-describe failed: {}", e))
        })?;

        self.serialize(&mut cbor_serializer).map_err(|e| {
            AuthError::SerializationError(format!("CBOR serialization failed: {}", e))
        })?;

        Ok(cbor_serializer.into_inner())
    }
}
