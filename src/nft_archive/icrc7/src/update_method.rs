use candid::Principal;
use ic_cdk_macros::update;

use crate::{
    guards::owner_guard, state::STATE, BurnArg, BurnResult, MintArg, MintResult, TransferArg,
    TransferResult,
};
use icrc_ledger_types::icrc1::account::Account;

#[update]
pub fn icrc7_transfer(args: Vec<TransferArg>) -> Vec<Option<TransferResult>> {
    let caller = ic_cdk::caller();
    STATE.with(|s| s.borrow_mut().icrc7_transfer(&caller, args))
}

#[update]
pub fn mint(arg: MintArg) -> MintResult {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return Err(crate::errors::MintError::GenericBatchError {
            error_code: 100,
            message: "Anonymous Identity".into(),
        });
    }
    STATE.with(|s| s.borrow_mut().mint(&caller, arg))
}

#[update]
pub fn burn(args: Vec<BurnArg>) -> Vec<Option<BurnResult>> {
    let caller = ic_cdk::caller();
    STATE.with(|s| s.borrow_mut().burn(&caller, args))
}

#[update(guard = "owner_guard")]
pub fn set_minting_authority(minting_account: Account) -> bool {
    STATE.with(|s| s.borrow_mut().minting_authority = Some(minting_account));
    return true;
}
