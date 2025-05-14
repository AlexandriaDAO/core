use candid::Principal;

use super::types::Settings;
use super::utils::*;

/// Default HTTPS scheme for frontend URIs.
const DEFAULT_SCHEME: &str = "https";

/// Default statement message displayed during sign-in.
const DEFAULT_STATEMENT: &str = "Oisy Sign-In:";

/// Default time-to-live for challenges in nanoseconds (5 minutes).
const DEFAULT_CHALLENGE_EXPIRES_IN: u64 = 60 * 5 * 1_000_000_000; // 5 minutes

/// Default time-to-live for sessions in nanoseconds (30 minutes).
const DEFAULT_SESSION_EXPIRES_IN: u64 = 30 * 60 * 1_000_000_000; // 30 minutes

/// A builder for creating `Settings` instances.
///
/// This builder provides a flexible way to configure and initialize the settings for Oisy authentication.
/// It allows for setting various parameters like domain, URI, salt, and expiration times for sessions and sign-ins.
///
/// # Design Pattern
/// This implements the Builder pattern, which separates the construction of a complex object
/// from its representation, allowing the same construction process to create different representations.
///
/// # Default Values
/// - `scheme`: "https"
/// - `statement`: "Oisy Sign-In:"
/// - `challenge_expires_in`: 5 minutes (in nanoseconds)
/// - `session_expires_in`: 30 minutes (in nanoseconds)
/// - `targets`: None (delegation allowed for any canister)
///
/// # Examples
///
/// Basic usage:
///
/// ```
/// use oisy::settings::{Settings, SettingsBuilder};
///
/// let builder = SettingsBuilder::new("example.com", "http://example.com", "some_salt")
///     .scheme("https")
///     .statement("Sign in to access your account")
///     .challenge_expires_in(300_000_000_000)  // 5 minutes in nanoseconds
///     .session_expires_in(1_800_000_000_000); // 30 minutes in nanoseconds
///
/// let settings: Settings = builder.build().expect("Failed to create settings");
/// ```
///
/// This will create a `Settings` instance with the specified domain, URI, salt, and other configuration parameters.
pub struct SettingsBuilder {
    /// The settings being constructed
    settings: Settings,
}

impl SettingsBuilder {
    /// Creates a new `SettingsBuilder` with the specified domain, URI, and salt.
    /// This is the starting point for building a `Settings` struct.
    ///
    /// # Parameters
    ///
    /// * `domain`: The domain from where the frontend that uses Oisy authentication is served.
    ///   This is the hostname portion of the URI, without protocol or port.
    ///
    /// * `uri`: The full URI, potentially including port number of the frontend that uses Oisy authentication.
    ///   This is the complete URL that users will access to use your application.
    ///
    /// * `salt`: The salt is used when generating the seed that uniquely identifies each user principal.
    ///   This should be a secret, application-specific value that adds entropy to user identities.
    ///
    /// # Returns
    /// A new `SettingsBuilder` instance with default values for all other settings.
    ///
    /// # Example
    /// ```
    /// use oisy::settings::SettingsBuilder;
    ///
    /// let builder = SettingsBuilder::new(
    ///     "myapp.icp.network",               // domain
    ///     "https://myapp.icp.network:443",   // uri
    ///     "myCx8GHIghly-securE-salt-value"   // salt
    /// );
    /// ```
    pub fn new<S: Into<String>, T: Into<String>, U: Into<String>>(
        domain: S,
        uri: T,
        salt: U,
    ) -> Self {
        SettingsBuilder {
            settings: Settings {
                domain: domain.into(),
                uri: uri.into(),
                salt: salt.into(),
                scheme: DEFAULT_SCHEME.to_string(),
                statement: DEFAULT_STATEMENT.to_string(),
                challenge_expires_in: DEFAULT_CHALLENGE_EXPIRES_IN,
                session_expires_in: DEFAULT_SESSION_EXPIRES_IN,
                targets: None,
            },
        }
    }

    /// Sets the scheme used to serve the frontend that uses Oisy authentication.
    ///
    /// The `scheme` is typically "http" or "https", defining the protocol part of the URI.
    /// It's recommended to use "https" in production environments for security.
    ///
    /// # Parameters
    /// * `scheme`: The URI scheme, typically "http" or "https"
    ///
    /// # Returns
    /// The builder instance for method chaining
    ///
    /// # Default
    /// "https"
    ///
    /// # Example
    /// ```
    /// let builder = SettingsBuilder::new("example.com", "https://example.com", "salt")
    ///     .scheme("http"); // Only use http for development/testing
    /// ```
    pub fn scheme<S: Into<String>>(mut self, scheme: S) -> Self {
        self.settings.scheme = scheme.into();
        self
    }

    /// Sets the statement message shown during the sign-in process.
    ///
    /// The `statement` is a message or declaration, often presented to the user
    /// during the sign-in process to explain what they're authenticating to.
    ///
    /// # Parameters
    /// * `statement`: The text message to display during sign-in
    ///
    /// # Returns
    /// The builder instance for method chaining
    ///
    /// # Default
    /// "Oisy Sign-In:"
    ///
    /// # Example
    /// ```
    /// let builder = SettingsBuilder::new("example.com", "https://example.com", "salt")
    ///     .statement("Sign in to MyApp - Your data remains private and secure");
    /// ```
    pub fn statement<S: Into<String>>(mut self, statement: S) -> Self {
        self.settings.statement = statement.into();
        self
    }

