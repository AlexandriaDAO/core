// Saves Meilisearch Access keys for a user based on their principal

use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_cdk::export::candid;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;

use ic_cdk::api::caller;

type Memory = VirtualMemory<DefaultMemoryImpl>;

const MAX_VALUE_SIZE: u32 = 1000;
const MAX_KEYS_PER_USER: u8 = 10;

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct MeiliSearchKeys {
    pub meili_domain: String,
    pub meili_key: String,
    pub slot: u8,
}

impl Storable for MeiliSearchKeys {
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

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
struct PrincipalWrapper(Principal);

#[derive(Clone, Debug, CandidType, Deserialize)]
struct MeiliSearchKeysVec(Vec<MeiliSearchKeys>);

impl Storable for PrincipalWrapper {
  fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(self.0.as_slice().to_vec())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
      PrincipalWrapper(Principal::from_slice(bytes.as_ref()))
    }
    
    const BOUND: Bound = Bound::Bounded {
      max_size: 29,
        is_fixed_size: false,
      };
    }

impl Storable for MeiliSearchKeysVec {
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
    static KEYS_MAP: RefCell<StableBTreeMap<PrincipalWrapper, MeiliSearchKeysVec, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );
}

#[ic_cdk_macros::query]
pub fn whoami() -> Principal {
    let principal_from_caller: Principal = caller();
    principal_from_caller
}

// Save keys with cdk::caller()
#[ic_cdk_macros::update]
pub fn save_meilisearch_keys(
    meili_domain: String,
    meili_key: String,
    slot_index: u8,
) -> Result<(), String> {
    let principal =  ic_cdk::api::caller();
    let keys = MeiliSearchKeys {
        meili_domain,
        meili_key,
        slot: slot_index,
    };
    KEYS_MAP.with(|m| {
        let mut map = m.borrow_mut();
        let user_keys = match map.get(&PrincipalWrapper(principal)) {
            Some(keys_vec) => {
                let mut updated_keys_vec = keys_vec.clone();
                if slot_index < MAX_KEYS_PER_USER as u8 {
                    let slot_exists = updated_keys_vec.0.iter().any(|k| k.slot == slot_index);
                    if slot_exists {
                        updated_keys_vec.0.retain(|k| k.slot != slot_index);
                    }
                    updated_keys_vec.0.push(keys);
                    map.insert(PrincipalWrapper(principal), updated_keys_vec);
                    Ok(())
                } else {
                    Err(format!("Invalid slot index. Maximum number of keys per user is {}", MAX_KEYS_PER_USER))
                }
            }
            None => {
                let new_keys_vec = MeiliSearchKeysVec(vec![keys]);
                map.insert(PrincipalWrapper(principal), new_keys_vec);
                Ok(())
            }
        };
        user_keys
    })
}

#[ic_cdk_macros::query]
pub fn get_meilisearch_keys() -> Vec<MeiliSearchKeys> {
    let principal = ic_cdk::api::caller();
    KEYS_MAP.with(|m| {
        m.borrow()
            .get(&PrincipalWrapper(principal))
            .map(|keys| keys.0.clone())
            .unwrap_or_default()
    })
}
















// // Save keys by adding principal to the call
// #[ic_cdk_macros::update]
// pub fn save_meilisearch_keys(
//     principal_text: String,
//     meili_domain: String,
//     meili_key: String,
//     slot_index: u8,
// ) -> Result<(), String> {
//     let principal = Principal::from_text(principal_text).unwrap();
//     let keys = MeiliSearchKeys {
//         meili_domain,
//         meili_key,
//         slot: slot_index,
//     };
//     KEYS_MAP.with(|m| {
//         let mut map = m.borrow_mut();
//         let user_keys = match map.get(&PrincipalWrapper(principal)) {
//             Some(keys_vec) => {
//                 let mut updated_keys_vec = keys_vec.clone();
//                 if slot_index < MAX_KEYS_PER_USER as u8 {
//                     let slot_exists = updated_keys_vec.0.iter().any(|k| k.slot == slot_index);
//                     if slot_exists {
//                         updated_keys_vec.0.retain(|k| k.slot != slot_index);
//                     }
//                     updated_keys_vec.0.push(keys);
//                     map.insert(PrincipalWrapper(principal), updated_keys_vec);
//                     Ok(())
//                 } else {
//                     Err(format!("Invalid slot index. Maximum number of keys per user is {}", MAX_KEYS_PER_USER))
//                 }
//             }
//             None => {
//                 let new_keys_vec = MeiliSearchKeysVec(vec![keys]);
//                 map.insert(PrincipalWrapper(principal), new_keys_vec);
//                 Ok(())
//             }
//         };
//         user_keys
//     })
// }

