use crate::{
    utils::{
        get_principal, is_owner, remove_nft_from_listing, Account, TransferArg, TransferError,
        TransferFromArg, TransferFromError, TransferFromResult, TransferResult,
        EMPORIUM_CANISTER_ID, ICRC7_CANISTER_ID,
    },
    Nft, NftStatus, LISTING,
};
use candid::{Nat, Principal};
use ic_cdk::{api::call::CallResult, caller, update};
use icrc_ledger_types::icrc1::account::Account as AccountIcrc;
use icrc_ledger_types::icrc1::transfer::BlockIndex;
use icrc_ledger_types::icrc2::transfer_from::{
    TransferFromArgs as TransferFromArgsIcrc, TransferFromError as TransferFromErrorIcrc,
};

use ic_ledger_types::MAINNET_LEDGER_CANISTER_ID;
#[update]
pub async fn list_nft(token_id: Nat, icp_amount: u64) -> Result<String, String> {
    //check ownership
    //desposit nft to canister
    //add record to listing

    match is_owner(caller(), token_id.clone()).await {
        Ok(true) => {}
        Ok(false) => return Err("You can't list this NFT, ownership proof failed!".to_string()),
        Err(_) => return Err("Something went wrong !".to_string()),
    };

    // ic_cdk::println!("Yees you are the owner!!! :D");
    deposit_nft_to_canister(token_id.clone()).await?;

    LISTING.with(|nfts| -> Result<(), String> {
        let mut nft_map = nfts.borrow_mut();
        let nft = match nft_map.get(&token_id.to_string()) {
            Some(_existing_nft_sale) => {
                return Err("Nft already on sale can't list ".to_string());
            }
            None => Nft {
                owner: caller(),
                price: icp_amount,
                token_id: token_id.clone(),
                status: NftStatus::Listed,
                time: ic_cdk::api::time(),
            },
        };

        nft_map.insert(token_id.clone().to_string(), nft);
        Ok(())
    })?;

    Ok("NFT added for sale".to_string())
}
#[update]
pub async fn cancel_nft_listing(token_id: Nat) -> Result<String, String> {
    // Check if the caller is the owner

    let current_nft = LISTING
        .with(|nfts| {
            let nft_map = nfts.borrow();
            nft_map.get(&token_id.clone().to_string())
        })
        .ok_or("NFT doesn't exists")?;
    if current_nft.owner == caller() {
        // Transfer the NFT back to the owner
        transfer_nft_from_canister(caller(), token_id.clone()).await?;
        remove_nft_from_listing(token_id.clone())?;
    } else {
        return Err("Unauthorized !".to_string());
    }
    Ok("Successfully cancelled the NFT listing.".to_string())
}
#[update]
pub async fn buy_nft(token_id: Nat) -> Result<String, String> {
    // transfer ICP from caller to seller through tranfer approve
    // transfer NFT
    // delete record from sale

    let current_nft = LISTING
        .with(|nfts| {
            let nft_map = nfts.borrow();
            nft_map.get(&token_id.clone().to_string())
        })
        .ok_or("NFT doesn't exists")?;

    transfer_icp_to_seller(current_nft.price, current_nft.owner).await?;
    match transfer_nft_from_canister(caller(), token_id.clone()).await {
        Ok(ok) => {}
        Err(err) => {
            ic_cdk::println!("This I am here ");
            //incase of failure change the owner to caller
            LISTING.with(|nfts| -> Result<(), String> {
                let mut nft_map = nfts.borrow_mut();

                // Retrieve the existing NFT
                let updated_nft = match nft_map.get(&token_id.clone().to_string()) {
                    Some(existing_nft) => {
                        let mut updated = existing_nft.clone();
                        updated.owner = caller();
                        updated.status = NftStatus::Reimbursed;
                        updated.time = ic_cdk::api::time();
                        updated
                    }
                    None => return Err("NFT not listed for sale.".to_string()),
                };

                // Updated
                nft_map.insert(token_id.clone().to_string(), updated_nft);
                return Err("Nft transfer failed, ownership transfered.".to_string());
            })?;
        }
    }

    remove_nft_from_listing(token_id)?;

    Ok("Success".to_string())
}
#[update]
pub async fn update_nft_price(token_id: Nat, new_price: u64) -> Result<String, String> {
    let current_time: u64 = ic_cdk::api::time();
    LISTING.with(|nfts| -> Result<(), String> {
        let mut nft_map = nfts.borrow_mut();

        // Retrieve the existing NFT
        let updated_nft = match nft_map.get(&token_id.clone().to_string()) {
            Some(existing_nft) => {
                if existing_nft.owner != caller() {
                    return Err("Only the owner of the NFT can update its price.".to_string());
                }
                let mut updated = existing_nft.clone();
                updated.price = new_price;
                updated.time = current_time;
                updated
            }
            None => return Err("NFT not listed for sale.".to_string()),
        };

        // Updated
        nft_map.insert(token_id.clone().to_string(), updated_nft);
        Ok(())
    })?;

    Ok(format!(
        "Price of NFT {} updated to {} at time {}",
        token_id, new_price, current_time
    ))
}

