use candid::Principal;

use crate::store::{IC_OISY, OISY_IC};

/// Manages bidirectional mappings between Internet Computer principals and OISY principals.
///
/// This function establishes and maintains the relationship between a user's Internet
/// Computer (IC) principal identity and their OISY platform identity. It creates
/// bidirectional mappings that allow the system to translate between these two
/// identity systems in both directions.
///
/// # Identity Mapping System
/// The SIWO authentication system maintains two mapping tables:
/// - IC → OISY: Maps from Internet Computer principals to OISY principals
/// - OISY → IC: Maps from OISY principals to Internet Computer principals
///
/// These mappings enable the system to:
/// 1. Look up a user's OISY identity from their IC principal
/// 2. Look up a user's IC principal from their OISY identity
/// 3. Maintain consistent user identity across different authentication contexts
///
/// # Parameters
/// - `ic_principal`: The Internet Computer principal identity
/// - `oisy_principal`: The OISY platform principal identity
///
/// # Example
/// ```
/// use candid::Principal;
/// use ic_siwo::login::utils::manage_ic_oisy_mappings;
///
/// // After successful authentication, store the mapping
/// let ic_principal = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
/// let oisy_principal = Principal::from_text("un4fu-tqaaa-aaaab-qadjq-cai").unwrap();
///
/// // Create bidirectional mappings
/// manage_ic_oisy_mappings(&ic_principal, &oisy_principal);
///
/// // Now the system can translate between identities in either direction
/// ```
///
/// # Implementation Details
/// This function uses thread-local storage with cell borrowing to safely update
/// the mapping collections. The mappings are stored in HashMaps that persist
/// for the lifetime of the canister.
///
/// # Security Considerations
/// - These mappings are stored in canister memory and persist across upgrades
/// - Only authenticated users should be able to create these mappings
/// - The mappings allow cross-referencing identities, which could have privacy implications
pub(super) fn manage_ic_oisy_mappings(ic_principal: &Principal, oisy_principal: &Principal) {
    // Store IC → OISY mapping
    IC_OISY.with(|io| {
        io.borrow_mut().insert(*ic_principal, *oisy_principal);
    });

    // Store OISY → IC mapping
    OISY_IC.with(|oi| {
        oi.borrow_mut().insert(*oisy_principal, *ic_principal);
    });
}