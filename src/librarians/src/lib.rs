// Submit your principal here and become a librarian.
// This will store your principal which will be used to decrypt api keys and wallet keys.

// Setup:
// We'll hash the user's principal, and allow access of the principal through the hash.
// We'll allow adding and deleting oneself from the list of librarians, which will control access on the frontend.
// We'll allow everyone to query by principal hash.


use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;
use ic_cdk::{query, update};
use sha2::{Sha256, Digest};

type Memory = VirtualMemory<DefaultMemoryImpl>;

const MAX_VALUE_SIZE: u32 = 5000;

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Keys {
    pub hashed_principal: u64,
    pub raw_principal: Principal,
}

impl Storable for Keys {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    static KEYS_MAP: RefCell<StableBTreeMap<u64, Principal, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );
}

#[update]
pub fn save_keys() -> Result<(), String> {
    let raw_principal = ic_cdk::api::caller();
    let hashed_principal = hash_principal(raw_principal);
    KEYS_MAP.with(|m| {
        let mut map = m.borrow_mut();
        map.insert(hashed_principal, raw_principal);
        Ok(())
    })
}

#[update]
pub fn delete_keys() -> Result<(), String> {
    let principal = ic_cdk::api::caller();
    let hashed_principal = hash_principal(principal);
    KEYS_MAP.with(|m| {
        let mut map = m.borrow_mut();
        match map.remove(&hashed_principal) {
            Some(_) => Ok(()),
            None => Err(format!("No keys found for user")),
        }
    })
}

#[query]
pub fn get_keys(hashed_principal: u64) -> Option<Principal> {
    KEYS_MAP.with(|m| {
        m.borrow()
            .get(&hashed_principal)
            .map(|principal| principal.clone())
    })
}

fn hash_principal(principal: Principal) -> u64 {
  let hash = Sha256::digest(principal.as_slice());
  let mut bytes = [0u8; 8];
  bytes.copy_from_slice(&hash[..8]); // Turn the first 8 bytes into a u64.
  u64::from_be_bytes(bytes)
}

ic_cdk::export_candid!();
