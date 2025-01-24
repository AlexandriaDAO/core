use std::ptr::null;

use candid::{CandidType, Encode, Nat, Principal};
use ic_cdk::api::call::RejectionCode;
use ic_cdk::api::management_canister::main::{CanisterInstallMode, InstallCodeArgument};
use ic_cdk::api::management_canister::provisional::CanisterSettings;
use icrc_ledger_types::{
    icrc1::{
        account::Account,
        transfer::{BlockIndex, TransferArg, TransferError},
    },
    icrc2::transfer_from::{TransferFromArgs, TransferFromError},
};
use num_bigint::BigUint;
use serde::{Deserialize, Serialize};

use crate::{
    GrantPermissionArguments, PaymentEntry, Permission, Status, UserCanisterRegistry,
    ASSET_CANISTER_FEE, LBRY_CANISTER_ID, USERS_ASSET_CANISTERS,
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
async fn create_asset_canister(from_subaccount: Option<[u8; 32]>) -> Result<Principal, String> {
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
    deduct_payment(ASSET_CANISTER_FEE, from_subaccount).await?;
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

    let (create_result,): (CreateCanisterResult,) = ic_cdk::api::call::call(
        Principal::management_canister(),
        "create_canister",
        (create_args,),
    )
    .await
    .map_err(|e| format!("Failed to create canister: {}", e.1))?;

    let asset_canister_id: Principal = create_result.canister_id;
    ic_cdk::println!("Created new asset canister with ID: {}", asset_canister_id);

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
        500_000_000_000, // Increased cycles
    )
    .await
    .map_err(|e| format!("Installation failed: {:?}", e))?;

    // Step 3: Update the USERS_ASSET_CANISTERS map
    USERS_ASSET_CANISTERS.with(|records| {
        let mut records_map = records.borrow_mut();

        // Create a new record for the user
        records_map.insert(
            caller,
            UserCanisterRegistry {
                owner: caller,
                payment_details: vec![PaymentEntry {
                    timestamp: ic_cdk::api::time(),
                    amount: ASSET_CANISTER_FEE,
                }],
                status: Status::Active,
                assigned_canister_id: asset_canister_id,
                last_updated: ic_cdk::api::time(),
            },
        );
    });
    // Step 4: Call the GrantPermission function on the new canister
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

    Ok(asset_canister_id)
}


// payment to canister
async fn deduct_payment(
    amount: u64,
    from_subaccount: Option<[u8; 32]>,
) -> Result<BlockIndex, String> {
    let canister_id: Principal = ic_cdk::api::id();

    let big_int_amount: BigUint = BigUint::from(amount);
    let amount: Nat = Nat(big_int_amount);

    let transfer_from_args = TransferFromArgs {
        from: Account {
            owner: ic_cdk::caller(),
            subaccount: from_subaccount,
        },
        // can be used to distinguish between transactions
        memo: None,
        // the amount we want to transfer
        amount,
        // the subaccount we want to spend the tokens from (in this case we assume the default subaccount has been approved)
        spender_subaccount: None,
        // if not specified, the default fee for the canister is used
        fee: None,
        // the account we want to transfer tokens to
        to: canister_id.into(),
        // a timestamp indicating when the transaction was created by the caller; if it is not specified by the caller then this is set to the current ICP time
        created_at_time: None,
    };

    // 1. Asynchronously call another canister function using `ic_cdk::call`.
    ic_cdk::call::<(TransferFromArgs,), (Result<BlockIndex, TransferFromError>,)>(
        // 2. Convert a textual representation of a Principal into an actual `Principal` object. The principal is the one we specified in `dfx.json`.
        //    `expect` will panic if the conversion fails, ensuring the code does not proceed with an invalid principal.
        Principal::from_text(LBRY_CANISTER_ID).expect("Could not decode the principal."),
        // 3. Specify the method name on the target canister to be called, in this case, "icrc1_transfer".
        "icrc2_transfer_from",
        // 4. Provide the arguments for the call in a tuple, here `transfer_args` is encapsulated as a single-element tuple.
        (transfer_from_args,),
    )
    .await // 5. Await the completion of the asynchronous call, pausing the execution until the future is resolved.
    // 6. Apply `map_err` to transform any network or system errors encountered during the call into a more readable string format.
    //    The `?` operator is then used to propagate errors: if the result is an `Err`, it returns from the function with that error,
    //    otherwise, it unwraps the `Ok` value, allowing the chain to continue.
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    // 7. Access the first element of the tuple, which is the `Result<BlockIndex, TransferError>`, for further processing.
    .0
    // 8. Use `map_err` again to transform any specific ledger transfer errors into a readable string format, facilitating error handling and debugging.
    .map_err(|e: TransferFromError| format!("ledger transfer error {:?}", e))
}
