use regex::Regex;
use lazy_static::lazy_static;
use url::Url;
use crate::errors::user::UserError;

lazy_static! {
    /// Regular expression for validating usernames
    /// Must start with a letter, followed by letters, numbers, underscores, or hyphens
    static ref USERNAME_REGEX: Regex = Regex::new(r"^[a-zA-Z][a-zA-Z0-9_-]*$").unwrap();

    /// Regular expression for validating names
    /// Allows letters, numbers, spaces, hyphens, apostrophes, and periods
    static ref NAME_REGEX: Regex = Regex::new(r"^[\p{L}\p{N}\s\-'.]+$").unwrap();

 /// List of reserved usernames that cannot be used
 static ref RESERVED_USERNAMES: Vec<&'static str> = vec![
    "administrator",
    "moderator",
    "official",
    "support",
    "system",
    "library",
    "librarian",
    "publisher",
    "customer",
    "security",
    "helpdesk",
    "manager",
    "service",
    "account",
    "admin_user",
    "mod_user",
    "sys_admin",
    "bookstore",
    "feedback",
    "contact"
];

/// List of inappropriate terms that cannot be part of usernames
static ref INAPPROPRIATE_TERMS: Vec<&'static str> = vec![
    "abusive",
    "assault",
    "explicit",
    "harassment",
    "illegal",
    "malware",
    "obscene",
    "offensive",
    "phishing",
    "profane",
    "racist",
    "scammer",
    "spammer",
    "violence",
    "vulgar"
];}

pub struct ValidationConstants;

impl ValidationConstants {
    pub const MIN_USERNAME_LENGTH: usize = 6;  // Changed from 3
    pub const MAX_USERNAME_LENGTH: usize = 20;
    pub const MIN_NAME_LENGTH: usize = 2;
    pub const MAX_NAME_LENGTH: usize = 50;
}

/// Validates a username according to the system's rules
///
/// # Arguments
/// * `username` - The username to validate
///
/// # Returns
/// * `Ok(())` if the username is valid
/// * `Err(UserError)` if the username is invalid
///
/// # Example
/// ```rust
/// let result = validate_username("bookworm");
/// assert!(result.is_ok());
///
/// let result = validate_username("ab");  // Too short
/// assert!(result.is_err());
/// `

pub fn validate_username(username: &str) -> Result<(), UserError> {
    let username = username.trim().to_lowercase();

    if username.len() < ValidationConstants::MIN_USERNAME_LENGTH {
        return Err(UserError::UsernameTooShort);
    }
    if username.len() > ValidationConstants::MAX_USERNAME_LENGTH {
        return Err(UserError::UsernameTooLong);
    }

    if !USERNAME_REGEX.is_match(&username) {
        return Err(UserError::UsernameInvalidCharacters);
    }

    if RESERVED_USERNAMES.iter().any(|&reserved| username == reserved) {
        return Err(UserError::UsernameReserved);
    }

    if INAPPROPRIATE_TERMS.iter().any(|&term| username.contains(term)) {
        return Err(UserError::UsernameContainsInappropriate);
    }

    Ok(())
}


/// Validates a user's display name
///
/// # Example
/// ```rust
/// let result = validate_name("John Doe");
/// assert!(result.is_ok());
/// ```
pub fn validate_name(name: &str) -> Result<(), UserError> {
    let name = name.trim();

    if name.len() < ValidationConstants::MIN_NAME_LENGTH {
        return Err(UserError::NameTooShort);
    }

    if name.len() > ValidationConstants::MAX_NAME_LENGTH {
        return Err(UserError::NameTooLong);
    }

    if !NAME_REGEX.is_match(name) {
        return Err(UserError::NameContainsInvalidChars);
    }

    Ok(())
}


/// Validates an avatar URL
/// 
/// # Example
/// ```rust
/// let result = validate_avatar_url("https://example.com/avatar.jpg");
/// assert!(result.is_ok());
/// ```
pub fn validate_avatar_url(url: &str) -> Result<(), UserError> {
    let url = url.trim();
    let parsed_url = Url::parse(url).map_err(|_| UserError::AvatarUrlInvalid)?;

    if parsed_url.scheme() != "https" {
        return Err(UserError::AvatarUrlInvalid);
    }

    // Optional: Add allowed domains check
    // let host = parsed_url.host_str().ok_or(UserError::AvatarUrlInvalid)?;
    // if !ALLOWED_AVATAR_DOMAINS.contains(&host) {
    //     return Err(UserError::AvatarUrlInvalid);
    // }

    Ok(())
}