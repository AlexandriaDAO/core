
pub mod utils;
mod update;
pub use update::*;

mod queries;
pub use queries::*;
mod storage;
pub use storage::*;

use candid::{CandidType, Nat, Principal};
use ic_cdk::{caller, query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable};
use serde::Deserialize;
use std::cell::RefCell;
use utils::is_owner;





ic_cdk::export_candid!();
