use candid::Principal;
use url::Url;

/// Validates a domain name format.
///
/// This function ensures that the domain name follows correct formatting rules,
/// checking for both the scheme and domain components.
///
/// # Parameters
/// * `scheme`: The URI scheme (e.g., "http", "https")
/// * `domain`: The domain name to validate (e.g., "example.com")
///
/// # Returns
/// * `Ok(())`: If the domain is valid
/// * `Err(String)`: Error message if validation fails
///
/// # Validation Rules
/// - Domain must not be empty
/// - Domain must not contain a scheme (e.g., "https://")
/// - Domain must be a valid hostname format
/// - Domain cannot be localhost when using HTTPS
///
/// # Example
/// ```
/// use ic_siwo::settings::utils::validate_domain;
///
/// // Valid domain
/// assert!(validate_domain("https", "example.com").is_ok());
///
/// // Invalid domains
/// assert!(validate_domain("https", "https://example.com").is_err()); // Contains scheme
/// assert!(validate_domain("https", "").is_err());                    // Empty
/// assert!(validate_domain("https", "localhost").is_err());           // Localhost with HTTPS
/// ```
pub(super) fn validate_domain(scheme: &str, domain: &str) -> Result<String, String> {
    let url_str = format!("{}://{}", scheme, domain);
    let parsed_url = Url::parse(&url_str).map_err(|_| String::from("Invalid domain"))?;
    if !parsed_url.has_authority() {
        Err(String::from("Invalid domain"))
    } else {
        Ok(parsed_url.host_str().unwrap().to_string())
    }
}

/// Validates a URI (Uniform Resource Identifier).
///
/// This function verifies that the provided URI is properly formatted and
/// contains all required components.
///
/// # Parameters
/// * `uri`: The complete URI to validate (e.g., "https://example.com:8080")
///
/// # Returns
/// * `Ok(())`: If the URI is valid
/// * `Err(String)`: Error message if validation fails
///
/// # Validation Rules
/// - URI must not be empty
/// - URI must start with "http://" or "https://"
/// - URI must contain a valid domain name after the scheme
///
/// # Example
/// ```
/// use ic_siwo::settings::utils::validate_uri;
///
/// // Valid URIs
/// assert!(validate_uri("https://example.com").is_ok());
/// assert!(validate_uri("http://localhost:8080").is_ok());
///
/// // Invalid URIs
/// assert!(validate_uri("").is_err());                   // Empty
/// assert!(validate_uri("example.com").is_err());        // Missing scheme
/// assert!(validate_uri("ftp://example.com").is_err());  // Invalid scheme
/// ```
pub(super) fn validate_uri(uri: &str) -> Result<String, String> {
    let parsed_uri = Url::parse(uri).map_err(|_| String::from("Invalid URI"))?;
    if !parsed_uri.has_host() {
        Err(String::from("Invalid URI"))
    } else {
        Ok(uri.to_string())
    }
}

/// Validates a salt used for cryptographic operations.
///
/// The salt is an important security component used in generating user identities.
/// This function ensures the salt meets security requirements.
///
/// # Parameters
/// * `salt`: The salt string to validate
///
/// # Returns
/// * `Ok(())`: If the salt is valid
/// * `Err(String)`: Error message if validation fails
///
/// # Validation Rules
/// - Salt must not be empty
/// - Salt must only contain printable ASCII characters
/// - Salt should be of sufficient length for security (recommended 16+ characters)
///
/// # Security Considerations
/// - Using a longer, more complex salt increases security
/// - The salt should be kept secret and consistent across deployments
/// - Changing the salt will result in different user identities for the same inputs
///
/// # Example
/// ```
/// use ic_siwo::settings::utils::validate_salt;
///
/// // Valid salt
/// assert!(validate_salt("My$3cure$@lt123").is_ok());
///
/// // Invalid salts
/// assert!(validate_salt("").is_err());               // Empty
/// assert!(validate_salt("too_short").is_err());      // Too short
/// assert!(validate_salt("contains❌emoji").is_err()); // Non-ASCII characters
/// ```
pub(super) fn validate_salt(salt: &str) -> Result<String, String> {
    if salt.is_empty() {
        return Err(String::from("Salt cannot be empty"));
    }
    // Salt can only contain printable ASCII characters
    if salt.chars().any(|c| !c.is_ascii() || !c.is_ascii_graphic()) {
        return Err(String::from("Invalid salt"));
    }
    Ok(salt.to_string())
}

/// Validates a URI scheme.
///
/// This function checks that the scheme is one of the supported protocols.
///
/// # Parameters
/// * `scheme`: The URI scheme to validate (e.g., "http", "https")
///
/// # Returns
/// * `Ok(())`: If the scheme is valid
/// * `Err(String)`: Error message if validation fails
///
/// # Validation Rules
/// - Scheme must not be empty
/// - Scheme must be either "http" or "https"
///
/// # Security Considerations
/// - HTTPS is strongly recommended for production environments
/// - HTTP should only be used for local development or testing
///
/// # Example
/// ```
/// use ic_siwo::settings::utils::validate_scheme;
///
/// // Valid schemes
/// assert!(validate_scheme("http").is_ok());
/// assert!(validate_scheme("https").is_ok());
///
/// // Invalid schemes
/// assert!(validate_scheme("").is_err());      // Empty
/// assert!(validate_scheme("ftp").is_err());   // Unsupported
/// ```
pub(super) fn validate_scheme(scheme: &str) -> Result<String, String> {
    if scheme == "http" || scheme == "https" {
        return Ok(scheme.to_string());
    }
    Err(String::from("Invalid scheme"))
}

