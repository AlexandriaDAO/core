use ic_cdk_macros::update;
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use serde_json::Value;
use num_bigint::BigUint;
use sha2::{Sha256, Digest};
use candid::{self, Principal};
use serde;

use crate::wallet_queries::get_wallets;

const HASH_LENGTH: usize = 32; // SHA-256 produces 32 bytes
const SALT_LENGTH: usize = 32; // Using 32-byte salt
const RSA_SIZE: usize = 512;   // 4096 bits = 512 bytes

/// Decode Base64Url to bytes
fn base64url_decode(encoded: &str) -> Vec<u8> {
    URL_SAFE_NO_PAD.decode(encoded).expect("Failed to decode base64url")
}

/// Convert a byte array to BigUint
fn os2ip(bytes: &[u8]) -> BigUint {
    BigUint::from_bytes_be(bytes)
}

/// Convert a BigUint to a byte array of specified length
fn i2osp(value: &BigUint, length: usize) -> Vec<u8> {
    let mut bytes = value.to_bytes_be();
    if bytes.len() < length {
        let mut padded = vec![0u8; length - bytes.len()];
        padded.extend_from_slice(&bytes);
        bytes = padded;
    }
    bytes
}

/// Modular exponentiation using BigUint
fn mod_exp(base: &BigUint, exponent: &BigUint, modulus: &BigUint) -> BigUint {
    base.modpow(exponent, modulus)
}

/// Apply RSA-PSS padding according to PKCS#1 v2.1
fn pss_padding(message_hash: &[u8], salt: &[u8], em_len: usize) -> Vec<u8> {
    assert_eq!(message_hash.len(), HASH_LENGTH, "Invalid hash length");
    assert_eq!(salt.len(), SALT_LENGTH, "Invalid salt length");
    assert_eq!(em_len, RSA_SIZE, "Invalid encoded message length");

    // 1. Create M' = (0x)00 00 00 00 00 00 00 00 || mHash || salt
    let mut m_prime = vec![0u8; 8];
    m_prime.extend_from_slice(message_hash);
    m_prime.extend_from_slice(salt);

    // 2. Hash M' to create H
    let mut hasher = Sha256::new();
    hasher.update(&m_prime);
    let h = hasher.finalize();

    // 3. Form data block DB = PS || 0x01 || salt
    let ps_len = em_len - SALT_LENGTH - HASH_LENGTH - 2;
    let mut db = vec![0u8; ps_len];
    db.push(0x01);
    db.extend_from_slice(salt);

    // 4. Generate dbMask = MGF1(H, emLen - hLen - 1)
    let db_mask = mgf1(&h, em_len - HASH_LENGTH - 1);

    // 5. Mask DB: maskedDB = DB xor dbMask
    let mut masked_db = vec![0u8; db.len()];
    for (i, (db_byte, mask_byte)) in db.iter().zip(db_mask.iter()).enumerate() {
        masked_db[i] = db_byte ^ mask_byte;
    }

    // 6. Set the leftmost bits in the leftmost byte of maskedDB to zero
    masked_db[0] &= 0x7f; // Clear the leftmost bit for 4096-bit RSA

    // 7. Concatenate to form EM = maskedDB || H || 0xbc
    let mut em = masked_db;
    em.extend_from_slice(&h);
    em.push(0xbc);

    em
}

/// MGF1 Mask Generation Function using SHA-256
fn mgf1(seed: &[u8], len: usize) -> Vec<u8> {
    let mut result = Vec::with_capacity(len);
    let mut counter = 0u32;
    
    while result.len() < len {
        let mut hasher = Sha256::new();
        hasher.update(seed);
        hasher.update(&counter.to_be_bytes());
        result.extend_from_slice(&hasher.finalize());
        counter += 1;
    }

    result.truncate(len);
    result
}

