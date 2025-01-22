// use candid::{CandidType, Principal};
// use ic_cdk::api::call::call;
// use ic_cdk::api::management_canister::provisional::CanisterSettings;
// use serde::{Deserialize, Serialize};

// #[derive(CandidType, Serialize)]
// struct CreateCanisterArgs {
//     settings: Option<CanisterSettings>,
// }

// #[derive(CandidType, Deserialize)]
// struct CreateCanisterResult {
//     canister_id: Principal,
// }

// #[ic_cdk::update]
// async fn create_asset_canister(name: String) -> Result<Principal, String> {
//     // Create a new canister
//     let create_args = CreateCanisterArgs {
//         settings: Some(CanisterSettings {
//             controllers: Some(vec![ic_cdk::api::id(), ic_cdk::caller()]), // Add both the calling canister and the caller as controllers
//             compute_allocation: None,
//             memory_allocation: None,
//             freezing_threshold: None,
//             reserved_cycles_limit: None,
//             log_visibility: None,
//             wasm_memory_limit: None,
//         }),
//     };

//     let (create_result,): (CreateCanisterResult,) = call(
//         Principal::management_canister(),
//         "create_canister",
//         (create_args,),
//     )
//     .await
//     .map_err(|e| format!("Failed to create canister: {}", e.1))?;

//     let asset_canister_id = create_result.canister_id;
//     ic_cdk::println!("Created new asset canister with ID: {}", asset_canister_id);

//     Ok(asset_canister_id)
// }

// ic_cdk::export_candid!();
use candid::{CandidType, Encode, Principal};
use ic_cdk::api::call::call;
use ic_cdk::api::management_canister::provisional::CanisterSettings;
use serde::{Deserialize, Serialize};
use ic_cdk::api::management_canister::main::{CanisterInstallMode, InstallCodeArgument};

#[derive(CandidType, Serialize)]
struct CreateCanisterArgs {
    settings: Option<CanisterSettings>,
}

#[derive(CandidType, Deserialize)]
struct CreateCanisterResult {
    canister_id: Principal,
}


#[ic_cdk::update]
async fn create_asset_canister() -> Result<Principal, String> {
    // Step 1: Create a new canister
    let create_args = CreateCanisterArgs {
        settings: Some(CanisterSettings {
            controllers: Some(vec![ic_cdk::api::id(), ic_cdk::caller()]),
            compute_allocation: None,
            memory_allocation: None,
            freezing_threshold: None,
            reserved_cycles_limit: None,
            log_visibility: None,
            wasm_memory_limit: None,
        }),
    };

    let (create_result,): (CreateCanisterResult,) = call(
        Principal::management_canister(),
        "create_canister",
        (create_args,),
    )
    .await
    .map_err(|e| format!("Failed to create canister: {}", e.1))?;

    let asset_canister_id = create_result.canister_id;
    ic_cdk::println!("Created new asset canister with ID: {}", asset_canister_id);

    // // Step 2: Load the asset canister WASM module
    // let wasm_module: Vec<u8> =
    //     include_bytes!("./assets_canister.wasm").to_vec();

    // // Step 3: Encode initialization arguments (empty for the asset canister)
    // let init_args: Vec<u8> = Encode!().map_err(|e| format!("Failed to encode init args: {}", e))?;

    // // Step 4: Call `install_code`
    // call::<(Principal, Vec<u8>, Vec<u8>, String), ()>(
    //     Principal::management_canister(),
    //     "install_code",
    //     (
    //         asset_canister_id,
    //         wasm_module,
    //         init_args,
    //         "install".to_string(),
    //     ),
    // )
    // .await
    // .map_err(|e| format!("Failed to install asset canister: {}", e.1))?;

    // ic_cdk::println!("Asset canister installed successfully.");
    Ok(asset_canister_id)
}
#[ic_cdk::update]
async fn install_asset_canister(canister_id: Principal) -> Result<(), String> {
    const WASM_MODULE: &[u8] = include_bytes!("./assets_canister.wasm");

    // Create the install_code arguments
    let install_args = InstallCodeArgument {
        mode: CanisterInstallMode::Install,
        canister_id,
        wasm_module: WASM_MODULE.to_vec(),
        arg: vec![], // Empty arguments for the asset canister
    };

    // Call the Management Canister's `install_code` method
    ic_cdk::api::call::call_with_payment(
        Principal::management_canister(),
        "install_code",
        (install_args,),
        0, // You might need to adjust the payment amount
    )
    .await
    .map_err(|e| format!("Failed to install asset canister: {:?}", e))?;

    ic_cdk::println!("Successfully installed asset canister.");
    Ok(())
}
ic_cdk::export_candid!();
