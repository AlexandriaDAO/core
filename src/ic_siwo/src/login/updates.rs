use candid::Principal;
use ic_cdk::caller;
use serde_bytes::ByteBuf;

use crate::{challenge::types::{Challenge, ChallengeError}, hash, store::{CHALLENGES, STATE}};
use crate::{delegation::utils::{create_delegation, create_delegation_hash, create_user_canister_pubkey, generate_seed}, settings::types::Settings, utils::update_root_hash, with_settings, LoginDetails};

use super::{types::LoginError, utils::manage_ic_oisy_mappings};

/// Maximum number of signatures to prune during each login operation.
/// This limits the computational cost of signature cleanup.
const MAX_SIGS_TO_PRUNE: usize = 10;

/// Authenticates the user using Sign In With OISY (SIWO) protocol.
///
/// This function verifies the signature of the challenge, creates a delegation
/// for the session key, and returns login details for successful authentication.
/// This is the main authentication entry point for the SIWO protocol.
///
/// # Authentication Flow
/// 1. Client calls `siwo_challenge` to get a challenge with a nonce
/// 2. Client signs the challenge with their private key
/// 3. Client calls this function with the signature, session key, and nonce
/// 4. If verification succeeds, a delegation is created for the session key
/// 5. Client receives login details with expiration and user canister public key
///
/// # Parameters
/// - `signature`: Cryptographic signature of the challenge message
/// - `session_key`: Public key for the session (used to create a delegation)
/// - `nonce`: The nonce from the previously issued challenge
///
/// # Returns
/// - `Ok(LoginDetails)`: User's authentication details if login succeeds
/// - `Err(String)`: Error message if login fails
///
/// # Error Conditions
/// - Anonymous principal is not allowed to call this function
/// - Challenge not found, expired, or signature validation fails
/// - Issues with delegation creation or session key
///
/// # Example Usage (from a frontend)
/// ```javascript
/// // After getting a challenge and signing it with the user's private key
/// const loginResult = await canister.siwo_login(
///   signatureBytes,      // Signature of the challenge message
///   sessionPublicKey,    // Public key for this session
///   challenge.nonce      // Nonce from the challenge
/// );
///
/// if ('Ok' in loginResult) {
///   const { expiration, user_canister_pubkey } = loginResult.Ok;
///   console.log(`Login successful! Session expires at: ${new Date(Number(expiration/1000000n))}`);
///   
///   // Store the session information
///   localStorage.setItem('expiration', expiration.toString());
///   localStorage.setItem('userCanisterPubkey', user_canister_pubkey);
/// } else {
///   console.error(`Login failed: ${loginResult.Err}`);
/// }
/// ```
///
/// # Security Considerations
/// - The caller's principal must be authenticated (non-anonymous)
/// - The challenge signature is verified cryptographically
/// - Challenges are single-use and automatically consumed
/// - Expired challenges and signatures are regularly pruned
#[ic_cdk::update]
pub fn siwo_login(signature: ByteBuf, session_key: ByteBuf, nonce: String) -> Result<LoginDetails, String> {
    let oisy_principal = caller();
    if oisy_principal == Principal::anonymous() {
        return Err(LoginError::AnonymousNotAllowed.to_string());
    }

    let challenge = consume_challenge(
        oisy_principal,
        nonce,
        signature,
        session_key.clone()
    ).map_err(|e| e.to_string())?;

    login(session_key, challenge).map_err(|e| e.to_string())
}