/// RSA-PSS Signing using parsed JWK
fn rsa_pss_sign(message: &[u8], jwk_json: &Value, n: &str) -> Vec<u8> {
    ic_cdk::println!("Starting RSA-PSS signing process");
    ic_cdk::println!("Input message: {:?}", message);

    // let modulus = base64url_decode(jwk_json["n"].as_str().unwrap());
    let modulus = base64url_decode(n);
    let private_exponent = base64url_decode(jwk_json["d"].as_str().unwrap());
    
    assert_eq!(modulus.len(), RSA_SIZE, "Invalid modulus length");
    ic_cdk::println!("Decoded modulus length: {} bytes", modulus.len());
    ic_cdk::println!("Decoded private exponent length: {} bytes", private_exponent.len());

    let n = os2ip(&modulus);
    let d = os2ip(&private_exponent);
    ic_cdk::println!("Converted modulus and private exponent to integers");

    // Hash the message using SHA-256
    let mut hasher = Sha256::new();
    hasher.update(message);
    let message_hash = hasher.finalize();
    ic_cdk::println!("Message hash computed: {:?}", message_hash);

    // Generate random salt
    let salt = [0xAB; SALT_LENGTH]; // Fixed salt for reproducibility
    ic_cdk::println!("Using salt of length: {} bytes", salt.len());

    let padded_message = pss_padding(&message_hash, &salt, RSA_SIZE);
    ic_cdk::println!("Padded message length: {} bytes", padded_message.len());

    let m_int = os2ip(&padded_message);
    ic_cdk::println!("Converted padded message to integer");

    ic_cdk::println!("Starting modular exponentiation...");
    let signature_int = mod_exp(&m_int, &d, &n);
    ic_cdk::println!("Completed modular exponentiation");

    let signature = i2osp(&signature_int, RSA_SIZE);
    ic_cdk::println!("Final signature length: {} bytes", signature.len());

    signature
}

/// Convert bytes to base64url string without padding
fn buffer_to_b64url(buffer: &[u8]) -> String {
    // First encode to standard base64
    let b64 = URL_SAFE_NO_PAD.encode(buffer);
    // URL_SAFE_NO_PAD already handles the url-safe encoding and padding removal
    b64
}

#[derive(candid::CandidType, serde::Serialize)]
pub struct SignatureResponse {
    signature: String,
    id: String,
    owner: String,
}

#[update]
pub async fn sign(data: Vec<u8>, id: u64) -> Result<SignatureResponse, String> {
    ic_cdk::println!("Debugging ID: {}", id);

    let wallet = get_wallets(vec![id]).unwrap();

    if wallet.is_empty() {
        return Err(format!("Wallet with ID {} not found", id));
    }

    let wallet = wallet.first().unwrap();

    if wallet.id != id {
        return Err(format!("Wallet with ID {} not found", id));
    }

    ic_cdk::println!("Wallet key: {}", wallet.key);

    let request = wallet.key.to_string();

    let (response,): (Result<String, String>,) = ic_cdk::api::call::call(
        vetkd_canister_id(),
        "abe_decrypt",
        (request,),
    )
    .await
    .map_err(|e| format!("Call to abe_decrypt failed: {:?}", e))?;

    let decrypted = response.map_err(|e| format!("Decryption error: {}", e))?;

    ic_cdk::println!("Decrypted key: {}", decrypted);

    ic_cdk::println!("Starting sign() function");
    ic_cdk::println!("Input data length: {} bytes", data.len());

    // Parse the decrypted JWK string
    let jwk_json: Value = serde_json::from_str(&decrypted).map_err(|e| format!("Failed to parse decrypted JWK: {}", e))?;

    ic_cdk::println!("Parsed JWK: {}", jwk_json);

    // Get n directly from parsed JWK
    let owner = wallet.public.n.to_string();
    ic_cdk::println!("Owner: {}", owner);

    let raw_signature = rsa_pss_sign(data.as_slice(), &jwk_json, &owner);
    let signature = buffer_to_b64url(&raw_signature);

    let id_bytes: Vec<u8> = Sha256::digest(&raw_signature).to_vec();
    let id = buffer_to_b64url(&id_bytes);

    Ok(SignatureResponse {
        signature,
        id,
        owner
    })
}

fn vetkd_canister_id() -> Principal {
    let vetkd_canister_id = "5ham4-hqaaa-aaaap-qkmsq-cai";
    Principal::from_text(vetkd_canister_id).expect("failed to create canister ID")
}
