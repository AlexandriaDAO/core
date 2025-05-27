use candid::{CandidType, Encode, Nat, Principal};
use ic_cdk::api::call::RejectionCode;
use ic_cdk::api::management_canister::main::{canister_status, CanisterIdRecord, CanisterInstallMode, CanisterStatusResponse, InstallCodeArgument};
use ic_cdk::api::management_canister::provisional::CanisterSettings;
use serde::{Deserialize, Serialize};

use crate::{
    GrantPermissionArguments, Permission, UserCanisterRegistry,
    USERS_ASSET_CANISTERS, nft_manager_principal,
};
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
    const WASM_MODULE: &[u8] = include_bytes!("./ic_frontend_canister.wasm");
    let caller = ic_cdk::caller();

    // caller already has a canister
    let exists = USERS_ASSET_CANISTERS.with(|canisters| {
        let canisters_map = canisters.borrow();
        canisters_map.contains_key(&caller)
    });

    if exists {
        return Err(
            "A canister already exists for this user. Only one canister is allowed.".to_string(),
        );
    }

    // Call nft_manager to deduct the fee
    let payment_result: ic_cdk::api::call::CallResult<(Result<String, String>,)> = ic_cdk::call(
        nft_manager_principal(),
        "deduct_asset_canister_creation_fee",
        (caller,),
    )
    .await;

    match payment_result {
        Ok((Ok(_),)) => {
            ic_cdk::println!("Asset canister creation fee successfully deducted for user: {}", caller);
        }
        Ok((Err(error_msg),)) => {
            return Err(format!("Fee deduction failed: {}", error_msg));
        }
        Err((code, msg)) => {
            return Err(format!(
                "Payment service call failed: {:?} - {}",
                code, msg
            ));
        }
    }

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

    let (create_result,): (CreateCanisterResult,) = ic_cdk::api::call::call_with_payment(
        Principal::management_canister(),
        "create_canister",
        (create_args,),
        500_000_000_000, // Updated cycles for mainnet canister creation fee
    )
    .await
    .map_err(|e| format!("Failed to create canister: {}", e.1))?;

    let asset_canister_id: Principal = create_result.canister_id;
    ic_cdk::println!("Created new asset canister with ID: {}", asset_canister_id);

    // Deposit additional cycles to the new canister for installation and operation
    let deposit_cycles_args = ic_cdk::api::management_canister::main::CanisterIdRecord {
        canister_id: asset_canister_id,
    };
    ic_cdk::api::call::call_with_payment(
        Principal::management_canister(),
        "deposit_cycles",
        (deposit_cycles_args,),
        1_000_000_000_000, // Increased deposit for installation and operation buffer
    )
    .await
    .map_err(|e| format!("Failed to deposit cycles: {}", e.1))?;

    // Step 2: Install the Wasm module on the new canister
    let install_args = InstallCodeArgument {
        mode: CanisterInstallMode::Install,
        canister_id: asset_canister_id,
        wasm_module: WASM_MODULE.to_vec(),
        arg: Encode!().expect("Failed to encode args"), // Explicit empty args encoding
    };

    ic_cdk::api::call::call_with_payment(
        Principal::management_canister(),
        "install_code",
        (install_args,),
        1000, // Increased cycles
    )
    .await
    .map_err(|e| format!("Installation failed: {:?}", e))?;

    // Step 3: Update the USERS_ASSET_CANISTERS map
    USERS_ASSET_CANISTERS.with(|records| {
        let mut records_map = records.borrow_mut();
        let current_time = ic_cdk::api::time() / 1_000_000_000;  // Convert nanoseconds to seconds
        // Create a new record for the user
        records_map.insert(
            caller,
            UserCanisterRegistry {
                owner: caller,
                assigned_canister_id: asset_canister_id,
                last_updated: current_time,
                last_payment: current_time,
                created_at: current_time,
            },
        );
    });
    // Step 4: Call the GrantPermission function on the new canister
    grant_commit_permission(asset_canister_id, caller).await?;
    Ok(asset_canister_id)
}

async fn grant_commit_permission(
    asset_canister_id: Principal,
    caller: Principal,
) -> Result<String, String> {
    let grant_permission_args = GrantPermissionArguments {
        permission: Permission::Commit, // Grant the "Commit" permission
        to_principal: caller,           // Grant permission to the caller
    };
    let grant_permission_result: Result<(), (RejectionCode, String)> = ic_cdk::api::call::call(
        asset_canister_id,
        "grant_permission",
        (grant_permission_args,),
    )
    .await;
    match grant_permission_result {
        Ok(_) => ic_cdk::println!(
            "Permission 'Commit' granted to user {} for canister {}",
            caller,
            asset_canister_id
        ),
        Err((rejection_code, message)) => {
            ic_cdk::println!(
                "Failed to grant permission for canister {}. Rejection code: {:?}, Message: {}",
                asset_canister_id,
                rejection_code,
                message
            );
            return Err(format!(
                "Failed to grant permission for the canister {}. Rejection code: {:?}, Message: {}",
                asset_canister_id, rejection_code, message
            ));
        }
    };
    Ok("ok ".to_string())
}

#[ic_cdk::update]
async fn get_canister_cycles(canister_id: Principal) -> Result<Nat, String> {
    let args = CanisterIdRecord {
        canister_id,
    };
    
    match canister_status(args).await {
        Ok((response,)) => {
            let cycles = response.cycles;
            Ok(cycles)
        },
        Err((code, message)) => {
            Err(format!("Error fetching canister status: code {:?}, message: {}", code, message))
        }
    }
}
