use std::time::Duration;

use candid::{Encode, CandidType, Principal};
use ic_cdk_timers::set_timer;
use serde::{Serialize, Deserialize};
use ic_cdk::api::management_canister::main::{InstallCodeArgument, CanisterInstallMode};

const ICRC7_WASM: &[u8] = include_bytes!("./../../../.dfx/local/canisters/icrc7/icrc7.wasm");
const ICRC7_CANISTER_ID: &str = "fjqb7-6qaaa-aaaak-qc7gq-cai";

#[derive(CandidType, Serialize, Deserialize)]
struct DeployArgs {
    icrc7_args: Option<Vec<u8>>,
    icrc37_args: Option<Vec<u8>>,
    icrc3_args: Option<Vec<u8>>,
}

#[derive(CandidType, Serialize, Deserialize)]
pub enum DeployResult {
    Ok,
    Err(String),
}


// Triggers once, deploying icrc7, and never again.
#[ic_cdk::init]
fn init() {
    set_timer(Duration::from_secs(1), post_init);
}

// #[ic_cdk::update]
fn post_init() {
    ic_cdk::spawn(async {
        match deploy_icrc7().await {
            DeployResult::Ok => {
                ic_cdk::println!("ICRC7 deployed successfully");
                // match initialize_icrc7().await {
                //     Ok(()) => ic_cdk::println!("ICRC7 initialized successfully"),
                //     Err(e) => ic_cdk::println!("Failed to initialize ICRC7: {}", e),
                // }
            },
            DeployResult::Err(e) => ic_cdk::println!("Failed to deploy ICRC7: {}", e),
        }
    });
}


// #[ic_cdk::update]
async fn deploy_icrc7() -> DeployResult {
    let canister_id = match Principal::from_text(ICRC7_CANISTER_ID) {
        Ok(id) => id,
        Err(e) => return DeployResult::Err(format!("Invalid canister ID: {}", e)),
    };

    // Prepare null deploy arguments
    let deploy_args = DeployArgs {
        icrc7_args: None,
        icrc37_args: None,
        icrc3_args: None,
    };

    // Encode the deploy arguments
    let encoded_args = match Encode!(&deploy_args) {
        Ok(args) => args,
        Err(e) => return DeployResult::Err(format!("Failed to encode arguments: {}", e)),
    };

    // Install the ICRC7 code
    let install_args = InstallCodeArgument {
        mode: CanisterInstallMode::Install,
        canister_id,
        wasm_module: ICRC7_WASM.to_vec(),
        arg: encoded_args,
    };

    match ic_cdk::api::management_canister::main::install_code(install_args).await {
        Ok(_) => DeployResult::Ok,
        Err((code, msg)) => DeployResult::Err(format!("Failed to install Wasm module: error code {:?}, message: {}", code, msg)),
    }
}

// #[ic_cdk::update]
// async fn initialize_icrc7() -> Result<(), String> {
//     let canister_id = Principal::from_text(ICRC7_CANISTER_ID)
//         .map_err(|e| format!("Invalid canister ID: {:?}", e))?;

//     // Call the init function on the ICRC7 canister
//     let call_result: Result<(), (ic_cdk::api::call::RejectionCode, String)> = 
//         ic_cdk::api::call::call(canister_id, "init", ()).await;

//     match call_result {
//         Ok(()) => Ok(()),
//         Err((code, msg)) => Err(format!("Failed to initialize ICRC7: {:?} - {}", code, msg)),
//     }
// }