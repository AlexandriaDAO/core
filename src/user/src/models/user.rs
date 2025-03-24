use candid::{CandidType, Principal};
use ic_cdk::api::time;
use serde::{Deserialize, Serialize};

/// Represents a user's profile in the system
///
/// # Example
/// ```rust
/// let user = User {
///     principal: caller,
///     username: "bookworm",
///     name: Some("John Doe"),
///     avatar: Some("https://example.com/avatar.jpg"),
///     librarian: false,
///     created_at: 1234567890,
///     updated_at: Some(1234567890),
/// };
/// ```
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct User {
    pub principal: Principal,
    pub username: String,
    pub name: String,
    pub avatar: String,
    pub librarian: bool,
    pub created_at: u64,
    pub updated_at: u64,
}

impl User {
    pub fn new(principal: Principal, username: String) -> Self {
        let now = time();
        Self {
            principal,
            username,
            name: String::new(),
            avatar: String::new(),
            librarian: false,
            created_at: now,
            updated_at: now,
        }
    }
}


/// Request payload for user signup
///
/// # Example
/// ```rust
/// let request = SignupRequest {
///     username: "bookworm".to_string(),
/// };
/// ```
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct SignupRequest {
    pub username: String,
}

/// Request payload for updating user profile
///
/// # Example
/// ```rust
/// let request = UpdateUserRequest {
///     username: "bookworm".to_string(),
///     name: Some("John Doe".to_string()),
///     avatar: Some("https://example.com/avatar.jpg".to_string()),
/// };
/// ```
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UpdateUserRequest {
    pub username: String,
    pub name: Option<String>,
    pub avatar: Option<String>,
}

/// Response for username availability check
///
/// # Example
/// ```rust
/// let response = UsernameAvailabilityResponse {
///     username: "bookworm".to_string(),
///     available: true,
///     message: Some("Username is available".to_string()),
/// };
/// ```

#[derive(CandidType, Deserialize, Serialize, Debug)]
pub struct UsernameAvailabilityResponse {
    pub username: String,
    pub available: bool,
    pub message: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UserPrincipalInfo {
    pub principal: Principal,
    pub username: String,
}