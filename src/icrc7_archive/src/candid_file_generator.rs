use crate::cycles::WalletReceiveResult;
use crate::types::*;
use candid::export_service;
use candid::Principal;
use ic_cdk_macros::query;
use icrc_ledger_types::icrc3::blocks::GetBlocksRequest;

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    export_service!();
    __export_service()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn save_candid() {
        use std::env;
        use std::fs::write;
        use std::path::PathBuf;

        let dir = PathBuf::from(env::current_dir().unwrap());
        write(dir.join("icrc7_archive.did"), export_candid()).expect("Write failed.");
    }
}
