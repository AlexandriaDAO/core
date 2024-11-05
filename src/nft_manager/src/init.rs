use std::time::Duration;

use candid::{Encode, CandidType, Principal};
use ic_cdk_timers::set_timer;
use serde::{Serialize, Deserialize};
use ic_cdk::api::management_canister::main::{InstallCodeArgument, CanisterInstallMode};

const ICRC7_WASM: &[u8] = include_bytes!("./../../../.dfx/local/canisters/icrc7/icrc7.wasm");
const ICRC7_SCION_WASM: &[u8] = include_bytes!("./../../../.dfx/local/canisters/icrc7_scion/icrc7_scion.wasm");

const ICRC7_CANISTER_ID: &str = "53ewn-qqaaa-aaaap-qkmqq-cai";
const ICRC7_SCION_CANISTER_ID: &str = "uxyan-oyaaa-aaaap-qhezq-cai";

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

// Triggers once, deploying icrc7 and icrc7_scion, and never again. Should be commented out if ever hard redeployed.
#[ic_cdk::init]
fn init() {
    set_timer(Duration::from_secs(1), post_init);
}

async fn deploy_canister(canister_id_text: &str, wasm: &[u8]) -> DeployResult {
    let canister_id = match Principal::from_text(canister_id_text) {
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

    let install_args = InstallCodeArgument {
        mode: CanisterInstallMode::Install,
        canister_id,
        wasm_module: wasm.to_vec(),
        arg: encoded_args,
    };

    match ic_cdk::api::management_canister::main::install_code(install_args).await {
        Ok(_) => DeployResult::Ok,
        Err((code, msg)) => DeployResult::Err(format!("Failed to install Wasm module: error code {:?}, message: {}", code, msg)),
    }
}

fn post_init() {
    ic_cdk::spawn(async {
        // Deploy and initialize ICRC7
        match deploy_canister(ICRC7_CANISTER_ID, ICRC7_WASM).await {
            DeployResult::Ok => {
                ic_cdk::println!("ICRC7 deployed successfully");
                if let Err(e) = call_initialize_nfts(ICRC7_CANISTER_ID).await {
                    ic_cdk::println!("Failed to initialize ICRC7 NFTs: {}", e);
                    return;
                }
                ic_cdk::println!("ICRC7 NFTs initialized successfully");

                // Deploy and initialize ICRC7_SCION
                match deploy_canister(ICRC7_SCION_CANISTER_ID, ICRC7_SCION_WASM).await {
                    DeployResult::Ok => {
                        ic_cdk::println!("ICRC7_SCION deployed successfully");
                        if let Err(e) = call_initialize_nfts(ICRC7_SCION_CANISTER_ID).await {
                            ic_cdk::println!("Failed to initialize ICRC7_SCION NFTs: {}", e);
                        } else {
                            ic_cdk::println!("ICRC7_SCION NFTs initialized successfully");
                        }
                    },
                    DeployResult::Err(e) => ic_cdk::println!("Failed to deploy ICRC7_SCION: {}", e),
                }
            },
            DeployResult::Err(e) => ic_cdk::println!("Failed to deploy ICRC7: {}", e),
        }
    });
}

async fn call_initialize_nfts(canister_id_text: &str) -> Result<(), String> {
    let canister_id = Principal::from_text(canister_id_text).map_err(|e| e.to_string())?;
    
    // Call the initialize_nfts function on the specified canister
    ic_cdk::call(canister_id, "initialize_nfts", ()).await
        .map_err(|(code, msg)| format!("Error calling initialize_nfts: {:?} - {}", code, msg))?;
    
    Ok(())
}
