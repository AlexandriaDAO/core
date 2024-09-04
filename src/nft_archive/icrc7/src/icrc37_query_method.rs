use candid::Nat;
use ic_cdk_macros::query;
use icrc_ledger_types::icrc1::account::Account;

use crate::{
    icrc37_types::{CollectionApproval, IsApprovedArg, Metadata, TokenApproval},
    state::STATE,
};

// Returns the approval-related metadata of the ledger implementation.
#[query]
pub fn icrc37_metadata() -> Metadata {
    STATE.with(|s| s.borrow().icrc37_metadata())
}

// Returns the maximum number of approvals this ledger implementation allows to be active per token or per principal for the collection.
#[query]
pub fn icrc37_max_approvals_per_token_or_collection() -> Option<Nat> {
    STATE.with(|s| {
        Some(Nat::from(
            s.borrow()
                .approval_ledger_info
                .max_approvals_per_token_or_collection,
        ))
    })
}

// Returns the maximum number of approvals that may be revoked in a single invocation of `icrc37_revoke_token_approvals` or `icrc37_revoke_collection_approvals`.
#[query]
pub fn icrc37_max_revoke_approvals() -> Option<Nat> {
    STATE.with(|s| {
        Some(Nat::from(
            s.borrow().approval_ledger_info.max_revoke_approvals,
        ))
    })
}

// Returns `true` if an active approval, i.e., a token-level approval or collection-level approval
#[query]
pub fn icrc37_is_approved(args: Vec<IsApprovedArg>) -> Vec<bool> {
    STATE.with(|s| s.borrow().icrc37_is_approved(args))
}

// Returns the token-level approvals that exist for the given `token_id`.
#[query]
pub fn icrc37_get_token_approvals(
    token_id: u128,
    prev: Option<TokenApproval>,
    take: Option<u128>,
) -> Vec<TokenApproval> {
    STATE.with(|s| s.borrow().icrc37_get_token_approvals(token_id, prev, take))
}

// Returns the collection-level approvals that exist for the specified `owner`.
#[ic_cdk::query]
pub fn icrc37_get_collection_approvals(
    owner: Account,
    prev: Option<CollectionApproval>,
    take: Option<u128>,
) -> Vec<CollectionApproval> {
    STATE.with(|s| {
        s.borrow()
            .icrc37_get_collection_approvals(owner, prev, take)
    })
}
