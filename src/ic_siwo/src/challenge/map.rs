use candid::Principal;
use std::collections::HashMap;

use crate::utils::get_current_time;
use crate::challenge::types::{Challenge, ChallengeError};

// Maximum number of challenges per principal
const MAX_CHALLENGES_PER_PRINCIPAL: usize = 10;

/// Map structure to manage challenges by principal.
/// 
/// This structure handles the creation, verification, and cleanup of challenges
/// associated with different principals. It enforces a maximum limit of challenges
/// per principal and automatically prunes expired challenges.
///
/// # Example
/// ```
/// use candid::Principal;
/// use ic_siwo::challenge::map::ChallengeMap;
///
/// let mut challenge_map = ChallengeMap::new();
/// let principal = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
///
/// // Create a new challenge
/// let challenge = challenge_map.insert(&principal).unwrap();
/// 
/// // Verify a challenge
/// if challenge_map.verify(&principal, &challenge.nonce).is_ok() {
///     // Challenge is valid
/// }
///
/// // Remove a challenge after use
/// challenge_map.remove(&principal, &challenge.nonce);
/// ```
pub struct ChallengeMap {
    map: HashMap<Principal, Vec<Challenge>>,
}

impl ChallengeMap {
    /// Creates a new empty challenge map.
    ///
    /// # Returns
    /// A new `ChallengeMap` instance.
    pub fn new() -> Self {
        ChallengeMap {
            map: HashMap::new(),
        }
    }

    /// Adds a new challenge for the given principal.
    ///
    /// This method first prunes expired challenges, then generates a new challenge
    /// for the principal. If the number of challenges for this principal exceeds
    /// `MAX_CHALLENGES_PER_PRINCIPAL`, the oldest challenge is removed before
    /// adding the new one.
    ///
    /// # Parameters
    /// - `principal`: The principal to associate with the challenge
    ///
    /// # Returns
    /// - `Ok(Challenge)`: The newly created challenge
    /// - `Err(ChallengeError)`: If there was an error creating the challenge
    ///
    /// # Example
    /// ```
    /// let principal = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    /// let challenge = challenge_map.insert(&principal).unwrap();
    /// println!("New challenge created: {}", challenge.nonce);
    /// ```
    pub fn insert(&mut self, principal: &Principal) -> Result<Challenge, ChallengeError> {
        // Remove expired challenges first
        self.prune_expired();

        // Create new challenge with the auto generated nonce
        let challenge = Challenge::new();

        // Get or create the challenges vector for this principal
        let challenges = self.map.entry(*principal).or_insert_with(Vec::new);

        // Check if we've reached the maximum number of challenges
        if challenges.len() >= MAX_CHALLENGES_PER_PRINCIPAL {
            // Sort by creation time (oldest first)
            challenges.sort_by_key(|c| c.created_at);
            // Remove the oldest challenge if at the limit
            if !challenges.is_empty() {
                challenges.remove(0);
            }
        }

        // Add the new challenge
        let challenge_clone = challenge.clone();
        challenges.push(challenge);

        Ok(challenge_clone)
    }

    /// Verifies if a challenge is valid without consuming it.
    ///
    /// # Parameters
    /// - `principal`: The principal associated with the challenge
    /// - `nonce`: The nonce value to verify
    ///
    /// # Returns
    /// - `Ok(())`: If the challenge is valid and not expired
    /// - `Err(ChallengeError::ChallengeExpired)`: If the challenge exists but has expired
    /// - `Err(ChallengeError::ChallengeNotFound)`: If no matching challenge was found
    ///
    /// # Example
    /// ```
    /// match challenge_map.verify(&principal, &nonce) {
    ///     Ok(_) => println!("Challenge is valid"),
    ///     Err(ChallengeError::ChallengeExpired) => println!("Challenge has expired"),
    ///     Err(ChallengeError::ChallengeNotFound) => println!("Challenge not found"),
    ///     Err(_) => println!("Other error occurred"),
    /// }
    /// ```
    pub fn verify(&self, principal: &Principal, nonce: &str) -> Result<(), ChallengeError> {
        if let Some(challenges) = self.map.get(principal) {
            let current_time = get_current_time();

            // Find if there's a matching challenge that hasn't expired
            if challenges.iter().any(|c| c.nonce == nonce && c.expires_at > current_time) {
                return Ok(());
            }

            // Check if the challenge exists but is expired
            if challenges.iter().any(|c| c.nonce == nonce) {
                return Err(ChallengeError::ChallengeExpired);
            }
        }

        Err(ChallengeError::ChallengeNotFound)
    }