/// Gets and consumes a challenge, removing it from storage whether valid or not.
///
/// This internal function retrieves a challenge for a principal and nonce,
/// verifies that it's valid and not expired, and removes it from storage
/// regardless of the verification outcome (to prevent replay attacks).
///
/// # Parameters
/// - `principal`: The principal identity that requested the challenge
/// - `nonce`: The unique nonce identifying the challenge
/// - `signature`: The cryptographic signature to verify
/// - `public_key`: The public key that should verify the signature
///
/// # Returns
/// - `Ok(Challenge)`: The validated challenge if signature verification succeeds
/// - `Err(LoginError)`: Error details if challenge validation fails
///
/// # Validation Steps
/// 1. Retrieve the challenge for the given principal and nonce
/// 2. Check if the challenge has expired
/// 3. Create the message that should have been signed (using nonce and principal)
/// 4. Verify the signature against this message using the provided public key
///
/// # Side Effects
/// - Expired challenges are pruned from storage
/// - The specified challenge is always removed from storage
///
/// # Security Notes
/// - Challenges are always consumed, preventing replay attacks
/// - Invalid signatures don't interrupt challenge cleanup
/// - Challenge expiration is strictly enforced
fn consume_challenge(
    principal: Principal,
    nonce: String,
    signature: ByteBuf,
    public_key: ByteBuf,
) -> Result<Challenge, LoginError> {
    CHALLENGES.with_borrow_mut(|challenges| {
        // Get the previously created challenge for current principal
        let challenge = challenges.get(&principal, &nonce).map_err(LoginError::ChallengeError)?;

        if challenge.is_expired() {
            return Err(LoginError::ChallengeError(ChallengeError::ChallengeExpired))
        }

        // Create the same JSON object that was signed on the frontend
        let message = serde_json::json!({
            "nonce": nonce,
            "sender": principal.to_text()
        });

        challenge.is_valid(message.to_string(), signature, public_key).map_err(LoginError::ChallengeError)?;

        // Prune any expired challenges from the state
        challenges.prune_expired();

        // Remove the challenge before processing - whether successful or not
        challenges.remove(&principal, &nonce);

        Ok(challenge)
    })
}

/// Handles the core login process after challenge verification.
///
/// This internal function creates a delegation for the session key,
/// adds it to the signature map, and returns login details for the user.
/// It's called after successful challenge verification.
///
/// # Parameters
/// - `session_key`: Public key for the session (used to create a delegation)
/// - `challenge`: The verified challenge that was consumed
///
/// # Returns
/// - `Ok(LoginDetails)`: User's authentication details if login succeeds
/// - `Err(LoginError)`: Error details if login process fails
///
/// # Process Flow
/// 1. Determine session expiration time based on settings
/// 2. Generate a unique seed for the delegation
/// 3. Create a delegation for the session key
/// 4. Add the delegation hash to the signature map
/// 5. Create the user canister public key
/// 6. Update root hash for the canister's certified state
/// 7. Store mappings between IC principal and OISY principal
///
/// # Example Return Value
/// ```
/// LoginDetails {
///     expiration: 1672531200000000000,  // Session expiration timestamp
///     user_canister_pubkey: ByteBuf,    // Canister-specific public key
/// }
/// ```
///
/// # Security Features
/// - Session expiration is enforced
/// - Expired signatures are pruned automatically
/// - Principal mappings maintain user identity across platforms
/// - Root hash updates ensure that delegations can be cryptographically verified
fn login(session_key: ByteBuf, challenge: Challenge) -> Result<LoginDetails, LoginError> {
    let oisy_principal = caller();

    // The delegation is valid for the duration of the session as defined in the settings.
    let expiration = with_settings!(|settings: &Settings| {
        // settings.session_expires_in
        challenge.created_at.saturating_add(settings.session_expires_in)
    });

    // The seed is what uniquely identifies the delegation. It is derived from the salt, the
    // principal and the challenge nonce.
    let seed = generate_seed(&oisy_principal);

    STATE.with(|state| {
        let signature_map = &mut *state.signature_map.borrow_mut();

        // Before adding the signature to the signature map, prune any expired signatures.
        signature_map.prune_expired(ic_cdk::api::time(), MAX_SIGS_TO_PRUNE);

        // Create the delegation and add its hash to the signature map. The seed is used as the map key.
        let delegation = create_delegation(session_key, expiration)?;
        let delegation_hash = create_delegation_hash(&delegation);
        signature_map.put(hash::hash_bytes(seed), delegation_hash);

        // Create the user canister public key from the seed. From this key, the client can derive the
        // user principal.
        let user_canister_pubkey = create_user_canister_pubkey(seed.to_vec())?;

        // Update the certified data of the canister due to changes in the signature map.
        update_root_hash(&state.asset_hashes.borrow(), signature_map);

        // Convert the user canister public key to a principal.
        let ic_principal: Principal = Principal::self_authenticating(&user_canister_pubkey);

        // Store the mapping of IC principal to Oisy Principal and vice versa if the settings allow it.
        manage_ic_oisy_mappings(&ic_principal, &oisy_principal);

        Ok(LoginDetails {
            expiration,
            user_canister_pubkey: ByteBuf::from(user_canister_pubkey),
        })
    })
}
