use candid::{Nat, Principal};
use ic_cdk::api::call::CallResult;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};

use crate::guard::not_anon;
use crate::id_converter::*;
use crate::{icrc7_principal, icrc7_scion_principal, nft_manager_principal, lbry_principal};
use crate::action_fees::{burn_mint_fee, LBRY_MINT_COST_E8S};

// Return Nat (the minted ID) on success, String on error
// pub type MintResult = Result<String, String>; // Old
pub type MintResult = Result<Nat, String>; // New

async fn check_existing_ownership(minting_number: &Nat) -> Result<Option<Principal>, String> {
    get_nft_owner(minting_number.clone(), icrc7_principal()).await
}

// Helper function to check if caller already has a scion NFT
async fn check_caller_scion(minting_number: &Nat, caller: Principal) -> Result<bool, String> {
    let potential_scion_id = og_to_scion_id(minting_number.clone(), caller);
    let caller_scion = get_nft_owner(potential_scion_id, icrc7_scion_principal()).await?;
    Ok(caller_scion.is_some())
}


// OG_IDs 75-77 characters
// SCION_IDs 95-97 characters
#[ic_cdk::update(decoding_quota = 200, guard = "not_anon")]
pub async fn coordinate_mint(
    arweave_id: String,
    owner_principal: Option<Principal>,
) -> MintResult { // Ensure return type is MintResult (Result<Nat, String>)
    let caller = ic_cdk::caller();
    
    if !is_arweave_id(arweave_id.clone()) {
        return Err("Invalid arweave ID".to_string());
    }

    let minting_number = arweave_id_to_nat(arweave_id);

    // Check original NFT ownership
    let og_owner = check_existing_ownership(&minting_number).await?;
    
    if og_owner == Some(caller) {
        return Err("You already own this NFT".to_string());
    }

    // Check if caller already has a scion NFT
    let caller_scion = check_caller_scion(&minting_number, caller).await?;
    if caller_scion {
        return Err("You have already minted a scion NFT from this number".to_string());
    }

    // Handle minting scenarios
    match (og_owner, owner_principal) {
        // No original NFT exists - mint original
        (None, _) => mint_original(minting_number, caller).await,
        
        // Original exists and owner_principal provided - check for scion-from-scion
        (Some(_), Some(owner)) => {
            let scion_id = og_to_scion_id(minting_number.clone(), owner);
            let scion_owner = get_nft_owner(scion_id, icrc7_scion_principal()).await?;
            
            if scion_owner == Some(owner) {
                mint_scion_from_scion(minting_number, caller, owner).await
            } else {
                mint_scion_from_original(minting_number, caller).await
            }
        },
        
        // Original exists but no owner_principal - mint scion from original
        (Some(_), None) => mint_scion_from_original(minting_number, caller).await,
    }
}

pub async fn verify_lbry_payment(
    from: Principal,
    to: Principal,
    to_subaccount: Option<Vec<u8>>,
    amount: Nat,
) -> Result<(), String> {
    let transfer_arg = TransferArg {
        to: Account {
            owner: to,
            subaccount: to_subaccount.map(|s| {
                let result: Result<[u8; 32], _> = s.try_into();
                match result {
                    Ok(arr) => Some(arr),
                    Err(_) => None
                }
            }).flatten(),
        },
        fee: None,
        memo: None,
        from_subaccount: Some(principal_to_subaccount(from)),
        created_at_time: None,
        amount,
    };

    let transfer_result: CallResult<(Result<Nat, TransferError>,)> = ic_cdk::call(
        lbry_principal(),
        "icrc1_transfer",
        (transfer_arg,),
    ).await;

    match transfer_result {
        Ok((Ok(_),)) => Ok(()),
        Ok((Err(e),)) => Err(format!("LBRY transfer failed: {:?}", e)),
        Err((code, msg)) => Err(format!("Error calling LBRY canister: {:?} - {}", code, msg)),
    }
}

pub async fn burn_lbry_tokens(from: Principal) -> Result<(), String> {
    burn_mint_fee(from).await
}

async fn mint_original(minting_number: Nat, caller: Principal) -> MintResult {
    burn_lbry_tokens(caller).await?;
    
    super::update::mint_nft(minting_number.clone(), None) // Pass clone here
        .await
        // Return the minted number on success
        .map(|_| minting_number) // Return Ok(minting_number)
        .map_err(|e| format!("Mint failed: {}", e))
}

async fn mint_scion_from_original(minting_number: Nat, caller: Principal) -> MintResult {
    // First burn tokens
    burn_lbry_tokens(caller).await?;
    
    // Then pay the original NFT owner
    let nft_wallet = to_nft_subaccount(minting_number.clone());
    verify_lbry_payment(caller, nft_manager_principal(), Some(nft_wallet.to_vec()), Nat::from(LBRY_MINT_COST_E8S))
        .await
        .map_err(|_| "Failed to transfer LBRY to original NFT owner".to_string())?;
    
    let new_scion_id = og_to_scion_id(minting_number, caller);
    super::update::mint_scion_nft(new_scion_id.clone(), None) // Pass clone here
        .await
        // Return the new scion ID on success
        .map(|_| new_scion_id) // Return Ok(new_scion_id)
        .map_err(|e| format!("Mint failed: {}", e))
}

async fn mint_scion_from_scion(
    minting_number: Nat, 
    caller: Principal,
    scion_owner: Principal
) -> MintResult {
    // First burn tokens
    burn_lbry_tokens(caller).await?;
    
    println!("Minting number: {}", minting_number.to_string());
    // Then pay the scion NFT owner
    let existing_scion_id = og_to_scion_id(minting_number.clone(), scion_owner);
    println!("Existing scion ID: {}", existing_scion_id.to_string());
    let scion_wallet = to_nft_subaccount(existing_scion_id);
    println!("Scion wallet: {:?}", scion_wallet);

    verify_lbry_payment(caller, nft_manager_principal(), Some(scion_wallet.to_vec()), Nat::from(LBRY_MINT_COST_E8S))
        .await
        .map_err(|_| "Failed to transfer LBRY to the Scion NFT's wallet".to_string())?;
    
    let new_scion_id = og_to_scion_id(minting_number, caller);
    super::update::mint_scion_nft(new_scion_id.clone(), None) // Pass clone here
        .await
        // Return the new scion ID on success
        .map(|_| new_scion_id) // Return Ok(new_scion_id)
        .map_err(|e| format!("Mint failed: {}", e))
}

async fn get_nft_owner(token_id: Nat, canister: Principal) -> Result<Option<Principal>, String> {
    let owner_result: CallResult<(Vec<Option<Account>>,)> = ic_cdk::call(
        canister,
        "icrc7_owner_of",
        (vec![token_id],),
    ).await;

    match owner_result {
        Ok((owners,)) => Ok(owners.get(0).and_then(|o| o.as_ref()).map(|a| a.owner)),
        Err((code, msg)) => Err(format!("Error fetching owner: {:?} - {}", code, msg)),
    }
}