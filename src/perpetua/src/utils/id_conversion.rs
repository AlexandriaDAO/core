// Copied from src/nft_manager/src/id_converter.rs on YYYY-MM-DD (replace with actual date/commit)
// This module contains functions for converting between original NFT IDs and SBT IDs.

use candid::{Nat, Principal};
use num_bigint::BigUint;
use sha2::{Sha256, Digest};
use ic_cdk;

// --- Copied from src/nft_manager/src/id_converter.rs ---

// Helper function to hash a Principal (copied from nft_manager)
fn hash_principal(principal: &Principal) -> u64 {
    let principal_bytes = principal.as_slice();
    
    let mut hasher = Sha256::new();
    hasher.update(principal_bytes);
    let result = hasher.finalize();
    
    let mut bytes = [0u8; 8];
    bytes.copy_from_slice(&result[0..8]);
    u64::from_be_bytes(bytes)
}

/// Converts an SBT (Scion) ID to its original NFT ID.
/// The Principal is embedded within the Scion ID.
pub fn scion_to_og_id(scion_id: Nat) -> Nat {
    // Convert to BigUint for bitwise operations
    let scion_big: BigUint = scion_id.0;
    
    // Extract principal hash (first 64 bits after shifting right)
    // The principal's hash was originally shifted left by 256 bits and XORed.
    // So, to get it back, we shift right by 256.
    let shifted_for_hash_extraction = scion_big.clone() >> 256u32;
    
    // Create a mask for the lower 64 bits (0xFFFFFFFFFFFFFFFF)
    let hash_mask = (BigUint::from(1u64) << 64u32) - BigUint::from(1u64);
    let principal_hash_big = shifted_for_hash_extraction & hash_mask;
    
    // Reconstruct the original number by XORing with the (principal_hash << 256)
    // This is the reverse of: result = (hash_big << 256u32) ^ og_big;
    let reconstructed_shifted_hash = principal_hash_big << 256u32;
    let result_og_big = scion_big ^ reconstructed_shifted_hash;
    
    Nat::from(result_og_big)
}

// --- End of copied code ---

pub fn get_original_nft_id_for_storage(id_on_shelf_str: &str) -> String {
    // SBTs have longer IDs (e.g., often > 90 chars for their numeric string representation)
    // compared to original NFTs (e.g., < 80 chars for their numeric string representation).
    // Adjust threshold as necessary based on observed lengths from your specific ID generation.
    // If original IDs are ~68 chars and SBTs ~78, > 75 might be a safe bet.
    let is_sbt_by_length = id_on_shelf_str.len() > 75; 

    match id_on_shelf_str.parse::<BigUint>() {
        Ok(big_uint_id) => {
            let nat_id = Nat(big_uint_id);
            if is_sbt_by_length {
                let original_nat_id = scion_to_og_id(nat_id);
                original_nat_id.to_string()
            } else {
                id_on_shelf_str.to_string() 
            }
        }
        Err(_) => {
            // Not a numeric string (e.g., potentially an Arweave ID if those were ever used as keys).
            // Pass it through.
            ic_cdk::println!("[get_original_nft_id_for_storage] ID '{}' (len {}) treated as Non-Numeric.", id_on_shelf_str, id_on_shelf_str.len());
            id_on_shelf_str.to_string()
        }
    }
} 