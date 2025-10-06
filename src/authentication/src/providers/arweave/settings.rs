/// Arweave authentication settings with stable storage
/// Controls SIWA message format, session duration, and security parameters
use candid::{CandidType, Deserialize};
use ic_cdk::{query, update};
use ic_stable_structures::{StableCell, Storable};
use std::borrow::Cow;
use std::cell::RefCell;

use crate::core::storage::{get_memory, memory_ids, Memory};
use crate::core::time::{hours_to_nanos, minutes_to_nanos};
use crate::providers::arweave::types::constants;

/// Arweave authentication configuration
/// All SIWA message parameters and session controls
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ArweaveSettings {
    /// SIWA message validity in nanoseconds (default: 10 minutes)
    /// How long a prepared login message remains valid
    pub message_ttl: u64,

    /// User session duration in nanoseconds (default: 8 hours)
    /// How long users stay authenticated after successful login
    pub session_ttl: u64,

    /// Domain for SIWA messages (e.g., "myapp.com")
    /// Must match the domain where authentication requests originate
    pub domain: String,

    /// URI for SIWA messages (e.g., "https://myapp.com")
    /// Used in SIWA message construction
    pub uri: String,

    /// Cryptographic salt for seed generation
    /// Ensures user principals are unique to this canister
    pub salt: String,

    /// Arweave network (e.g., "mainnet", "testnet")
    /// For display purposes in SIWA message
    pub network: String,

    /// SIWA version (typically "1")
    /// Protocol version for SIWA message format
    pub version: String,

    /// Statement shown to users during signing
    /// Human-readable message explaining what they're signing
    pub statement: String,
}

impl Default for ArweaveSettings {
    fn default() -> Self {
        Self {
            message_ttl: minutes_to_nanos(10), // 10 minutes
            session_ttl: hours_to_nanos(8),    // 8 hours
            domain: "localhost:8080".to_string(),
            uri: "http://localhost:8080".to_string(),
            salt: "arweave-mulauth-salt".to_string(),
            network: constants::DEFAULT_NETWORK.to_string(), // "mainnet"
            version: constants::SIWA_VERSION.to_string(),    // "1"
            statement: "Sign in to authenticate with your Arweave wallet".to_string(),
        }
    }
}

impl Storable for ArweaveSettings {
    /// Serialize settings to bytes for stable storage
    fn to_bytes(&self) -> Cow<[u8]> {
        // Use Candid encoding for reliable serialization
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    /// Convert to owned bytes (required by trait)
    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(self).unwrap()
    }

    /// Deserialize settings from bytes
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        // Decode from Candid format
        candid::decode_one(&bytes).unwrap()
    }

    /// Calculate the bound for serialized size
    /// This is used for memory allocation optimization
    const BOUND: ic_stable_structures::storable::Bound =
        ic_stable_structures::storable::Bound::Unbounded;
}

// Stable storage for Arweave settings - survives canister upgrades
thread_local! {
    static AR_SETTINGS: RefCell<StableCell<ArweaveSettings, Memory>> = RefCell::new(
        StableCell::init(
            get_memory(memory_ids::ARWEAVE_SETTINGS),
            ArweaveSettings::default()
        )
    );
}

//===================================================================================================
// INTERNAL SETTINGS OPERATIONS (closure pattern for safe updates)
//===================================================================================================

impl ArweaveSettings {
    /// Get current Arweave settings (internal helper)
    ///
    /// This is a simple wrapper around the storage access.
    /// Used internally by other methods.
    pub fn get() -> Self {
        AR_SETTINGS.with(|s| s.borrow().get().clone())
    }

    /// Update Arweave settings with a closure pattern
    ///
    /// This provides **safe, atomic updates** of settings. Here's how it works:
    ///
    /// 1. **Get current settings** from stable storage
    /// 2. **Apply your closure** to modify them (you define what changes to make)
    /// 3. **Validate** the modified settings (ensures they're still valid)
    /// 4. **Save to storage** if validation passes
    /// 5. **Return updated settings** or error if validation failed
    ///
    /// **Why use this pattern?**
    /// - **Atomic**: Either all your changes succeed, or none do
    /// - **Safe**: Can't forget to validate or save
    /// - **Flexible**: You define exactly what to change
    /// - **Consistent**: Same pattern for any kind of update
    ///
    /// Usage examples:
    /// ```rust
    /// // Single field update
    /// let settings = ArweaveSettings::update(|s| {
    ///     s.domain = "newdomain.com".to_string();
    /// })?;
    ///
    /// // Multiple field update
    /// let settings = ArweaveSettings::update(|s| {
    ///     s.domain = "example.com".to_string();
    ///     s.session_ttl = hours_to_nanos(12);
    ///     s.network = "testnet".to_string();
    /// })?;
    /// ```
    fn update<F>(updater: F) -> Result<Self, String>
    where
        F: FnOnce(&mut Self), // F is a closure that takes &mut ArweaveSettings
    {
        AR_SETTINGS.with(|s| {
            let mut cell = s.borrow_mut();
            let mut settings = cell.get().clone();

            // Apply the user's closure to modify settings
            updater(&mut settings);

            // Validate the modified settings before saving
            Self::validate(&settings)?;

            // Save the validated settings back to stable storage
            cell.set(settings.clone());
            Ok(settings)
        })
    }

    /// Validate settings to ensure they're correct
    ///
    /// Returns Result so we can provide specific error messages
    /// about what's wrong, rather than just panicking.
    ///
    /// This gets called automatically by update(), but you could
    /// also call it manually if you want to check settings.
    fn validate(settings: &Self) -> Result<(), String> {
        if settings.domain.is_empty() {
            return Err("Domain cannot be empty".to_string());
        }

        if settings.uri.is_empty() {
            return Err("URI cannot be empty".to_string());
        }

        if settings.salt.is_empty() {
            return Err("Salt cannot be empty".to_string());
        }

        if settings.message_ttl == 0 {
            return Err("Message TTL must be greater than 0".to_string());
        }

        if settings.session_ttl == 0 {
            return Err("Session TTL must be greater than 0".to_string());
        }

        if settings.network.is_empty() {
            return Err("Network cannot be empty".to_string());
        }

        Ok(())
    }
}

//===================================================================================================
// IC CANISTER FUNCTIONS (dfx canister call)
//===================================================================================================

/// Get current Arweave authentication settings
/// Public read access for configuration queries
#[query]
pub fn get_arweave_settings() -> ArweaveSettings {
    ArweaveSettings::get()
}

/// Update Arweave authentication settings
/// Admin-only in production (currently open for development)
#[update]
pub fn update_arweave_settings(new_settings: ArweaveSettings) -> Result<String, String> {
    // TODO: Add admin authorization in production
    // if ic_cdk::caller() != admin_principal() {
    //     return Err("Admin access required".to_string());
    // }

    // Use the closure pattern to replace all settings
    ArweaveSettings::update(|settings| {
        *settings = new_settings;
    })?;

    Ok("Arweave settings updated successfully".to_string())
}

//===================================================================================================
// INTERNAL INITIALIZATION
//===================================================================================================

/// Initialize Arweave settings storage
/// Called during canister initialization
pub fn init_arweave_settings() -> Result<(), String> {
    // Settings are automatically initialized with defaults via thread_local
    // This function validates that initialization worked
    AR_SETTINGS.with(|s| {
        let cell = s.borrow();
        let settings = cell.get();
        if settings.domain.is_empty() {
            Err("Arweave settings initialization failed".to_string())
        } else {
            Ok(())
        }
    })
}
