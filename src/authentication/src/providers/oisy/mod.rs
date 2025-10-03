/// Oisy authentication provider
/// Implements the complete SIWO (Sign-In with Oisy) flow using ICRC-21 standard
// ICRC-21 standard for consent messages
pub mod icrc21;

// Type system
pub mod types;

// Implementation modules
pub mod settings;
pub mod siwo_delegation;
pub mod siwo_login;
