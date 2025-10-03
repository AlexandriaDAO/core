/// Ethereum/MetaMask authentication provider
/// Implements the complete SIWE (Sign-In with Ethereum) flow
// Type system
pub mod types;

// Implementation modules
pub mod settings;
pub mod siwe_delegation;
pub mod siwe_login;
pub mod siwe_message;
