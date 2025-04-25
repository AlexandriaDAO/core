use ic_cdk;

mod id_converter;
pub use id_converter::*;

mod storage;
pub use storage::*;
mod update;
pub use update::*;

mod queries;
pub use queries::*;


mod guard;
pub use guard::{*};


pub mod utils;
use icrc_ledger_types::icrc1::transfer::BlockIndex;

use candid::{Nat, Principal};
use ic_ledger_types::Subaccount;
ic_cdk::export_candid!();

// NFT
//To mint an NFT for testing, the current ICRC7 implementation has a condition that allows only the NFT manager to mint.
// I minted a nft with token id 1 for testing purpose using nft_manager.
// Most time got to resolve this erorr
// Argumnet required to be an array of NAT I was passing only single NAT.
// Error from Canister 53ewn-qqaaa-aaaap-qkmqq-cai: Canister called `ic0.trap` with message: IDL error: unexpected IDL type when parsing [Nat].\nConsider gracefully handling failures from this canister or altering the canister to handle exceptions. See documentation: http://internetcomputer.org/docs/current/references/execution-errors#trapped-explicitly"))

//Explored the ICRC7 canister, but it does not have a `transfer` function, which was a blocker for me.
//I also reviewed the documentation and examples of the ICRC7 standard. ICRC7 example canister was implementing the ICRC37 standard
//which includes the required functions such as `transfer_from` and `approve`.
//As discussed, we need to identify the previous owner by retrieving the most recent transaction using `icrc3_get_blocks`.
//I tested this functionality through the Candid UI, and it successfully returned the block information.
// We may need handle this previous owner approach for worst-case scenarios.
