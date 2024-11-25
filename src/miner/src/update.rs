use candid::{Nat, Principal};
use ic_cdk::update;
use icrc_ledger_types::{
    icrc1::{
        account::Account,
        transfer::BlockIndex,
    },
    icrc2::transfer_from::{TransferFromArgs, TransferFromError},
};

use num_bigint::BigUint;

use crate::{utils::LBRY_CANISTER_ID, Miner, MinerStatus, USERS_MINING};

#[update]
pub async fn start_mining(amount_lbry: u64) -> Result<String, String> {
    deposit_lbry_in_canister(amount_lbry).await?;
    let caller: Principal = ic_cdk::caller();

    USERS_MINING.with(|users| -> Result<(), String> {
        let mut users_mining_map = users.borrow_mut();
        let updated_user = match users_mining_map.get(&caller) {
            Some(existing_user) => {
                let mut updated = existing_user.clone();
                if updated.status == MinerStatus::Active {
                    return Err("Minting already active !".to_string());
                }
                updated.balance = updated
                    .balance
                    .checked_add(amount_lbry)
                    .ok_or("Arithmetic Overflow occurred in USERS_MINTING")?;
                //TIME
                updated
            }
            None => Miner {
                balance: amount_lbry,
                time: ic_cdk::api::time(),
                trnxs_count: 0,
                status: MinerStatus::Active,
            },
        };

        users_mining_map.insert(caller, updated_user);
        Ok(())
    })?;
    Ok("Successfully started!".to_string())
}
#[update]
pub async fn end_mining() -> Result<String, String> {
    // return the remaining LBRY user

    Ok("Successfully stoped!".to_string())
}
// transfer user main principal
async fn deposit_lbry_in_canister(amount: u64) -> Result<BlockIndex, String> {
    let canister_id: Principal = ic_cdk::api::id();

    let big_int_amount: BigUint = BigUint::from(amount);
    let amount: Nat = Nat(big_int_amount);

    let transfer_from_args = TransferFromArgs {
        // the account we want to transfer tokens from (in this case we assume the caller approved the canister to spend funds on their behalf)
        from: Account::from(ic_cdk::caller()),
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

async fn check_allowance(){
}
// Testing for backend canister.
// First approve token to miner canister.
// Then call start minting.

// chan