// Identity based encryption 
// Alex Wallet canister encryption for node private keys

use std::str::FromStr;
use ic_cdk::update;

use crate::types::{
    CanisterId, VetKDCurve, VetKDEncryptedKeyReply, VetKDEncryptedKeyRequest, VetKDKeyId,
    VetKDPublicKeyReply, VetKDPublicKeyRequest,
};

use ic_cdk::api::management_canister::main::raw_rand;

use crate::utility::{IBECiphertext, TransportSecretKey};


const SYSTEM_API_CANISTER_ID: &str = "5vg3f-laaaa-aaaap-qkmrq-cai";
const ALEX_WALLET_CANISTER_ID: &str = "yh7mi-3yaaa-aaaap-qkmpa-cai";
const FRONTEND_CANISTER_ID: &str = "yj5ba-aiaaa-aaaap-qkmoa-cai";
const USER_CANISTER_ID: &str = "yo4hu-nqaaa-aaaap-qkmoq-cai";

#[update]
pub async fn encryption_key() -> String {
    let request = VetKDPublicKeyRequest {
        canister_id: None,
        // canister_id: Some(vetkd_canister_id()),
        derivation_path: vec![b"encryption_key".to_vec()],
        key_id: bls12_381_test_key_1(),
    };

    let (response,): (VetKDPublicKeyReply,) = ic_cdk::api::call::call(
        system_api_canister_id(),
        "vetkd_public_key",
        (request,),
    )
    .await
    .expect("call to vetkd_public_key failed");

    hex::encode(response.public_key)
}

// async fn derive_decrypted_key(node_id: String) -> Result<String, String> {

//     // Ensure only the wallet canister can call this method
//     let caller = ic_cdk::caller();

//     if caller != alex_wallet_canister_id() {
//         return Err("Access denied. Only the wallet canister can call this method.".to_string());
//     }

//     // Call get_node_by_id method from the node module
//     let node = node::get_node_by_id(node_id.clone()).ok_or_else(|| format!("Node not found for id: {}", node_id))?;

//     // Now you have the node, you can use it as needed
//     let encrypted_data = node.pvt_key.clone(); // The node has an encrypted pvt_key field

//     // Decrypt the data using the existing decrypt_ibe_message function
//     let decrypted_data = decrypt_ibe_message(encrypted_data).await?;

//     Ok(decrypted_data)
// }

#[update]
pub async fn wbe_decrypt(encoded: String) -> Result<String, String> {

    // Ensure only the wallet canister can call this method
    let caller = ic_cdk::caller();

    if caller != alex_wallet_canister_id() {
        return Err("Access denied. Only the wallet canister can call this method.".to_string());
    }

    // Generate a random seed using IC's raw_rand
    let random_bytes = raw_rand().await
        .map_err(|e| format!("Failed to generate random bytes: {:?}", e))?
        .0;
    let tsk_seed: [u8; 32] = random_bytes[..32].try_into()
        .map_err(|_| "Failed to create 32-byte seed".to_string())?;

    let tsk = TransportSecretKey::from_seed(tsk_seed.to_vec())
        .map_err(|e| format!("Failed to create TransportSecretKey: {}", e))?;

    // Get the encrypted IBE decryption key
    let ek_bytes_hex = encrypted_wbe_decryption_key(tsk.public_key()).await;

    // Get the IBE encryption key
    let pk_bytes_hex = encryption_key().await;


    // Decrypt the key
    let k_bytes = tsk.decrypt(
        &hex::decode(&ek_bytes_hex).map_err(|e| format!("Failed to decode ek_bytes_hex: {}", e))?,
        &hex::decode(&pk_bytes_hex).map_err(|e| format!("Failed to decode pk_bytes_hex: {}", e))?,
        alex_wallet_canister_id().as_slice(),
        // ic_cdk::caller().as_slice()
    ).map_err(|e| format!("Failed to decrypt key: {}", e))?;

    // Deserialize and decrypt the IBE ciphertext
    let ibe_ciphertext = IBECiphertext::deserialize(
        &hex::decode(&encoded).map_err(|e| format!("Failed to decode encoded message: {}", e))?
    ).map_err(|e| format!("Failed to deserialize IBE ciphertext: {}", e))?;

    let ibe_plaintext = ibe_ciphertext.decrypt(&k_bytes)
        .map_err(|e| format!("Failed to decrypt IBE ciphertext: {}", e))?;

    // Decode the plaintext
    let decoded = String::from_utf8(ibe_plaintext)
        .map_err(|e| format!("Failed to decode plaintext: {}", e))?;

    Ok(decoded)
}


