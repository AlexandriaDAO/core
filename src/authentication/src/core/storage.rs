/// Stable storage utilities using IC best practices
/// Simple, robust design that survives canister upgrades
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl,
};
use std::cell::RefCell;

/// Type aliases for cleaner code
pub type Memory = VirtualMemory<DefaultMemoryImpl>;

// Global memory manager - automatically initialized on first use
// This is IC's recommended pattern for stable storage
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
}

//===================================================================================================
// PUBLIC API FUNCTIONS
//===================================================================================================

/// Get dedicated memory region for a specific data structure
/// Each memory ID gets its own isolated storage space
pub fn get_memory(id: u8) -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(id)))
}

//===================================================================================================
// MEMORY ID ALLOCATION
//===================================================================================================

/// Memory ID allocation - keeps things organized and prevents conflicts
/// Simple numeric constants are easier to understand than complex schemes
pub mod memory_ids {
    // Ethereum settings and data
    pub const ETHEREUM_SETTINGS: u8 = 0;
    pub const ETHEREUM_MESSAGES: u8 = 1;
    pub const ETHEREUM_SESSIONS: u8 = 2;
    // Leave room for ethereum expansion

    // Solana settings and data
    pub const SOLANA_SETTINGS: u8 = 10;
    pub const SOLANA_MESSAGES: u8 = 11;
    pub const SOLANA_SESSIONS: u8 = 12;
    // Leave room for solana expansion

    // Arweave settings and data
    pub const ARWEAVE_SETTINGS: u8 = 20;
    pub const ARWEAVE_MESSAGES: u8 = 21;
    pub const ARWEAVE_SESSIONS: u8 = 22;
    // Leave room for arweave expansion


    // Oisy settings and data
    pub const OISY_SETTINGS: u8 = 30;
    // Oisy doesn't use messages
    pub const OISY_SESSIONS: u8 = 31;
    // Leave room for arweave expansion
}