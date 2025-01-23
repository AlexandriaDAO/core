// // use candid::{CandidType, Principal};
// // use ic_cdk::api::call::call;
// // use ic_cdk::api::management_canister::provisional::CanisterSettings;
// // use serde::{Deserialize, Serialize};

// // #[derive(CandidType, Serialize)]
// // struct CreateCanisterArgs {
// //     settings: Option<CanisterSettings>,
// // }

// // #[derive(CandidType, Deserialize)]
// // struct CreateCanisterResult {
// //     canister_id: Principal,
// // }

// // #[ic_cdk::update]
// // async fn create_asset_canister(name: String) -> Result<Principal, String> {
// //     // Create a new canister
// //     let create_args = CreateCanisterArgs {
// //         settings: Some(CanisterSettings {
// //             controllers: Some(vec![ic_cdk::api::id(), ic_cdk::caller()]), // Add both the calling canister and the caller as controllers
// //             compute_allocation: None,
// //             memory_allocation: None,
// //             freezing_threshold: None,
// //             reserved_cycles_limit: None,
// //             log_visibility: None,
// //             wasm_memory_limit: None,
// //         }),
// //     };

// //     let (create_result,): (CreateCanisterResult,) = call(
// //         Principal::management_canister(),
// //         "create_canister",
// //         (create_args,),
// //     )
// //     .await
// //     .map_err(|e| format!("Failed to create canister: {}", e.1))?;

// //     let asset_canister_id = create_result.canister_id;
// //     ic_cdk::println!("Created new asset canister with ID: {}", asset_canister_id);

// //     Ok(asset_canister_id)
// // }

// // ic_cdk::export_candid!();
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
// #[ic_cdk::update]
// async fn install_asset_canister(canister_id: Principal) -> Result<(), String> {
//     const WASM_MODULE: &[u8] = include_bytes!("./assets_canister.wasm");

//     // Create the install_code arguments
//     let install_args = InstallCodeArgument {
//         mode: CanisterInstallMode::Install,
//         canister_id,
//         wasm_module: WASM_MODULE.to_vec(),
//         arg: vec![], // Empty arguments for the asset canister
//     };

//     // Call the Management Canister's `install_code` method
//     ic_cdk::api::call::call_with_payment(
//         Principal::management_canister(),
//         "install_code",
//         (install_args,),
//         1000000,
//     )
//     .await
//     .map_err(|e| format!("Failed to install asset canister: {:?}", e))?;

//     ic_cdk::println!("Successfully installed asset canister.");
//     Ok(())
// }

#[ic_cdk::update]
async fn install_asset_canister(canister_id: Principal) -> Result<(), String> {
    const WASM_MODULE: &[u8] = include_bytes!("./ic_frontend_canister.wasm");

    let install_args = InstallCodeArgument {
        mode: CanisterInstallMode::Install,
        canister_id,
        wasm_module: WASM_MODULE.to_vec(),
        arg: Encode!().expect("Failed to encode args"), // Explicit empty args encoding
    };

    ic_cdk::api::call::call_with_payment(
        Principal::management_canister(),
        "install_code",
        (install_args,),
        500_000_000_000, // Increased cycles
    )
    .await
    .map_err(|e| format!("Installation failed: {:?}", e))?;

    Ok(())
}

// use candid::{CandidType, Encode, Principal};
// use ic_cdk::api::call::{call, call_with_payment};
// use ic_cdk::api::management_canister::provisional::CanisterSettings;
// use ic_cdk::api::management_canister::main::{CanisterInstallMode, InstallCodeArgument};
// use serde::{Deserialize, Serialize};
// use ic_asset::;

// #[derive(CandidType, Serialize)]
// struct CreateCanisterArgs {
//     settings: Option<CanisterSettings>,
// }

// #[derive(CandidType, Deserialize)]
// struct CreateCanisterResult {
//     canister_id: Principal,
// }

// #[ic_cdk::update]
// async fn create_and_deploy_asset_canister(asset_path: String) -> Result<Principal, String> {
//     // Step 1: Create Canister
//     let create_args = CreateCanisterArgs {
//         settings: Some(CanisterSettings {
//             controllers: Some(vec![ic_cdk::api::id(), ic_cdk::caller()]),
//             compute_allocation: None,
//             memory_allocation: None,
//             freezing_threshold: None,
//             reserved_cycles_limit: None,
//             log_visibility: None,
//             wasm_memory_limit: None,
//         }),
//     };

//     // Create canister
//     let (create_result,): (CreateCanisterResult,) = call(
//         Principal::management_canister(),
//         "create_canister",
//         (create_args,),
//     )
//     .await
//     .map_err(|e| format!("Canister creation failed: {}", e.1))?;

//     let canister_id = create_result.canister_id;

//     // Step 2: Prepare Asset Installation
//     // Load WASM module for assets canister
//     let wasm_module = include_bytes!("./assets_canister.wasm").to_vec();

//     // Prepare installation arguments
//     // You might want to customize this based on your specific asset setup
//     let init_args = Encode!(&asset_path)
//         .map_err(|e| format!("Failed to encode init args: {}", e))?;

//     // Step 3: Install Assets Canister WASM
//     let install_args = InstallCodeArgument {
//         mode: CanisterInstallMode::Install,
//         canister_id,
//         wasm_module,
//         arg: init_args,
//     };

//     // Install the canister
//     call_with_payment(
//         Principal::management_canister(),
//         "install_code",
//         (install_args,),
//         0, // No additional cycles needed
//     )
//     .await
//     .map_err(|e| format!("Asset canister installation failed: {:?}", e))?;

//     // Optional: Log the created canister ID
//     ic_cdk::println!("Created and deployed asset canister: {}", canister_id);

//     Ok(canister_id)
// }

// // Example usage in another method
// #[ic_cdk::update]
// async fn setup_my_assets() -> Result<Principal, String> {
//     let asset_canister_id = create_and_deploy_asset_canister(
//         "src/asset_canister/assets".to_string()
//     ).await?;
    
//     Ok(asset_canister_id)
// }

// #[ic_cdk::update]
// async fn deploy_asset_canister() -> Result<Principal, String> {
//     // Get the WASM module for the asset canister
//     let wasm_module = AssetCanisterWasm::get(); // Provided by `ic-asset`

//     // Step 1: Create a new canister
//     let (canister_id,): (Principal,) = call(
//         Principal::management_canister(),
//         "create_canister",
//         ()
//     ).await.map_err(|e| format!("Failed to create canister: {:?}", e))?;

//     // Step 2: Install the asset canister WASM
//     call::<(Vec<u8>,), ()>(
//         Principal::management_canister(),
//         "install_code",
//         (canister_id, wasm_module),
//     )
//     .await
//     .map_err(|e| format!("Failed to install asset canister: {:?}", e))?;

//     Ok(canister_id)
 ic_cdk::export_candid!();

