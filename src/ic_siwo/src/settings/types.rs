
use candid::{CandidType, Principal};

/// Represents the settings for initializing Oisy authentication.
///
/// This struct is used to configure Sign-In With Oisy functionality.
/// It includes settings such as domain, scheme, statement, and expiration times for sessions and sign-ins.
///
/// Use the [`SettingsBuilder`] to create a new instance of `Settings` to validate inputs and use default values.
///
/// The Oisy authentication library needs to be initialized with a `Settings` instance before it can be used. Call the [`crate::init()`] function
/// to initialize the library.
#[derive(Default, Debug, Clone, CandidType)]
pub struct Settings {
    /// The domain from where the frontend that uses Oisy authentication is served.
    pub domain: String,

    /// The full URI, potentially including port number of the frontend that uses Oisy authentication.
    pub uri: String,

    /// The salt is used when generating the seed that uniquely identifies each user principal. The salt can only contain
    /// printable ASCII characters.
    pub salt: String,

    // The scheme used to serve the frontend that uses Oisy authentication. Defaults to "https".
    pub scheme: String,

    /// The statement is a message or declaration presented to the user during authentication
    pub statement: String,

    /// The TTL for a challenge in nanoseconds. After this time, the challenge will be pruned.
    pub challenge_expires_in: u64,

    /// The TTL for a session in nanoseconds.
    pub session_expires_in: u64,

    /// The list of canisters for which the identity delegation is allowed. Defaults to None, which means
    /// that the delegation is allowed for all canisters.
    pub targets: Option<Vec<Principal>>,

}
