// // Submit your principal here and become a librarian.
// // This will store your principal which will be used to decrypt api keys and wallet keys.

// // Setup:
// // We'll hash the user's principal, and allow access of the principal through the hash.
// // We'll allow adding and deleting oneself from the list of librarians, which will control access on the frontend.
// // We'll allow everyone to query by principal hash.


// use candid::{CandidType, Decode, Deserialize, Encode, Principal};
// use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
// use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
// use std::borrow::Cow;
// use std::cell::RefCell;
// use ic_cdk::{query, update};
// use sha2::{Sha256, Digest};

// use ic_cdk::api::caller;

// type Memory = VirtualMemory<DefaultMemoryImpl>;

// const MAX_VALUE_SIZE: u32 = 5000;
// const MAX_KEYS: u8 = 100;

// #[derive(Clone, Debug, CandidType, Deserialize)]
// pub struct Keys {
//   pub raw_principal: String,
//   pub hashed_principal: String,
//   pub slot: u8,
// }

// impl Storable for Keys {
//     fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
//         Cow::Owned(Encode!(self).unwrap())
//     }

//     fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
//         Decode!(bytes.as_ref(), Self).unwrap()
//     }

//     const BOUND: Bound = Bound::Bounded {
//         max_size: MAX_VALUE_SIZE,
//         is_fixed_size: false,
//     };
// }

// #[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
// struct PrincipalWrapper(Principal);

// #[derive(Clone, Debug, CandidType, Deserialize)]
// struct KeysVec(Vec<Keys>);

// impl Storable for PrincipalWrapper {
//   fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
//         Cow::Owned(self.0.as_slice().to_vec())
//     }

//     fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
//       PrincipalWrapper(Principal::from_slice(bytes.as_ref()))
//     }
    
//     const BOUND: Bound = Bound::Bounded {
//       max_size: 29,
//         is_fixed_size: false,
//       };
//     }

// impl Storable for KeysVec {
//   fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
//       Cow::Owned(Encode!(self).unwrap())
//   }

//   fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
//       Decode!(bytes.as_ref(), Self).unwrap()
//   }

//   const BOUND: Bound = Bound::Bounded {
//       max_size: MAX_VALUE_SIZE,
//       is_fixed_size: false,
//   };
// }

// thread_local! {
//     static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
//     static KEYS_MAP: RefCell<StableBTreeMap<PrincipalWrapper, KeysVec, Memory>> = RefCell::new(
//         StableBTreeMap::init(
//             MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
//         )
//     );
// }

// // Save keys with cdk::caller()
// #[update]
// pub fn save_keys() -> Result<(), String> {
//     let raw_principal =  ic_cdk::api::caller();
//     let hashed_principal = hash_principal(principal);
//     let keys = Keys {
//         raw_principal,
//         hashed_principal,
//         slot: slot_index,
//     };
//     KEYS_MAP.with(|m| {
//         let mut map = m.borrow_mut();
//         let user_keys = match map.get(&PrincipalWrapper(principal)) {
//             Some(keys_vec) => {
//                 let mut updated_keys_vec = keys_vec.clone();
//                 if slot_index < MAX_KEYS as u8 {
//                     let slot_exists = updated_keys_vec.0.iter().any(|k| k.slot == slot_index);
//                     if slot_exists {
//                         updated_keys_vec.0.retain(|k| k.slot != slot_index);
//                     }
//                     updated_keys_vec.0.push(keys);
//                     map.insert(PrincipalWrapper(principal), updated_keys_vec);
//                     Ok(())
//                 } else {
//                     Err(format!("Invalid slot index. Maximum number of keys per user is {}", MAX_KEYS))
//                 }
//             }
//             None => {
//                 let new_keys_vec = KeysVec(vec![keys]);
//                 map.insert(PrincipalWrapper(principal), new_keys_vec);
//                 Ok(())
//             }
//         };
//         user_keys
//     })
// }

// #[update]
// pub fn delete_keys(slot_index: u8) -> Result<(), String> {
//     let principal = ic_cdk::api::caller();
//     KEYS_MAP.with(|m| {
//         let mut map = m.borrow_mut();
//         match map.remove(&PrincipalWrapper(principal)) {
//             Some(mut keys_vec) => {
//                 let original_length = keys_vec.0.len();
//                 keys_vec.0.retain(|k| k.slot != slot_index);
//                 if keys_vec.0.len() < original_length {
//                     map.insert(PrincipalWrapper(principal), keys_vec);
//                     Ok(())
//                 } else {
//                     map.insert(PrincipalWrapper(principal), keys_vec);
//                     Err(format!("No keys found for slot index {}", slot_index))
//                 }
//             }
//             None => Err(format!("No keys found for user")),
//         }
//     })
// }

// #[query]
// pub fn get_keys() -> Vec<Keys> {
//     let principal = ic_cdk::api::caller();
//     KEYS_MAP.with(|m| {
//         m.borrow()
//             .get(&PrincipalWrapper(principal))
//             .map(|keys| keys.0.clone())
//             .unwrap_or_default()
//     })
// }


// fn hash_principal(principal: Principal) -> u64 {
//   let hash = Sha256::digest(principal.as_slice());
//   let mut bytes = [0u8; 8];
//   bytes.copy_from_slice(&hash[..8]); // Turn the first 8 bytes into a u64.
//   u64::from_be_bytes(bytes)
// }