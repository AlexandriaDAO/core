use ic_cdk::update;
use candid::Principal;

use crate::store::CHALLENGES;

use super::types::{Challenge, ChallengeError};

/// Creates a new challenge for the specified principal.
///
/// This canister update method generates a new challenge associated with the
/// provided principal. The challenge contains a secure random nonce that can be
/// used in signature-based authentication flows.
///
/// # Parameters
/// - `principal`: The Internet Computer principal for which to create a challenge
///
/// # Returns
/// - `Ok(Challenge)`: A new challenge with a random nonce and expiration time
/// - `Err(ChallengeError)`: If the challenge creation failed
///
/// # Example Usage (from a frontend)
/// ```javascript
/// // In a frontend application:
/// const challengeResult = await canister.siwo_challenge(userPrincipal);
/// if ('Ok' in challengeResult) {
///   const challenge = challengeResult.Ok;
///   console.log(`Got challenge: ${challenge.nonce}`);
///   console.log(`Challenge expires at: ${challenge.expires_at}`);
///
///   // The challenge can now be used in a signature verification flow
///   // where the user signs the challenge nonce with their private key
/// } else {
///   console.error(`Error getting challenge: ${challengeResult.Err}`);
/// }
/// ```
///
/// # Notes
/// - Each principal has a limited number of active challenges (typically 10)
/// - The oldest challenges are automatically pruned when this limit is reached
/// - Challenges automatically expire after a configured time period
#[update]
fn siwo_challenge(principal: Principal) -> Result<Challenge, ChallengeError> {
    CHALLENGES.with_borrow_mut(|challenges| {
        match challenges.insert(&principal) {
            Ok(challenge) => Ok(challenge),
            Err(e) => Err(e.into()),
        }
    })
}