use ic_cdk_macros::update;

use crate::{
    guards::authenticated_guard,
    icrc37_types::{
        ApproveCollectionArg, ApproveCollectionResult, ApproveTokenArg, ApproveTokenResult,
        RevokeCollectionApprovalArg, RevokeCollectionApprovalResult, RevokeTokenApprovalArg,
        RevokeTokenApprovalResult, TransferFromArg, TransferFromResult,
    },
    state::STATE,
};

#[update(guard = "authenticated_guard")]
pub fn icrc37_approve_tokens(args: Vec<ApproveTokenArg>) -> Vec<Option<ApproveTokenResult>> {
    let caller = ic_cdk::caller();
    STATE.with(|s| s.borrow_mut().approve(&caller, args))
}

#[update(guard = "authenticated_guard")]
pub fn icrc37_approve_collection(
    args: Vec<ApproveCollectionArg>,
) -> Vec<Option<ApproveCollectionResult>> {
    let caller = ic_cdk::caller();

    STATE.with(|s| s.borrow_mut().collection_approve(&caller, args))
}

// Revokes the specified approvals for a token given by `token_id` from the set of active approvals.
#[ic_cdk::update(guard = "authenticated_guard")]
pub fn icrc37_revoke_token_approvals(
    args: Vec<RevokeTokenApprovalArg>,
) -> Vec<Option<RevokeTokenApprovalResult>> {
    let caller = ic_cdk::caller();

    STATE.with(|s| s.borrow_mut().revoke_approve(&caller, args))
}

// Revokes collection-level approvals from the set of active approvals.
#[ic_cdk::update(guard = "authenticated_guard")]
pub fn icrc37_revoke_collection_approvals(
    args: Vec<RevokeCollectionApprovalArg>,
) -> Vec<Option<RevokeCollectionApprovalResult>> {
    let caller = ic_cdk::caller();

    STATE.with(|s| s.borrow_mut().revoke_collection_approve(&caller, args))
}

// Transfers one or more tokens from the from account to the to account.
// The transfer can be initiated by the holder of the tokens.
#[ic_cdk::update(guard = "authenticated_guard")]
pub fn icrc37_transfer_from(args: Vec<TransferFromArg>) -> Vec<Option<TransferFromResult>> {
    let caller = ic_cdk::caller();

    STATE.with(|s| s.borrow_mut().transfer_from(&caller, args))
}
