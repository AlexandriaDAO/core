/// Time utilities for authentication system
/// IC provides deterministic time across all nodes for consistency

// Constants for time conversions
const NANOS_PER_SECOND: u64 = 1_000_000_000;

//===================================================================================================
// PUBLIC API FUNCTIONS
//===================================================================================================

/// Get current canister time in nanoseconds since UNIX epoch
/// IC time is deterministic and consistent across all replicas
pub fn now() -> u64 {
    ic_cdk::api::time()
}


/// Convert seconds to nanoseconds for IC time
/// Helper for working with human-readable time values
pub fn seconds_to_nanos(seconds: u64) -> u64 {
    seconds * NANOS_PER_SECOND
}

/// Convert minutes to nanoseconds for IC time
/// Helper for setting message and session timeouts
pub fn minutes_to_nanos(minutes: u64) -> u64 {
    seconds_to_nanos(minutes * 60)
}

/// Convert hours to nanoseconds for IC time
/// Helper for setting long session durations
pub fn hours_to_nanos(hours: u64) -> u64 {
    minutes_to_nanos(hours * 60)
}

/// Format IC nanosecond timestamp as ISO 8601 UTC string
///
/// Used across all providers for consistent timestamp formatting in auth messages.
/// Converts IC's nanosecond timestamps to standard ISO 8601 format.
///
/// Examples:
/// ```rust
/// format_timestamp(1726394879000000000) // → "2025-09-15T03:07:59.000000000Z"
/// format_timestamp(0)                   // → "1970-01-01T00:00:00.000000000Z"
/// ```
pub fn format_timestamp(nanos: u64) -> String {
    use time::{format_description::well_known::Iso8601, OffsetDateTime};

    // Convert IC nanoseconds to Unix timestamp
    let seconds = (nanos / NANOS_PER_SECOND) as i64;
    let nanoseconds = (nanos % NANOS_PER_SECOND) as u32;

    // Create OffsetDateTime from Unix timestamp
    match OffsetDateTime::from_unix_timestamp_nanos(
        seconds as i128 * NANOS_PER_SECOND as i128 + nanoseconds as i128,
    ) {
        Ok(datetime) => {
            // Format as ISO 8601 UTC timestamp (YYYY-MM-DDTHH:MM:SSZ)
            datetime
                .format(&Iso8601::DEFAULT)
                .unwrap_or_else(|_| "1970-01-01T00:00:00Z".to_string())
        }
        Err(_) => {
            // Fallback for invalid timestamps
            "1970-01-01T00:00:00Z".to_string()
        }
    }
}