use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use ic_stable_structures::{writer::Writer, Memory};
use icrc_ledger_types::icrc1::account::Account;

use crate::{
    icrc37_types::LedgerInfo, icrc3_types::ArchiveLedgerInfo, icrc7_types::InitArg, state::STATE,
    utils::account_transformer,
};

#[init]
pub fn init(arg: InitArg) {
    let minting_authority = account_transformer(match arg.minting_account {
        None => {
            let caller = ic_cdk::caller();
            account_transformer(Account {
                owner: caller,
                subaccount: None,
            })
        }
        Some(acc) => account_transformer(acc),
    });

    let mut ledger_info = LedgerInfo::default();
    if let Some(approval_init) = arg.approval_init {
        if let Some(max_approvals_per_token_or_collection) =
            approval_init.max_approvals_per_token_or_collection
        {
            ledger_info.max_approvals_per_token_or_collection =
                max_approvals_per_token_or_collection;
        }
        if let Some(max_revoke_approvals) = approval_init.max_revoke_approvals {
            ledger_info.max_revoke_approvals = max_revoke_approvals;
        }
        if let Some(max_approvals) = approval_init.max_approvals {
            ledger_info.max_approvals = max_approvals;
        }
        if let Some(settle_to_approvals) = approval_init.settle_to_approvals {
            ledger_info.settle_to_approvals = settle_to_approvals;
        }
        if let Some(collection_approval_requires_token) =
            approval_init.collection_approval_requires_token
        {
            ledger_info.collection_approval_requires_token = collection_approval_requires_token;
        }
    }

    let mut archive_ledger_info = ArchiveLedgerInfo::default();
    if let Some(archive_init) = arg.archive_init {
        archive_ledger_info = ArchiveLedgerInfo::new(Some(archive_init.to_archive_setting()))
    }

    STATE.with(|s| {
        let mut s = s.borrow_mut();
        s.minting_authority = Some(minting_authority);
        s.icrc7_symbol = arg.icrc7_symbol;
        s.icrc7_name = arg.icrc7_name;
        s.icrc7_description = arg.icrc7_description;
        s.icrc7_logo = arg.icrc7_logo;
        s.icrc7_supply_cap = arg.icrc7_supply_cap;
        s.icrc7_max_query_batch_size = arg.icrc7_max_query_batch_size;
        s.icrc7_max_update_batch_size = arg.icrc7_max_update_batch_size;
        s.icrc7_max_take_value = arg.icrc7_max_take_value;
        s.icrc7_default_take_value = arg.icrc7_default_take_value;
        s.icrc7_max_memo_size = arg.icrc7_max_memo_size;
        s.icrc7_atomic_batch_transfers = arg.icrc7_atomic_batch_transfers;
        s.tx_window = arg.tx_window;
        s.permitted_drift = arg.permitted_drift;
        s.approval_ledger_info = ledger_info;
        s.archive_ledger_info = archive_ledger_info;
    })
}

#[pre_upgrade]
fn pre_upgrade() {
    // Serialize the state.
    // This example is using CBOR, but you can use any data format you like.
    let mut state_bytes = vec![];
    STATE
        .with(|s| ciborium::ser::into_writer(&*s.borrow(), &mut state_bytes))
        .expect("failed to encode state");

    // Write the length of the serialized bytes to memory, followed by the
    // by the bytes themselves.
    let len = state_bytes.len() as u32;
    let mut memory = crate::memory::get_upgrades_memory();
    let mut writer = Writer::new(&mut memory, 0);
    writer.write(&len.to_le_bytes()).unwrap();
    writer.write(&state_bytes).unwrap();
}

// A post-upgrade hook for deserializing the data back into the heap.
#[post_upgrade]
fn post_upgrade() {
    let memory = crate::memory::get_upgrades_memory();

    // Read the length of the state bytes.
    let mut state_len_bytes = [0; 4];
    memory.read(0, &mut state_len_bytes);
    let state_len = u32::from_le_bytes(state_len_bytes) as usize;

    // Read the bytes
    let mut state_bytes = vec![0; state_len];
    memory.read(4, &mut state_bytes);

    // Deserialize and set the state.
    let state = ciborium::de::from_reader(&*state_bytes).expect("failed to decode state");
    STATE.with(|s| *s.borrow_mut() = state);
}
