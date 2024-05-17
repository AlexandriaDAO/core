use candid::Principal;
// use ic_ledger_types::Subaccount;
use sha2::{Sha256, Digest};

// pub fn principal_to_subaccount(principal_id: &Principal) -> Subaccount {
//   let mut subaccount = [0; std::mem::size_of::<Subaccount>()];
//   let principal_id = principal_id.as_slice();
//   subaccount[0] = principal_id.len().try_into().unwrap();
//   subaccount[1..1 + principal_id.len()].copy_from_slice(principal_id);

//   Subaccount(subaccount)
// }

// pub fn get_swap_canister_principal() -> Principal {
//   Principal::from_text("ie5gv-y6hbb-ll73p-q66aj-4oyzt-tbcuh-odt6h-xkpl7-bwssd-lgzgw-5qe")
//       .expect("Could not decode the principal.")
// }

// pub fn get_swap_canister_subaccount() -> Subaccount {
//   principal_to_subaccount(&get_swap_canister_principal())
// }

// This is important so we don't ever reveal the user's principal, and only in knowing a principal can a user access stuff.
pub fn hash_principal(principal: Principal) -> u64 {
    let hash = Sha256::digest(principal.as_slice());
    let mut bytes = [0u8; 8];
    bytes.copy_from_slice(&hash[..8]); // Turn the first 8 bytes into a u64.
    u64::from_be_bytes(bytes)
}