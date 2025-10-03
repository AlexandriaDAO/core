/// Principal handling for Oisy SIWO authentication
///
/// Represents IC principals for Oisy authentication.
/// Unlike other providers that use external addresses, Oisy uses IC principals directly.
use candid::{CandidType, Deserialize, Principal};
use ic_stable_structures::{storable::Bound, Storable};
use serde::Serialize;
use std::fmt;

use crate::core::crypto::hash_with_domain;
use crate::core::error::{AuthError, AuthResult};

//===================================================================================================
// PRINCIPAL TYPE
//===================================================================================================

/// Represents a validated IC Principal for Oisy authentication
#[derive(Clone, Debug, PartialEq, Eq, Hash, CandidType, Deserialize, Serialize)]
pub struct OISYPrincipal(Principal);

//===================================================================================================
// STORABLE IMPLEMENTATION
//===================================================================================================

impl Storable for OISYPrincipal {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        candid::encode_one(self)
            .expect("Failed to serialize OISYPrincipal: should never fail for valid principals")
            .into()
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes)
            .expect("Failed to deserialize OISYPrincipal: stable storage may be corrupted")
    }

    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(&self)
            .expect("Failed to serialize OISYPrincipal: should never fail for valid principals")
    }

    const BOUND: Bound = Bound::Unbounded;
}

//===================================================================================================
// PRINCIPAL IMPLEMENTATION
//===================================================================================================

impl OISYPrincipal {
    /// Create a new OISYPrincipal from an IC Principal
    ///
    /// # Parameters
    /// * `principal` - IC Principal to validate
    ///
    /// # Returns
    /// * `AuthResult<OISYPrincipal>` - Validated principal or validation error
    ///
    /// # Usage
    /// ```rust
    /// let principal = OISYPrincipal::new(ic_cdk::caller())?;
    /// ```
    pub fn new(principal: Principal) -> AuthResult<Self> {
        // Validate the principal is not anonymous
        if principal == Principal::anonymous() {
            return Err(AuthError::ValidationError(
                "Anonymous principal not allowed for authentication".to_string(),
            ));
        }

        Ok(OISYPrincipal(principal))
    }

    /// Get the IC Principal
    pub fn principal(&self) -> Principal {
        self.0
    }

    /// Convert principal to string representation
    pub fn to_string(&self) -> String {
        self.0.to_text()
    }

    /// Generate seed hash for IC delegation using domain separation
    ///
    /// # Parameters
    /// * `salt` - Salt from settings for additional entropy
    ///
    /// # Returns
    /// * `[u8; 32]` - Domain-separated hash for IC principal derivation
    ///
    /// # Usage
    /// ```rust
    /// let seed_hash = principal.as_seed(&settings.salt);
    /// ```
    pub fn as_seed(&self, salt: &str) -> [u8; 32] {
        let principal_bytes = self.0.as_slice();
        let input = [principal_bytes, salt.as_bytes()].concat();

        // Use domain separation to prevent cross-context attacks
        hash_with_domain(b"OISY_SIWO_SEED_v1", &input)
    }

    /// Convert to bytes for hashing operations
    pub fn as_bytes(&self) -> &[u8] {
        self.0.as_slice()
    }
}

//===================================================================================================
// DISPLAY IMPLEMENTATION
//===================================================================================================

impl fmt::Display for OISYPrincipal {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0.to_text())
    }
}

//===================================================================================================
// FROM IMPLEMENTATIONS
//===================================================================================================

impl From<Principal> for OISYPrincipal {
    fn from(principal: Principal) -> Self {
        Self::new(principal).expect("Principal validation should not fail")
    }
}

impl From<OISYPrincipal> for Principal {
    fn from(oisy_principal: OISYPrincipal) -> Self {
        oisy_principal.0
    }
}
