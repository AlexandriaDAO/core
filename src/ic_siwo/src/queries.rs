use ic_cdk::query;
use candid::Principal;
use serde_bytes::ByteBuf;

use crate::store::{IC_OISY, OISY_IC};


#[query]
pub fn whoami() -> Principal {
    ic_cdk::caller()
}


/// Retrieves the OISY principal associated with the caller's IC principal.
///
/// This query function provides a convenient way for a caller to discover their
/// associated OISY principal identity. It uses the caller's IC principal to look up
/// the corresponding OISY principal in the mapping maintained by the system.
///
/// # Authentication Context
/// This function is part of the identity mapping system that maintains bidirectional
/// relationships between Internet Computer principals and OISY principals. It helps
/// applications translate between these two identity systems.
///
/// # Returns
/// * `Ok(Principal)` - The caller's OISY principal if found in the mapping.
/// * `Err(String)` - An error message if no mapping exists for the caller.
///
/// # Example
/// ```javascript
/// // In a frontend application:
/// const result = await canister.get_caller_oisy_principal();
/// if ('Ok' in result) {
///   console.log(`Your OISY principal is: ${result.Ok.toText()}`);
/// } else {
///   console.error(`Error: ${result.Err}`);
/// }
/// ```
///
/// # Use Cases
/// - Allowing users to see their OISY identity
/// - Integrating with OISY-specific services
/// - Verifying cross-platform identity relationships
#[query]
fn get_caller_oisy_principal() -> Result<Principal, String> {
    let principal = ic_cdk::caller();
    get_oisy_principal(principal)
}

/// Retrieves the IC principal associated with a given OISY principal.
///
/// This query function looks up the Internet Computer principal corresponding
/// to a provided OISY principal. It's useful for cross-referencing identities
/// between the two systems.
///
/// # Parameters
/// * `oisy_principal`: The OISY principal to look up.
///
/// # Returns
/// * `Ok(ByteBuf)` - The IC principal as bytes if found.
/// * `Err(String)` - An error message if no mapping exists.
///
/// # Implementation Note
/// The function returns the IC principal as a ByteBuf (rather than a Principal type)
/// to maintain compatibility with certain cross-platform integrations.
///
/// # Example
/// ```javascript
/// // Given an OISY principal
/// const oisyPrincipal = Principal.fromText("un4fu-tqaaa-aaaab-qadjq-cai");
/// 
/// // Look up the corresponding IC principal
/// const result = await canister.get_ic_principal(oisyPrincipal);
/// if ('Ok' in result) {
///   // Convert the ByteBuf to a Principal
///   const icPrincipal = Principal.fromUint8Array(result.Ok);
///   console.log(`Corresponding IC principal: ${icPrincipal.toText()}`);
/// } else {
///   console.error(`Error: ${result.Err}`);
/// }
/// ```
///
/// # Security Consideration
/// This mapping is publicly queryable, which allows looking up the relationship
/// between OISY and IC principals. Applications should consider this when designing
/// their privacy model.
#[query]
fn get_ic_principal(oisy_principal: Principal) -> Result<ByteBuf, String> {
    OISY_IC.with(|ap| {
        ap.borrow().get(&oisy_principal).map_or(
            Err("No IC Principal found for the given Oisy Principal".to_string()),
            |p| Ok(ByteBuf::from(p.as_ref().to_vec())),
        )
    })
}

/// Retrieves the OISY principal associated with a given IC principal.
///
/// This internal helper function looks up the OISY principal corresponding
/// to a provided IC principal. It's used both by the `get_caller_oisy_principal`
/// query and potentially by other internal functions.
///
/// # Parameters
/// * `principal`: The IC principal to look up.
///
/// # Returns
/// * `Ok(Principal)` - The corresponding OISY principal if found.
/// * `Err(String)` - An error message if no mapping exists.
///
/// # Implementation Details
/// This function accesses the IC_OISY thread-local storage to look up the mapping.
/// It provides a consistent way to translate from IC to OISY identities throughout
/// the system.
///
/// # Example (Internal Usage)
/// ```
/// use candid::Principal;
/// use crate::queries::get_oisy_principal;
///
/// // Given an IC principal
/// let ic_principal = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
/// 
/// // Look up the corresponding OISY principal
/// match get_oisy_principal(ic_principal) {
///     Ok(oisy_principal) => {
///         // Use the OISY principal for some operation
///         println!("Found OISY principal: {}", oisy_principal);
///     },
///     Err(e) => println!("Lookup failed: {}", e),
/// }
/// ```
#[query]
pub(crate) fn get_oisy_principal(principal: Principal) -> Result<Principal, String> {
    let oisy_principal = IC_OISY.with(|ic_oisy| {
        ic_oisy.borrow().get(&principal).map_or(
            Err("No OISY Principal found for the given IC Principal".to_string()),
            |o| Ok(o),
        )
    })?;

    Ok(oisy_principal)
}
