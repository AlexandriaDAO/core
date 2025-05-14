use candid::CandidType;
use serde::Deserialize;

/// Represents the settings that determine the behavior of the SIWO library. It includes settings such as domain, scheme, statement,
/// and expiration times for sessions and challenges.
#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct SettingsInput {
    /// The full domain, including subdomains, from where the frontend that uses SIWO is served.
    /// Example: "example.com" or "sub.example.com".
    pub domain: String,

    /// The full URI, potentially including port number of the frontend that uses SIWO.
    /// Example: "https://example.com" or "https://sub.example.com:8080".
    pub uri: String,

    /// The salt is used when generating the seed that uniquely identifies each user principal. The salt can only contain
    /// printable ASCII characters.
    pub salt: String,

    // The scheme used to serve the frontend that uses SIWO. Defaults to "https".
    pub scheme: Option<String>,

    /// The statement is a message or declaration, often presented to the user by the Oisy wallet
    pub statement: Option<String>,

    /// The TTL for a challenge in nanoseconds. After this time, the challenge will be pruned.
    pub challenge_expires_in: Option<u64>,

    /// The TTL for a session in nanoseconds.
    pub session_expires_in: Option<u64>,

    /// The list of canisters for which the identity delegation is allowed. Defaults to None, which means
    /// that the delegation is allowed for all canisters. If specified, the canister id of this canister must be in the list.
    pub targets: Option<Vec<String>>,
}
