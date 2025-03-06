use ic_cdk::api::{caller, time};
use ic_cdk_macros::update;
use candid::Principal;

use crate::errors::GeneralError;
use crate::{buffer_to_b64url, get_decrypted_key, get_wallets, rsa_pss_sign, SignatureResponse};
use crate::store::{WALLETS, USER_WALLETS};
use crate::model::{Wallet, CreateWalletRequest, UpdateWalletStatusRequest};
use crate::validations::{validate_key, validate_public_key};
use crate::utilities::{get_and_increment_wallet_counter, add_wallet_to_user};

use serde_json::Value;
use sha2::{Sha256, Digest};


/// Creates a new wallet for the authenticated user
#[update]
pub fn create_wallet(request: CreateWalletRequest) -> Result<Wallet, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    // Validate private key
    if let Err(err) = validate_key(&request.key) {
        return Err(err.to_string());
    }

    // Validate public key
    if let Err(err) = validate_public_key(&request.public) {
        return Err(err.to_string());
    }

    let wallet_id = get_and_increment_wallet_counter();
    let wallet = Wallet::new(wallet_id, request.key, request.public, caller);

    // Store the wallet
    WALLETS.with(|wallets| {
        wallets.borrow_mut().insert(wallet_id, wallet.clone());
    });

    // Add to user's wallets
    add_wallet_to_user(&caller, wallet_id);

    Ok(wallet)
}

/// Updates an existing wallet's status
#[update]
pub fn update_wallet_status(request: UpdateWalletStatusRequest) -> Result<Wallet, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    WALLETS.with(|wallets| {
        let mut wallets = wallets.borrow_mut();

        let wallet = wallets.get(&request.id)
            .ok_or_else(|| GeneralError::NotFound("Wallet".to_string()).to_string())?;

        if wallet.owner != caller {
            return Err(GeneralError::NotAuthorized.to_string());
        }

        let mut updated_wallet = wallet.clone();
        updated_wallet.active = request.active;
        updated_wallet.updated_at = time();

        wallets.insert(request.id, updated_wallet.clone()).unwrap();
        Ok(updated_wallet)
    })
}

/// Deletes a wallet owned by the caller
#[update]
pub fn delete_wallet(id: u64) -> Result<(), String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err(GeneralError::AnonymousNotAllowed.to_string());
    }

    // First check ownership and remove the wallet
    let wallet_owner = WALLETS.with(|wallets| {
        let mut wallets = wallets.borrow_mut();
        let wallet = wallets.get(&id)
            .ok_or_else(|| GeneralError::NotFound("Wallet".to_string()).to_string())?;

        if wallet.owner != caller {
            return Err(GeneralError::NotAuthorized.to_string());
        }

        wallets.remove(&id);
        Ok(wallet.owner.clone())
    })?;

    // Remove from user's wallets
    USER_WALLETS.with(|user_wallets| {
        let mut user_wallets = user_wallets.borrow_mut();
        if let Some(mut list) = user_wallets.remove(&wallet_owner) {
            list.0.retain(|&x| x != id);
            user_wallets.insert(wallet_owner, list);
        }
    });

    Ok(())
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

    let decrypted = get_decrypted_key(wallet.key.clone()).await?;

    ic_cdk::println!("Starting sign() function");
    ic_cdk::println!("Input data length: {} bytes", data.len());

    // Parse the decrypted JWK string
    let jwk_json: Value = serde_json::from_str(&decrypted).map_err(|e| format!("Failed to parse decrypted JWK: {}", e))?;

    ic_cdk::println!("Parsed JWK");

    // Get n directly from parsed JWK
    let owner = wallet.public.n.to_string();
    ic_cdk::println!("Owner: {}", owner);

    let raw_signature = rsa_pss_sign(data.as_slice(), &jwk_json, &owner).await?;
    let signature = buffer_to_b64url(&raw_signature);

    let id_bytes: Vec<u8> = Sha256::digest(&raw_signature).to_vec();
    let id = buffer_to_b64url(&id_bytes);

    Ok(SignatureResponse {
        signature,
        id,
        owner
    })
}