async fn transfer_icp_to_seller(amount: u64, destination: Principal) -> Result<BlockIndex, String> {
    pub const ICP_TRANSFER_FEE: u64 = 10_000;
    let caller = ic_cdk::caller();

    let transfer_args = TransferFromArgsIcrc {
        from: AccountIcrc {
            owner: caller,
            subaccount: None,
        },
        to: AccountIcrc {
            owner: destination,
            subaccount: None,
        },
        amount: amount.into(),
        fee: Some(Nat::from(ICP_TRANSFER_FEE)),
        memo: None,
        created_at_time: None,
        spender_subaccount: None,
    };

    ic_cdk::call::<(TransferFromArgsIcrc,), (Result<BlockIndex, TransferFromErrorIcrc>,)>(
        MAINNET_LEDGER_CANISTER_ID,
        "icrc2_transfer_from",
        (transfer_args,),
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    .0
    .map_err(|e: TransferFromErrorIcrc| format!("ledger transfer error {:?}", e))
}

pub async fn deposit_nft_to_canister(token_id: Nat) -> Result<String, String> {
    let nft_canister: Principal = get_principal(ICRC7_CANISTER_ID);

    let transfer_arg = vec![TransferFromArg {
        spender_subaccount: None,
        from: Account {
            owner: caller(),
            subaccount: None,
        },
        to: Account {
            owner: get_principal(EMPORIUM_CANISTER_ID),
            subaccount: None,
        },
        token_id: Nat::from(token_id),
        memo: None,
        created_at_time: None,
    }];

    let call_result: ic_cdk::api::call::CallResult<(Vec<Option<TransferFromResult>>,)> =
        ic_cdk::call(nft_canister, "icrc37_transfer_from", (transfer_arg,)).await;

    ic_cdk::println!("Raw call result: {:?}", call_result);

    match call_result {
        // Call-level success
        Ok((results,)) => {
            if let Some(first_result) = results.get(0) {
                ic_cdk::println!("Result is {:?}", first_result);

                match first_result {
                    // Operation succeeded
                    Some(TransferFromResult::Ok(transaction_index)) => {
                        return Ok(format!(
                            "Successfully transferred. Transaction index: {}",
                            transaction_index
                        ));
                    }
                    // Operation-level error
                    Some(TransferFromResult::Err(error)) => {
                        let error_message = match error {
                            TransferFromError::InvalidRecipient => "Invalid recipient.".to_string(),
                            TransferFromError::Unauthorized => "Unauthorized.".to_string(),
                            TransferFromError::NonExistingTokenId => {
                                "Non-existing token ID.".to_string()
                            }
                            TransferFromError::TooOld => "Request is too old.".to_string(),
                            TransferFromError::CreatedInFuture { ledger_time } => {
                                format!("Created in the future at ledger time: {}.", ledger_time)
                            }
                            TransferFromError::Duplicate { duplicate_of } => {
                                format!("Duplicate transaction. Duplicate of {}.", duplicate_of)
                            }
                            TransferFromError::GenericError {
                                error_code,
                                message,
                            } => {
                                format!("Error {}: {}.", error_code, message)
                            }
                            TransferFromError::GenericBatchError {
                                error_code,
                                message,
                            } => {
                                format!("Batch error {}: {}.", error_code, message)
                            }
                        };
                        return Err(format!("Transfer failed: {}", error_message));
                    }
                    // Expected None result for successfull
                    None => {
                        return Ok("Successfully transferred.".to_string());
                    }
                }
            } else {
                return Err("Transfer failed: No results returned.".to_string());
            }
        }
        // Call-level failure
        Err((code, msg)) => Err(format!(
            "Transfer call failed with error {}: {}",
            code as u8, msg
        )),
    }
}

pub async fn transfer_nft_from_canister(
    destination: Principal,
    token_id: Nat,
) -> Result<String, String> {
    let nft_canister: Principal = get_principal(ICRC7_CANISTER_ID);

    let transfer_arg = vec![TransferArg {
        from_subaccount: None,
        to: Account {
            owner: destination,
            subaccount: None,
        },
        token_id: Nat::from(token_id),
        memo: None,
        created_at_time: Some(ic_cdk::api::time()),
    }];

    // Call the NFT canister with transfer arguments
    let call_result: CallResult<(Vec<Option<TransferResult>>,)> =
        ic_cdk::call(nft_canister, "icrc7_transfer", (transfer_arg,)).await;

    match call_result {
        Ok((response,)) => match response.get(0) {
            Some(Some(TransferResult::Ok(transaction_index))) => Ok(format!(
                "Successfully transferred. Transaction index: {}",
                transaction_index
            )),
            Some(Some(TransferResult::Err(error))) => match error {
                TransferError::Unauthorized => Err("Unauthorized transfer attempt.".to_string()),
                TransferError::NonExistingTokenId => Err("Non-existing token ID.".to_string()),
                TransferError::InvalidRecipient => Err("Invalid recipient.".to_string()),
                TransferError::TooOld => Err("Transaction too old.".to_string()),
                TransferError::CreatedInFuture { ledger_time } => Err(format!(
                    "Transfer created in the future (ledger time: {}).",
                    ledger_time
                )),
                TransferError::Duplicate { duplicate_of } => Err(format!(
                    "Duplicate transaction (duplicate of {}).",
                    duplicate_of
                )),
                TransferError::GenericError {
                    error_code,
                    message,
                } => Err(format!(
                    "Generic error (code: {}, message: {}).",
                    error_code, message
                )),
                TransferError::GenericBatchError {
                    error_code,
                    message,
                } => Err(format!(
                    "Batch error (code: {}, message: {}).",
                    error_code, message
                )),
            },
            _ => Err("Unknown transfer error.".to_string()),
        },
        Err((code, msg)) => {
            // Check if the canister is stopped, and handle it
            if msg.contains("is stopped") {
                Err("Error: Target canister is stopped.".to_string())
            } else {
                Err(format!(
                    "Canister call failed with code {}: {}.",
                    code as u8, msg
                ))
            }
        }
    }
}