    /// Consumes and removes a challenge if it exists.
    ///
    /// This method removes a challenge with the specified nonce associated with
    /// the given principal. If no such challenge exists, this method does nothing.
    /// If this was the last challenge for the principal, the principal is removed
    /// from the map.
    ///
    /// # Parameters
    /// - `principal`: The principal associated with the challenge
    /// - `nonce`: The nonce of the challenge to remove
    ///
    /// # Example
    /// ```
    /// // After successfully using a challenge, remove it
    /// challenge_map.remove(&principal, &challenge.nonce);
    /// ```
    pub fn remove(&mut self, principal: &Principal, nonce: &str) {
        if let Some(challenges) = self.map.get_mut(principal) {
            // Find the position of the matching challenge regardless of expiration
            if let Some(pos) = challenges.iter().position(|c| c.nonce == nonce) {
                // Remove the challenge
                challenges.remove(pos);
            }

            // If there are no more challenges for this principal, remove the entry
            if challenges.is_empty() {
                self.map.remove(principal);
            }
        }
    }

    /// Retrieves a challenge without consuming it.
    ///
    /// # Parameters
    /// - `principal`: The principal associated with the challenge
    /// - `nonce`: The nonce of the challenge to retrieve
    ///
    /// # Returns
    /// - `Ok(Challenge)`: The challenge if found and not expired
    /// - `Err(ChallengeError::ChallengeExpired)`: If the challenge exists but has expired
    /// - `Err(ChallengeError::ChallengeNotFound)`: If no matching challenge was found
    ///
    /// # Example
    /// ```
    /// match challenge_map.get(&principal, &nonce) {
    ///     Ok(challenge) => {
    ///         println!("Found challenge: {}", challenge.nonce);
    ///         println!("Expires at: {}", challenge.expires_at);
    ///     },
    ///     Err(e) => println!("Error getting challenge: {:?}", e),
    /// }
    /// ```
    pub fn get(&self, principal: &Principal, nonce: &str) -> Result<Challenge, ChallengeError> {
        if let Some(challenges) = self.map.get(principal) {
            if let Some(challenge) = challenges.iter().find(|c| c.nonce == nonce) {
                if challenge.is_expired() {
                    return Err(ChallengeError::ChallengeExpired);
                }
                return Ok(challenge.clone());
            }
        }

        Err(ChallengeError::ChallengeNotFound)
    }

    /// Removes all expired challenges across all principals.
    ///
    /// This method is automatically called by `insert()` but can also be called
    /// manually to clean up the map. It removes all expired challenges and
    /// principals with no remaining challenges.
    ///
    /// # Example
    /// ```
    /// // Manually prune expired challenges
    /// challenge_map.prune_expired();
    /// ```
    pub fn prune_expired(&mut self) {
        let current_time = get_current_time();

        // Filter out expired challenges for each principal
        for challenges in self.map.values_mut() {
            challenges.retain(|challenge| challenge.expires_at > current_time);
        }

        // Remove principals with no challenges
        self.map.retain(|_, challenges| !challenges.is_empty());
    }

    /// Returns all challenges for a principal.
    ///
    /// # Parameters
    /// - `principal`: The principal whose challenges should be retrieved
    ///
    /// # Returns
    /// A vector of challenges for the principal, or an empty vector if none exist
    ///
    /// # Example
    /// ```
    /// let challenges = challenge_map.get_all(&principal);
    /// println!("Principal has {} active challenges", challenges.len());
    /// for challenge in challenges {
    ///     println!("Nonce: {}, Expires at: {}", challenge.nonce, challenge.expires_at);
    /// }
    /// ```
    pub fn get_all(&self, principal: &Principal) -> Vec<Challenge> {
        self.map.get(principal)
            .cloned()
            .unwrap_or_default()
    }

    /// Removes all challenges for a principal.
    ///
    /// # Parameters
    /// - `principal`: The principal whose challenges should be removed
    ///
    /// # Example
    /// ```
    /// // Remove all challenges for a principal
    /// challenge_map.clear(&principal);
    /// ```
    pub fn clear(&mut self, principal: &Principal) {
        self.map.remove(principal);
    }
}

impl Default for ChallengeMap {
    fn default() -> Self {
        Self::new()
    }
}
