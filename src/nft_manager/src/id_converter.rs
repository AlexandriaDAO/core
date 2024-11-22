use ic_cdk::query;
use candid::{Nat, Principal};
use icrc_ledger_types::icrc1::account::Subaccount;
use sha2::{Sha256, Digest};
use num_bigint::BigUint;

#[query]
fn arweave_id_to_nat(arweave_id: String) -> Nat {
    let mut id = arweave_id.chars().take(43).collect::<String>();
    while id.len() % 4 != 0 {
        id.push('=');
    }
    id = id.replace('-', "+").replace('_', "/");
    
    let bytes = base64_decode(&id);
    let big_uint = BigUint::from_bytes_be(&bytes);
    Nat::from(big_uint)
}

#[query]
fn nat_to_arweave_id(num: Nat) -> String {
    let big_uint: BigUint = num.0;
    let bytes = big_uint.to_bytes_be();
    let id = base64_encode(&bytes);
    id.replace('+', "-").replace('/', "_").trim_end_matches('=').to_string()
}

fn base64_decode(input: &str) -> Vec<u8> {
    let mut result = Vec::new();
    let mut buf = 0u32;
    let mut buf_len = 0;

    for c in input.bytes() {
        let val = match c {
            b'A'..=b'Z' => c - b'A',
            b'a'..=b'z' => c - b'a' + 26,
            b'0'..=b'9' => c - b'0' + 52,
            b'+' => 62,
            b'/' => 63,
            b'=' => break,
            _ => continue,
        };

        buf = (buf << 6) | val as u32;
        buf_len += 6;

        if buf_len >= 8 {
            buf_len -= 8;
            result.push((buf >> buf_len) as u8);
        }
    }

    result
}

fn base64_encode(input: &[u8]) -> String {
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = String::new();
    let mut i = 0;

    while i < input.len() {
        let b1 = input[i];
        let b2 = if i + 1 < input.len() { input[i + 1] } else { 0 };
        let b3 = if i + 2 < input.len() { input[i + 2] } else { 0 };

        result.push(CHARSET[(b1 >> 2) as usize] as char);
        result.push(CHARSET[((b1 & 0x03) << 4 | b2 >> 4) as usize] as char);
        result.push(CHARSET[((b2 & 0x0f) << 2 | b3 >> 6) as usize] as char);
        result.push(CHARSET[(b3 & 0x3f) as usize] as char);

        i += 3;
    }

    let padding = (3 - input.len() % 3) % 3;
    if padding > 0 {
        result.truncate(result.len() - padding);
    }

    result
}

#[ic_cdk::query]
pub fn to_nft_subaccount(id: Nat) -> Subaccount {
    let mut subaccount = [0u8; 32];
    let num_str = id.to_string();
    
    // Convert string to individual digits
    let digits: Vec<u8> = num_str
        .bytes()
        .filter_map(|c| {
            if c.is_ascii_digit() {
                Some(c - b'0')
            } else {
                None
            }
        })
        .collect();
    
    let start = 32 - std::cmp::min(digits.len(), 32);
    let end_slice = &digits[digits.len().saturating_sub(32)..];
    subaccount[start..].copy_from_slice(end_slice);

    subaccount
}

pub fn og_to_scion_id(og_number: &Nat, principal: &Principal) -> Nat {
    // Get 64-bit hash of principal
    let principal_hash = hash_principal(principal);
    
    // Convert to BigUint for bitwise operations
    let og_big: BigUint = og_number.0.clone();
    let hash_big = BigUint::from(principal_hash);
    
    // Shift left 256 bits (multiply by 2^256)
    let shifted_hash = hash_big << 256u32;
    let result = shifted_hash ^ og_big;
    
    Nat::from(result)
}

pub fn scion_to_og_id(scion_id: &Nat) -> Nat {
    // Convert to BigUint for bitwise operations
    let scion_big: BigUint = scion_id.0.clone();
    
    // Extract principal hash (first 64 bits after shifting right)
    let shifted = scion_big.clone() >> 256u32;
    let mask = (BigUint::from(1u64) << 64u32) - BigUint::from(1u64);
    let principal_hash = shifted & mask;
    
    // Reconstruct original number using XOR
    let shifted_hash = principal_hash << 256u32;
    let result = scion_big ^ shifted_hash;
    
    Nat::from(result)
}

fn hash_principal(principal: &Principal) -> u64 {
    let principal_bytes = principal.as_slice();
    
    let mut hasher = Sha256::new();
    hasher.update(principal_bytes);
    let result = hasher.finalize();
    
    let mut bytes = [0u8; 8];
    bytes.copy_from_slice(&result[0..8]);
    u64::from_be_bytes(bytes)
}

#[ic_cdk::query]
pub fn principal_to_subaccount(principal: Principal) -> Subaccount {
    let mut subaccount = [0u8; 32];
    let principal_bytes = principal.as_slice();
    
    // First 28 bytes: principal bytes (padded with zeros if needed)
    let principal_len = principal_bytes.len();
    subaccount[..principal_len].copy_from_slice(principal_bytes);
    
    // Byte 28: length of the principal
    subaccount[28] = principal_len as u8;
    
    // Last 3 bytes: CRC24 checksum of the principal
    let checksum = calculate_crc24(principal_bytes);
    subaccount[29] = ((checksum >> 16) & 0xFF) as u8;
    subaccount[30] = ((checksum >> 8) & 0xFF) as u8;
    subaccount[31] = (checksum & 0xFF) as u8;
    
    subaccount
}

#[ic_cdk::query]
pub fn subaccount_to_principal(subaccount: Subaccount) -> Option<Principal> {
    // Get the length of the principal from byte 28
    let principal_len = subaccount[28] as usize;
    
    // Validate length
    if principal_len > 28 {
        return None;
    }
    
    // Extract the principal bytes
    let principal_bytes = &subaccount[..principal_len];
    
    // Verify checksum
    let stored_checksum = ((subaccount[29] as u32) << 16) |
                         ((subaccount[30] as u32) << 8) |
                         (subaccount[31] as u32);
    
    let calculated_checksum = calculate_crc24(principal_bytes);
    
    if calculated_checksum != stored_checksum {
        return None;
    }
    
    // Create principal from bytes
    Some(Principal::from_slice(principal_bytes))
}

// CRC24 implementation
fn calculate_crc24(data: &[u8]) -> u32 {
    const CRC24_POLY: u32 = 0x1864CFB; // CRC-24 polynomial
    let mut crc: u32 = 0xB704CE;       // CRC-24 initial value
    
    for &byte in data {
        crc ^= (byte as u32) << 16;
        for _ in 0..8 {
            crc <<= 1;
            if (crc & 0x1000000) != 0 {
                crc ^= CRC24_POLY;
            }
        }
    }
    
    crc & 0xFFFFFF // Return 24 bits only
}
