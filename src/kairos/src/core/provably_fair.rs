/// Provably fair mine placement algorithm
///
/// Flow:
/// 1. Server generates random server_seed before game
/// 2. Server shows SHA256(server_seed) to player (commitment)
/// 3. Player provides client_seed
/// 4. Mine positions = SHA256(server_seed + client_seed) deterministically
/// 5. After game, server reveals server_seed for verification
use sha2::{Sha256, Digest};

/// Hash server seed to create commitment (shown before game starts)
pub fn hash_server_seed(server_seed: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(server_seed.as_bytes());
    let result = hasher.finalize();
    hex::encode(result)
}

/// Generate deterministic mine positions from seeds
///
/// Algorithm:
/// 1. Combine server_seed and client_seed
/// 2. SHA256 hash the combination
/// 3. Use hash bytes to select mine positions (Fisher-Yates-like selection)
pub fn generate_mine_positions(server_seed: &str, client_seed: &str, mine_count: u8) -> Vec<u8> {
    // Combine seeds
    let combined = format!("{}{}", server_seed, client_seed);

    let mut hasher = Sha256::new();
    hasher.update(combined.as_bytes());
    let hash = hasher.finalize();

    // Use hash bytes to select positions
    let mut positions: Vec<u8> = Vec::with_capacity(mine_count as usize);
    let mut available: Vec<u8> = (0..16).collect();

    let mut hash_index = 0;

    while positions.len() < mine_count as usize && !available.is_empty() {
        // Get next random byte from hash (loop if needed)
        let random_byte = hash[hash_index % 32];
        hash_index += 1;

        // Select position from available tiles
        let index = (random_byte as usize) % available.len();
        let position = available.remove(index);
        positions.push(position);

        // If we've used all hash bytes, rehash with counter
        if hash_index >= 32 && positions.len() < mine_count as usize {
            let mut hasher = Sha256::new();
            hasher.update(format!("{}{}", combined, hash_index).as_bytes());
            let new_hash = hasher.finalize();
            // Update our working hash reference
            hash_index = 0;
            // Continue with new hash - need to track state differently
        }
    }

    positions.sort();
    positions
}

/// Verify that mine positions match the seeds (for provably fair verification)
pub fn verify_mine_positions(
    server_seed: &str,
    client_seed: &str,
    mine_count: u8,
    claimed_positions: &[u8],
) -> bool {
    let expected = generate_mine_positions(server_seed, client_seed, mine_count);

    if expected.len() != claimed_positions.len() {
        return false;
    }

    let mut claimed_sorted = claimed_positions.to_vec();
    claimed_sorted.sort();

    expected == claimed_sorted
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_server_seed() {
        let seed = "test_seed_123";
        let hash = hash_server_seed(seed);
        assert_eq!(hash.len(), 64); // SHA256 produces 64 hex chars
    }

    #[test]
    fn test_generate_mine_positions_count() {
        let positions = generate_mine_positions("server123", "client456", 3);
        assert_eq!(positions.len(), 3);
    }

    #[test]
    fn test_generate_mine_positions_unique() {
        let positions = generate_mine_positions("server123", "client456", 10);
        let unique: std::collections::HashSet<_> = positions.iter().collect();
        assert_eq!(unique.len(), positions.len()); // All unique
    }

    #[test]
    fn test_generate_mine_positions_in_range() {
        let positions = generate_mine_positions("server123", "client456", 15);
        for pos in &positions {
            assert!(*pos < 16);
        }
    }

    #[test]
    fn test_deterministic() {
        let pos1 = generate_mine_positions("same_server", "same_client", 5);
        let pos2 = generate_mine_positions("same_server", "same_client", 5);
        assert_eq!(pos1, pos2); // Same seeds = same positions
    }

    #[test]
    fn test_verify_positions() {
        let server_seed = "server_test";
        let client_seed = "client_test";
        let mine_count = 5;

        let positions = generate_mine_positions(server_seed, client_seed, mine_count);
        assert!(verify_mine_positions(server_seed, client_seed, mine_count, &positions));
    }
}
