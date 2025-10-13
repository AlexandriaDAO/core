/// Oisy authentication settings with stable storage
/// Controls session duration and security parameters for SIWO authentication
use candid::{CandidType, Deserialize};
use ic_cdk::{query, update};
use ic_stable_structures::{StableCell, Storable};
use std::borrow::Cow;
use std::cell::RefCell;

use crate::core::storage::{get_memory, memory_ids, Memory};
use crate::core::time::hours_to_nanos;
use crate::providers::oisy::types::constants;

/// Oisy authentication configuration
/// Session controls and security parameters for SIWO
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct OisySettings {
    /// User session duration in nanoseconds (default: 8 hours)
    /// How long users stay authenticated after successful login
    pub session_ttl: u64,

    /// Domain for SIWO authentication (e.g., "oisy.app")
    /// Used for display purposes in ICRC-21 consent messages
    pub domain: String,

    /// URI for SIWO authentication (e.g., "https://oisy.app")
    /// Used for display purposes in ICRC-21 consent messages
    pub uri: String,

    /// Cryptographic salt for seed generation
    /// Ensures user principals are unique to this canister
    pub salt: String,

    /// SIWO version (typically "1")
    /// Protocol version for SIWO authentication
    pub version: String,

    /// Statement shown to users during authentication
    /// Human-readable message explaining the authentication
    pub statement: String,
}

impl Default for OisySettings {
    fn default() -> Self {
        Self {
            session_ttl: hours_to_nanos(8), // 8 hours
            domain: constants::DEFAULT_DOMAIN.to_string(),
            uri: constants::DEFAULT_URI.to_string(),
            salt: "oisy-mulauth-salt".to_string(),
            version: constants::SIWO_VERSION.to_string(),
            statement: constants::DEFAULT_STATEMENT.to_string(),
        }
    }
}

impl Storable for OisySettings {
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

// Stable storage for Oisy settings - survives canister upgrades
thread_local! {
    static OISY_SETTINGS: RefCell<StableCell<OisySettings, Memory>> = RefCell::new(
        StableCell::init(
            get_memory(memory_ids::OISY_SETTINGS),
            OisySettings::default()
        )
    );
}

//===================================================================================================
// INTERNAL SETTINGS OPERATIONS (closure pattern for safe updates)
//===================================================================================================

impl OisySettings {
    /// Get current Oisy settings (internal helper)
    ///
    /// This is a simple wrapper around the storage access.
    /// Used internally by other methods.
    pub fn get() -> Self {
        OISY_SETTINGS.with(|s| s.borrow().get().clone())
    }

    /// Update Oisy settings with a closure pattern
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
    /// let settings = OisySettings::update(|s| {
    ///     s.domain = "newdomain.com".to_string();
    /// })?;
    ///
    /// // Multiple field update
    /// let settings = OisySettings::update(|s| {
    ///     s.domain = "example.com".to_string();
    ///     s.session_ttl = hours_to_nanos(12);
    /// })?;
    /// ```
    fn update<F>(updater: F) -> Result<Self, String>
    where
        F: FnOnce(&mut Self), // F is a closure that takes &mut OisySettings
    {
        OISY_SETTINGS.with(|s| {
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

        if settings.session_ttl == 0 {
            return Err("Session TTL must be greater than 0".to_string());
        }

        if settings.version.is_empty() {
            return Err("Version cannot be empty".to_string());
        }

        if settings.statement.is_empty() {
            return Err("Statement cannot be empty".to_string());
        }

        Ok(())
    }
}

//===================================================================================================
// IC CANISTER FUNCTIONS (dfx canister call)
//===================================================================================================

// /// Get current Oisy authentication settings
// /// Public read access for configuration queries
// #[query]
// pub fn get_oisy_settings() -> OisySettings {
//     OisySettings::get()
// }

/// Update Oisy authentication settings
/// Admin-only in production (currently open for development)
#[update]
pub fn update_oisy_settings(new_settings: OisySettings) -> Result<String, String> {
    // TODO: Add admin authorization in production
    // if ic_cdk::caller() != admin_principal() {
    //     return Err("Admin access required".to_string());
    // }

    // Use the closure pattern to replace all settings
    OisySettings::update(|settings| {
        *settings = new_settings;
    })?;

    Ok("Oisy settings updated successfully".to_string())
}

//===================================================================================================
// INTERNAL INITIALIZATION
//===================================================================================================

/// Initialize Oisy settings storage
/// Called during canister initialization
pub fn init_oisy_settings() -> Result<(), String> {
    // Settings are automatically initialized with defaults via thread_local
    // This function validates that initialization worked
    OISY_SETTINGS.with(|s| {
        let cell = s.borrow();
        let settings = cell.get();
        if settings.domain.is_empty() {
            Err("Oisy settings initialization failed".to_string())
        } else {
            Ok(())
        }
    })
}