#[update]
pub async fn abe_decrypt(encoded: String) -> Result<String, String> {

    // Ensure only the wallet canister can call this method
    let caller = ic_cdk::caller();

    if caller != user_canister_id() {
        return Err("Access denied. Only the user canister can call this method.".to_string());
    }

    // Generate a random seed using IC's raw_rand
    let random_bytes = raw_rand().await
        .map_err(|e| format!("Failed to generate random bytes: {:?}", e))?
        .0;
    let tsk_seed: [u8; 32] = random_bytes[..32].try_into()
        .map_err(|_| "Failed to create 32-byte seed".to_string())?;

    let tsk = TransportSecretKey::from_seed(tsk_seed.to_vec())
        .map_err(|e| format!("Failed to create TransportSecretKey: {}", e))?;

    // Get the encrypted IBE decryption key
    let ek_bytes_hex = encrypted_wbe_decryption_key(tsk.public_key()).await;

    // Get the IBE encryption key
    let pk_bytes_hex = encryption_key().await;


    // Decrypt the key
    let k_bytes = tsk.decrypt(
        &hex::decode(&ek_bytes_hex).map_err(|e| format!("Failed to decode ek_bytes_hex: {}", e))?,
        &hex::decode(&pk_bytes_hex).map_err(|e| format!("Failed to decode pk_bytes_hex: {}", e))?,
        alex_wallet_canister_id().as_slice(),
        // ic_cdk::caller().as_slice()
    ).map_err(|e| format!("Failed to decrypt key: {}", e))?;

    // Deserialize and decrypt the IBE ciphertext
    let ibe_ciphertext = IBECiphertext::deserialize(
        &hex::decode(&encoded).map_err(|e| format!("Failed to decode encoded message: {}", e))?
    ).map_err(|e| format!("Failed to deserialize IBE ciphertext: {}", e))?;

    let ibe_plaintext = ibe_ciphertext.decrypt(&k_bytes)
        .map_err(|e| format!("Failed to decrypt IBE ciphertext: {}", e))?;

    // Decode the plaintext
    let decoded = String::from_utf8(ibe_plaintext)
        .map_err(|e| format!("Failed to decode plaintext: {}", e))?;

    Ok(decoded)
}


async fn encrypted_wbe_decryption_key(encryption_public_key: Vec<u8>) -> String {
    debug_println_caller("encrypted_wbe_decryption_key_for_caller");

    let request = VetKDEncryptedKeyRequest {
        derivation_id: alex_wallet_canister_id().as_slice().to_vec(),
        public_key_derivation_path: vec![b"encryption_key".to_vec()],
        key_id: bls12_381_test_key_1(),
        encryption_public_key,
    };

    let (response,): (VetKDEncryptedKeyReply,) = ic_cdk::api::call::call(
        system_api_canister_id(),
        "vetkd_encrypted_key",
        (request,),
    )
    .await
    .expect("call to vetkd_encrypted_key failed");

    hex::encode(response.encrypted_key)
}


#[update]
pub async fn encrypted_ibe_decryption_key(encryption_public_key: Vec<u8>) -> String {
    debug_println_caller("encrypted_ibe_decryption_key_for_caller");

    let request = VetKDEncryptedKeyRequest {
        // derivation_id: ic_cdk::caller().as_slice().to_vec(),
        derivation_id: frontend_canister_id().as_slice().to_vec(),
        public_key_derivation_path: vec![b"encryption_key".to_vec()],
        key_id: bls12_381_test_key_1(),
        encryption_public_key,
    };

    let (response,): (VetKDEncryptedKeyReply,) = ic_cdk::api::call::call(
        system_api_canister_id(),
        "vetkd_encrypted_key",
        (request,),
    )
    .await
    .expect("call to vetkd_encrypted_key failed");

    hex::encode(response.encrypted_key)
}



fn bls12_381_test_key_1() -> VetKDKeyId {
    VetKDKeyId {
        curve: VetKDCurve::Bls12_381,
        name: "test_key_1".to_string(),
    }
}

fn system_api_canister_id() -> CanisterId {
    CanisterId::from_str(SYSTEM_API_CANISTER_ID).expect("failed to create canister ID")
}

fn alex_wallet_canister_id() -> CanisterId {
    CanisterId::from_str(ALEX_WALLET_CANISTER_ID).expect("failed to create canister ID")
}

fn user_canister_id() -> CanisterId {
    CanisterId::from_str(USER_CANISTER_ID).expect("failed to create canister ID")
}

fn frontend_canister_id() -> CanisterId {
    CanisterId::from_str(FRONTEND_CANISTER_ID).expect("failed to create canister ID")
}

fn debug_println_caller(method_name: &str) {
    ic_cdk::println!(
        "{}: caller: {} (isAnonymous: {})  api_caller: {}",
        method_name,
        ic_cdk::caller().to_text(),
        ic_cdk::caller() == candid::Principal::anonymous(),
        ic_cdk::api::caller().to_text()
    );
}