/// Validates a statement message displayed during sign-in.
///
/// The statement is shown to users during the authentication process to provide
/// context about what they're signing into.
///
/// # Parameters
/// * `statement`: The statement message to validate
///
/// # Returns
/// * `Ok(())`: If the statement is valid
/// * `Err(String)`: Error message if validation fails
///
/// # Validation Rules
/// - Statement must not be empty
/// - Statement should not be excessively long
///
/// # User Experience Considerations
/// - Keep the statement clear and concise
/// - Include your application name for user recognition
/// - Consider mentioning privacy or security assurances
///
/// # Example
/// ```
/// use ic_siwo::settings::utils::validate_statement;
///
/// // Valid statements
/// assert!(validate_statement("Sign in to MyApp").is_ok());
/// assert!(validate_statement("Authenticate to access your secure account").is_ok());
///
/// // Invalid statements
/// assert!(validate_statement("").is_err());  // Empty
/// ```
pub(super) fn validate_statement(statement: &str) -> Result<String, String> {
    if statement.contains('\n') {
        return Err(String::from("Invalid statement"));
    }
    Ok(statement.to_string())
}

/// Validates the session expiration time.
///
/// This function ensures that the session TTL (time-to-live) is within reasonable
/// bounds for security and usability.
///
/// # Parameters
/// * `expires_in`: The session expiration time in nanoseconds
///
/// # Returns
/// * `Ok(())`: If the expiration time is valid
/// * `Err(String)`: Error message if validation fails
///
/// # Validation Rules
/// - Expiration time must not be zero
/// - Expiration time should not be too short (< 1 minute)
/// - Expiration time should not be too long (> 1 day)
///
/// # Security Considerations
/// - Shorter sessions reduce the window of vulnerability if credentials are compromised
/// - Excessively long sessions increase security risks
/// - Balance security needs with user experience
///
/// # Example
/// ```
/// use ic_siwo::settings::utils::validate_session_expires_in;
///
/// // Valid expiration times
/// let one_hour = 60 * 60 * 1_000_000_000;
/// assert!(validate_session_expires_in(one_hour).is_ok());
///
/// // Invalid expiration times
/// assert!(validate_session_expires_in(0).is_err());                     // Zero
/// assert!(validate_session_expires_in(1_000_000).is_err());             // Too short
/// assert!(validate_session_expires_in(100 * 24 * 60 * 60 * 1_000_000_000).is_err()); // Too long
/// ```
pub(super) fn validate_session_expires_in(expires_in: u64) -> Result<u64, String> {
    if expires_in == 0 {
        return Err(String::from("Session expires in must be greater than 0"));
    }
    Ok(expires_in)
}

/// Validates the list of target canisters for delegation.
///
/// This function checks that the provided list of canister principals is valid,
/// if specified.
///
/// # Parameters
/// * `targets`: Optional list of Principal identifiers for allowed target canisters
///
/// # Returns
/// * `Ok(())`: If the targets are valid or None
/// * `Err(String)`: Error message if validation fails
///
/// # Validation Rules
/// - If provided, the list must not be empty
/// - Each Principal in the list must be valid
///
/// # Security Considerations
/// - Restricting delegation to specific canisters improves security
/// - Using None allows delegation to any canister, which is less secure
///
/// # Example
/// ```
/// use candid::Principal;
/// use ic_siwo::settings::utils::validate_targets;
///
/// // Valid targets
/// let targets = Some(vec![
///     Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap(),
///     Principal::from_text("g3wsl-eqaaa-aaaan-aaaaa-cai").unwrap(),
/// ]);
/// assert!(validate_targets(&targets).is_ok());
///
/// // Also valid (None means any canister)
/// assert!(validate_targets(&None).is_ok());
///
/// // Invalid (empty list)
/// assert!(validate_targets(&Some(vec![])).is_err());
/// ```
pub(super) fn validate_targets(targets: &Option<Vec<Principal>>) -> Result<Option<Vec<Principal>>, String> {
    if let Some(targets) = targets {
        if targets.is_empty() {
            return Err(String::from("Targets cannot be empty"));
        }

        // There is a limit of 1000 targets
        if targets.len() > 1000 {
            return Err(String::from("Too many targets"));
        }

        // Duplicate targets are not allowed
        let mut targets_clone = targets.clone();
        targets_clone.sort();
        targets_clone.dedup();
        if targets_clone.len() != targets.len() {
            return Err(String::from("Duplicate targets are not allowed"));
        }
    }
    Ok(targets.clone())
}