use candid::Principal;

pub const ALEX_CANISTER_ID: &str = "7hcrm-4iaaa-aaaak-akuka-cai";
pub const ICP_SWAP_CANISTER_ID: &str = "5qx27-tyaaa-aaaal-qjafa-cai";
pub const LIBRARIAN: &str = "xswc6-jimwj-wnqog-3gmkv-hglw4-aedfy-bqmr2-5uyut-cnbbg-4wvsk-bqe";
pub const USER: &str = "bct62-kglfp-ljyff-3uhhx-yhc2v-pg3ms-xviiq-dorhc-5iibd-fopgs-gae";
pub const FRONTEND_CANISTER_ID: &str = "xo3nl-yaaaa-aaaap-abl4q-cai";
pub const MAX_ALEX: u64 = 2100000000000000; // 21 million 

pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}