    /// Sets the time-to-live for authentication challenges.
    ///
    /// Challenges are valid for a limited time, after which they expire. The `challenge_expires_in` value is
    /// the time-to-live (TTL) for a challenge in nanoseconds.
    ///
    /// # Parameters
    /// * `expires_in`: The challenge TTL in nanoseconds
    ///
    /// # Returns
    /// The builder instance for method chaining
    ///
    /// # Default
    /// 5 minutes (300,000,000,000 nanoseconds)
    ///
    /// # Example
    /// ```
    /// let builder = SettingsBuilder::new("example.com", "https://example.com", "salt")
    ///     // Set challenge expiration to 2 minutes
    ///     .challenge_expires_in(2 * 60 * 1_000_000_000);
    /// ```
    ///
    /// # Security Considerations
    /// - Shorter durations increase security but may inconvenience users
    /// - Longer durations are more convenient but increase the window for potential replay attacks
    pub fn challenge_expires_in(mut self, expires_in: u64) -> Self {
        self.settings.challenge_expires_in = expires_in;
        self
    }

    /// Sets the time-to-live for authenticated sessions.
    ///
    /// Sessions (as represented by delegated identities) are valid for a limited time, after which they expire.
    /// The `session_expires_in` value is the time-to-live (TTL) for a session in nanoseconds.
    ///
    /// # Parameters
    /// * `expires_in`: The session TTL in nanoseconds
    ///
    /// # Returns
    /// The builder instance for method chaining
    ///
    /// # Default
    /// 30 minutes (1,800,000,000,000 nanoseconds)
    ///
    /// # Example
    /// ```
    /// let builder = SettingsBuilder::new("example.com", "https://example.com", "salt")
    ///     // Set session expiration to 1 hour
    ///     .session_expires_in(60 * 60 * 1_000_000_000);
    /// ```
    ///
    /// # Security Considerations
    /// - Shorter durations increase security but require users to authenticate more frequently
    /// - Longer durations improve user experience but increase the window of vulnerability if credentials are compromised
    pub fn session_expires_in(mut self, expires_in: u64) -> Self {
        self.settings.session_expires_in = expires_in;
        self
    }

    /// Sets the list of canister targets for delegation.
    ///
    /// The `targets` is a list of `Principal`s representing the canisters where the delegated identity can be used to
    /// authenticate the user. When set, this restricts the delegation to only be valid for the specified canisters.
    ///
    /// # Parameters
    /// * `targets`: Vector of Principal identifiers for allowed target canisters
    ///
    /// # Returns
    /// The builder instance for method chaining
    ///
    /// # Default
    /// None (delegation allowed for any canister)
    ///
    /// # Example
    /// ```
    /// use candid::Principal;
    /// let builder = SettingsBuilder::new("example.com", "https://example.com", "salt")
    ///     .targets(vec![
    ///         Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap(),
    ///         Principal::from_text("g3wsl-eqaaa-aaaan-aaaaa-cai").unwrap(),
    ///     ]);
    /// ```
    ///
    /// # Security Considerations
    /// - Restricting targets limits the potential impact if a delegation is compromised
    /// - Using None allows delegation for any canister, which is convenient but less secure
    pub fn targets(mut self, targets: Vec<Principal>) -> Self {
        self.settings.targets = Some(targets);
        self
    }

    /// Validates and builds the final `Settings` instance.
    ///
    /// This method performs validation on all settings and constructs the final
    /// `Settings` struct if all validations pass. It checks domain format, URI validity,
    /// salt length, scheme validity, and expiration times.
    ///
    /// # Returns
    /// - `Ok(Settings)`: The validated settings instance
    /// - `Err(String)`: Error message describing validation failures
    ///
    /// # Validation Checks
    /// - Domain must be a valid domain name format
    /// - URI must be a valid URL format
    /// - Salt must not be empty and should be sufficiently long
    /// - Scheme must be either "http" or "https"
    /// - Statement must not be empty
    /// - Session expiration must be reasonable (not too short or too long)
    /// - Targets must be valid principals (if specified)
    ///
    /// # Example
    /// ```
    /// match builder.build() {
    ///     Ok(settings) => {
    ///         // Use settings to initialize authentication system
    ///         println!("Successfully created settings");
    ///     },
    ///     Err(error) => {
    ///         println!("Failed to create settings: {}", error);
    ///         // Handle validation error
    ///     }
    /// }
    /// ```
    pub fn build(self) -> Result<Settings, String> {
        validate_domain(&self.settings.scheme, &self.settings.domain)?;
        validate_uri(&self.settings.uri)?;
        validate_salt(&self.settings.salt)?;
        validate_scheme(&self.settings.scheme)?;
        validate_statement(&self.settings.statement)?;
        validate_session_expires_in(self.settings.session_expires_in)?;
        validate_targets(&self.settings.targets)?;

        Ok(self.settings)
    }
}
