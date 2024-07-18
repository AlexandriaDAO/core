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
pub struct Librarian {
    pub hashed_principal: u64,
    pub raw_principal: Principal,
    pub name: String,
}

impl Storable for Librarian {
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
    static LIBRARIAN_MAP: RefCell<StableBTreeMap<u64, Librarian, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );
}

#[update]
pub fn save_librarian(name: String) -> Result<(), String> {
    let raw_principal = ic_cdk::api::caller();
    if raw_principal == Principal::anonymous() {
        Err(format!("User must be logged in to save librarian"))
    } else {
        let hashed_principal = hash_principal(raw_principal);
        LIBRARIAN_MAP.with(|m| {
            let mut map = m.borrow_mut();
            if !map.contains_key(&hashed_principal) {
                let librarian = Librarian {
                    hashed_principal,
                    raw_principal,
                    name,
                };
                map.insert(hashed_principal, librarian);
                Ok(())
            } else {
                Err(format!("Librarian already exists"))
            }
        })
    }
}

#[update]
pub fn delete_librarian() -> Result<(), String> {
    let principal = ic_cdk::api::caller();
    let hashed_principal = hash_principal(principal);
    LIBRARIAN_MAP.with(|m| {
        let mut map = m.borrow_mut();
        match map.remove(&hashed_principal) {
            Some(_) => Ok(()),
            None => Err(format!("No librarian found")),
        }
    })
}

#[query]
pub fn is_librarian() -> bool {
    let principal = ic_cdk::api::caller();
    if principal == Principal::anonymous() {
        false
    } else {
        let hashed_principal = hash_principal(principal);
        get_librarian(hashed_principal).is_some()
    }
}

#[query]
pub fn get_hashes_and_names() -> Vec<(u64, String)> {
    LIBRARIAN_MAP.with(|m| {
        m.borrow()
            .iter()
            .map(|(hashed_principal, librarian)| (hashed_principal, librarian.name.clone()))
            .collect()
    })
}

#[query]
pub fn get_librarian(hashed_principal: u64) -> Option<Librarian> {
    LIBRARIAN_MAP.with(|m| {
        m.borrow()
            .get(&hashed_principal)
            .map(|librarian| librarian.clone())
    })
}

#[query]
pub fn get_all_librarians() -> Vec<Librarian> {
    LIBRARIAN_MAP.with(|m| {
        m.borrow()
            .iter()
            .map(|(_, librarian)| librarian.clone())
            .collect()
    })
}

#[query]
pub fn get_random_librarian() -> Option<Librarian> {
    LIBRARIAN_MAP.with(|m| {
        let map = m.borrow();
        let len = map.len();
        if len == 0 {
            None
        } else {
            let random_index = ic_cdk::api::time() % len;
            map.iter().nth(random_index as usize).map(|(_, librarian)| librarian.clone())
        }
    })
}

fn hash_principal(principal: Principal) -> u64 {
    let hash = Sha256::digest(principal.as_slice());
    let mut bytes = [0u8; 8];
    bytes.copy_from_slice(&hash[..8]); // Turn the first 8 bytes into a u64.
    u64::from_be_bytes(bytes)
}
