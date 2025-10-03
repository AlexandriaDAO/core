/// Solana authentication provider
/// Implements the complete SIWS (Sign-In with Solana) flow
// Type system
pub mod types;

// Implementation modules
pub mod settings;
pub mod siws_delegation;
pub mod siws_login;
pub mod siws_message;
