use candid::{CandidType, Deserialize, Encode, Principal};
use ic_cdk::api::management_canister::{
    main::{create_canister, install_code, CreateCanisterArgument, InstallCodeArgument},
    provisional::CanisterSettings,
};
use serde::Serialize;

use crate::icrc3_types::{ArchiveCreateArgs, IndexType};

pub const ARCHIVE_WASM: &[u8] =
    std::include_bytes!("./../../icrc7_archive/wasm/icrc7_archive.wasm.gz");

pub const ARCHIVE_DEFAULT_CYCLES: u128 = 10_000_000_000_000;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ArchiveInitArgs {
    pub first_index: u128,
    pub index_type: IndexType,
    pub max_pages: u128,
    pub max_records: u128,
}

impl ArchiveInitArgs {
    fn new(max_pages: u128, max_records: u128, first_index: u128) -> Self {
        Self {
            index_type: IndexType::Stable,
            first_index,
            max_pages,
            max_records,
        }
    }
}

#[allow(unused)]
pub async fn create_archive_canister(arg: ArchiveCreateArgs) -> Result<Principal, String> {
    let mut archive_controllers = vec![ic_cdk::id()];

    if let Some(Some(controllers)) = arg.controllers {
        if !controllers.is_empty() {
            archive_controllers.extend(controllers);
        }
    }

    let principal = match create_canister(
        CreateCanisterArgument {
            settings: Some(CanisterSettings {
                controllers: Some(archive_controllers),
                compute_allocation: None,
                memory_allocation: None,
                freezing_threshold: None,
                reserved_cycles_limit: None,
            }),
        },
        ARCHIVE_DEFAULT_CYCLES,
    )
    .await
    {
        Err((code, msg)) => return Err(format!("Rejection Code: {:?}, Message: {:?}", code, msg)),
        Ok((principal,)) => principal.canister_id,
    };
    ic_cdk::println!("new archive canister: {}", principal);

    let init_arg = ArchiveInitArgs::new(arg.max_pages, arg.max_records, arg.first_index);
    let init_arg = Encode!(&init_arg).unwrap();
    match install_code(InstallCodeArgument {
        mode: ic_cdk::api::management_canister::main::CanisterInstallMode::Install,
        canister_id: principal,
        wasm_module: ARCHIVE_WASM.to_vec(),
        arg: init_arg,
    })
    .await
    {
        Ok(()) => Ok(principal),
        Err((code, msg)) => Err(format!("Code: {:?}, Message: {:?}", code, msg)),
    }
}
