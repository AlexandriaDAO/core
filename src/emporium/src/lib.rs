
use ic_cdk;

mod storage;
pub use storage::*;
mod update;
pub use update::*;

pub mod utils;


ic_cdk::export_candid!();

// NFT 
//To mint an NFT for testing, the current ICRC7 implementation has a condition that allows only the NFT manager to mint.
// I minted a nft with token id 1 for testing purpose using nft_manager. 
// Most time got to resolve this erorr 
// Argumnet required to be an array of NAT I was passing only single NAT.
// Error from Canister 53ewn-qqaaa-aaaap-qkmqq-cai: Canister called `ic0.trap` with message: IDL error: unexpected IDL type when parsing [Nat].\nConsider gracefully handling failures from this canister or altering the canister to handle exceptions. See documentation: http://internetcomputer.org/docs/current/references/execution-errors#trapped-explicitly"))