// #[ic_cdk_macros::query]
// pub fn get_meilisearch_keys(principal_text: String) -> Vec<MeiliSearchKeys> {
//     let principal = Principal::from_text(principal_text).unwrap();
//     KEYS_MAP.with(|m| {
//         m.borrow()
//             .get(&PrincipalWrapper(principal))
//             .map(|keys| keys.0.clone())
//             .unwrap_or_default()
//     })
// }















// // OG
  
// #[ic_cdk_macros::query]
// pub fn whoami(principal_text: String) -> String {
//     format!("Principal: {}!", principal_text)
// }

// #[ic_cdk_macros::query]
// pub fn cdk_caller() -> String {
//     let principal_from_caller: Principal = caller();
//     format!("Caller IC CDK: {}", principal_from_caller)
// }

// // Save to a particular slot that gets overridden.
// #[ic_cdk_macros::update]
// pub fn save_meilisearch_keys(
//     principal_text: String,
//     meili_domain: String,
//     meili_key: String,
//     slot_index: u8,
// ) -> Result<(), String> {
//     let principal = Principal::from_text(principal_text).unwrap();
//     let keys = MeiliSearchKeys {
//         meili_domain,
//         meili_key,
//         slot: slot_index,
//     };
//     KEYS_MAP.with(|m| {
//         let mut map = m.borrow_mut();
//         let user_keys = match map.get(&PrincipalWrapper(principal)) {
//             Some(keys_vec) => {
//                 let mut updated_keys_vec = keys_vec.clone();
//                 if slot_index < MAX_KEYS_PER_USER as u8 {
//                     let slot_exists = updated_keys_vec.0.iter().any(|k| k.slot == slot_index);
//                     if slot_exists {
//                         updated_keys_vec.0.retain(|k| k.slot != slot_index);
//                     }
//                     updated_keys_vec.0.push(keys);
//                     map.insert(PrincipalWrapper(principal), updated_keys_vec);
//                     Ok(())
//                 } else {
//                     Err(format!("Invalid slot index. Maximum number of keys per user is {}", MAX_KEYS_PER_USER))
//                 }
//             }
//             None => {
//                 let new_keys_vec = MeiliSearchKeysVec(vec![keys]);
//                 map.insert(PrincipalWrapper(principal), new_keys_vec);
//                 Ok(())
//             }
//         };
//         user_keys
//     })
// }

// #[ic_cdk_macros::query]
// pub fn get_meilisearch_keys(principal_text: String) -> Vec<MeiliSearchKeys> {
//     let principal = Principal::from_text(principal_text).unwrap();
//     KEYS_MAP.with(|m| {
//         m.borrow()
//             .get(&PrincipalWrapper(principal))
//             .map(|keys| keys.0.clone())
//             .unwrap_or_default()
//     })
// }





































// // Simpler option using strings instead of the Principal type.

// thread_local! {
//     static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));  

//     static KEYS_MAP: RefCell<StableBTreeMap<String, MeiliSearchKeys, Memory>> = RefCell::new(
//         StableBTreeMap::init(
//             MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),  
//         )
//     );
// }


// #[ic_cdk_macros::query]
// pub fn whoami(name: String) -> String {
//     format!("Logged in with Principal: {}!", name)
// }

// #[ic_cdk_macros::update]
// pub fn save_meilisearch_keys(
//     name: String,
//     meili_domain: String,
//     meili_master_key: String,
// ) -> () {
//     let keys = MeiliSearchKeys {
//         meili_domain,
//         meili_master_key,
//     };
//     KEYS_MAP.with(|m| m.borrow_mut().insert(name, keys));
// }

// #[ic_cdk_macros::query]
// pub fn get_meilisearch_keys(name: String) -> Option<MeiliSearchKeys> {
//     KEYS_MAP.with(|m| m.borrow().get(&name).map(|keys| keys.clone()))
// }


