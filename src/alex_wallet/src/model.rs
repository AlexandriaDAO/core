use candid::{CandidType, Principal};
use ic_cdk::api::time;
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct PublicKey {
    pub kty: String,  // Key type (RSA)
    pub e: String,    // public exponent
    pub n: String,    // modulus
}


// not being used but the structure is like this
// #[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
// pub struct PrivateKey {
//     // Core RSA private components
//     pub d: String,    // private exponent
//     pub p: String,    // first prime factor
//     pub q: String,    // second prime factor

//     // Chinese Remainder Theorem (CRT) components
//     pub dp: String,   // first factor CRT exponent
//     pub dq: String,   // second factor CRT exponent
//     pub qi: String,   // CRT coefficient
// }

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Wallet {
    pub id: u64,
    pub key: String,
    pub public: PublicKey,
    pub owner: Principal,
    pub active: bool,
    pub created_at: u64,
    pub updated_at: u64,
}


impl Wallet {
    pub fn new(id: u64, key: String, public: PublicKey, owner: Principal) -> Self {
        let now = time();
        Self {
            id,
            key,
            public,
            owner,
            active: true,
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CreateWalletRequest {
    pub key: String,
    pub public: PublicKey,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UpdateWalletStatusRequest {
    pub id: u64,
    pub active: bool,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct SignatureResponse {
    pub signature: String,
    pub id: String,
    pub owner: String,
}
