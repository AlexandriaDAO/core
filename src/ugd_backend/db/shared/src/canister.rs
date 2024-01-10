// use crate::types::interface::MemorySize;
// use core::arch::wasm32::memory_size as wasm_memory_size;
// use ic_cdk::api::stable::{stable_size, WASM_PAGE_SIZE_IN_BYTES};

// pub fn memory_size() -> MemorySize {
//     MemorySize {
//         heap: wasm_memory_size(0) * WASM_PAGE_SIZE_IN_BYTES,
//         stable: stable_size() as usize * WASM_PAGE_SIZE_IN_BYTES,
//     }
// }


// Changed to this to get the IDE to stop complaining.
use crate::types::interface::MemorySize;
#[cfg(target_arch = "wasm32")]
use core::arch::wasm32::memory_size as wasm_memory_size;
use ic_cdk::api::stable::{stable_size, WASM_PAGE_SIZE_IN_BYTES};

pub fn memory_size() -> MemorySize {
    MemorySize {
        #[cfg(target_arch = "wasm32")]
        heap: wasm_memory_size(0) * WASM_PAGE_SIZE_IN_BYTES,
        #[cfg(not(target_arch = "wasm32"))]
        heap: 0, // Provide a default value for non-wasm32 targets
        stable: stable_size() as usize * WASM_PAGE_SIZE_IN_BYTES,
    }
}