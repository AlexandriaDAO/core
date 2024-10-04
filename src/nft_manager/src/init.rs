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

// Triggers once, deploying icrc7, and never again. Should be commented out if ever hard redeployed.
#[ic_cdk::init]
fn init() {
    set_timer(Duration::from_secs(1), post_init);
}

fn post_init() {
    ic_cdk::spawn(async {
        match deploy_icrc7().await {
            DeployResult::Ok => {
                ic_cdk::println!("ICRC7 deployed successfully");
                // Call initialize_nfts() on the newly deployed canister
                match call_initialize_nfts().await {
                    Ok(_) => ic_cdk::println!("NFTs initialized successfully"),
                    Err(e) => ic_cdk::println!("Failed to initialize NFTs: {}", e),
                }
            },
            DeployResult::Err(e) => ic_cdk::println!("Failed to deploy ICRC7: {}", e),
        }
    });
}

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

async fn call_initialize_nfts() -> Result<(), String> {
    let canister_id = Principal::from_text(ICRC7_CANISTER_ID).map_err(|e| e.to_string())?;
    
    // Call the initialize_nfts function on the ICRC7 canister
    ic_cdk::call(canister_id, "initialize_nfts", ()).await
        .map_err(|(code, msg)| format!("Error calling initialize_nfts: {:?} - {}", code, msg))?;
    
    Ok(())
}
