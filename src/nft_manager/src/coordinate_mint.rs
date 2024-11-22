use candid::{Nat, Principal};
use ic_cdk::api::call::CallResult;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};

use crate::id_converter::*;
use crate::{icrc7_principal, icrc7_scion_principal, icp_swap_principal, nft_manager_principal, lbry_principal};

const LBRY_MINT_COST: u64 = 1;
const VERIFICATION_WINDOW_NANOS: u64 = 300_000_000_000; // 5 minutes in nanoseconds

#[ic_cdk::update]
pub async fn coordinate_mint(
    minting_number: Nat,
    caller: Principal,
) -> Result<String, String> {
    // Check ownership to prevent duplicate mints
    let [og_owner, scion_owner] = check_existing_ownership(&minting_number).await?;
    
    if og_owner == Some(caller) || scion_owner == Some(caller) {
        return Err("You already own this NFT".to_string());
    }

    // Handle different minting scenarios
    match (og_owner, scion_owner) {
        (None, None) => mint_original(minting_number, caller).await,
        (Some(_), None) => mint_scion_from_original(minting_number, caller).await,
        (None, Some(_)) => mint_scion_from_scion(minting_number, caller).await,
        (Some(_), Some(_)) => Err("Both original and scion NFTs already exist".to_string()),
    }
}

async fn check_existing_ownership(minting_number: &Nat) -> Result<[Option<Principal>; 2], String> {
    let og_owner = get_nft_owner(minting_number.clone(), icrc7_principal()).await?;
    let scion_owner = get_nft_owner(minting_number.clone(), icrc7_scion_principal()).await?;
    Ok([og_owner, scion_owner])
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

async fn verify_lbry_payment(
    from: Principal,
    to: Principal,
    subaccount: Option<Vec<u8>>,
) -> Result<bool, String> {
    let from_account = Account {
        owner: from,
        subaccount: None,
    };

    let to_account = Account {
        owner: to,
        subaccount: subaccount.map(|s| s.try_into().unwrap()),
    };

    // Get recent transfers from the LBRY ledger
    let transfers: CallResult<(Vec<(TransferArg, Option<TransferError>)>,)> = ic_cdk::call(
        lbry_principal(),
        "get_recent_transfers",
        (from_account, to_account, ic_cdk::api::time()),
    ).await;

    match transfers {
        Ok((recent_transfers,)) => {
            let current_time = ic_cdk::api::time();
            
            // Look for a successful transfer of LBRY_MINT_COST within the verification window
            for (transfer, error) in recent_transfers {
                if error.is_none() 
                    && transfer.amount.0 == LBRY_MINT_COST.into() 
                    && current_time - transfer.created_at_time.unwrap_or(0) <= VERIFICATION_WINDOW_NANOS {
                    return Ok(true);
                }
            }
            Ok(false)
        },
        Err((code, msg)) => Err(format!("Error verifying LBRY payment: {:?} - {}", code, msg)),
    }
}

async fn mint_original(minting_number: Nat, caller: Principal) -> Result<String, String> {
    // Verify LBRY payment to ICP_SWAP
    let icp_swap = icp_swap_principal();
    if !verify_lbry_payment(caller, icp_swap, None).await? {
        return Err("Failed to burn LBRY tokens".to_string());
    }

    // Mint the original NFT
    match super::update::mint_nft(minting_number, caller, None).await {
        Ok(result) => Ok("Original NFT minted successfully!".to_string()),
        Err(e) => Err(format!("Mint failed: {}", e)),
    }
}

async fn mint_scion_from_original(minting_number: Nat, caller: Principal) -> Result<String, String> {
    let nft_wallet = to_nft_subaccount(minting_number.clone());
    let nft_manager = nft_manager_principal();

    // Verify LBRY payment to NFT wallet
    if !verify_lbry_payment(caller, nft_manager, Some(nft_wallet.to_vec())).await? {
        return Err("Failed to transfer LBRY".to_string());
    }

    // Calculate new scion ID and mint
    let new_scion_id = og_to_scion_id(&minting_number, &caller);
    match super::update::mint_scion_nft(new_scion_id, caller, None).await {
        Ok(result) => Ok("Scion NFT saved successfully!".to_string()),
        Err(e) => Err(format!("Mint failed: {}", e)),
    }
}

async fn mint_scion_from_scion(minting_number: Nat, caller: Principal) -> Result<String, String> {
    let nft_wallet = to_nft_subaccount(minting_number.clone());
    let nft_manager = nft_manager_principal();

    // Verify LBRY payment to scion NFT wallet
    if !verify_lbry_payment(caller, nft_manager, Some(nft_wallet.to_vec())).await? {
        return Err("Failed to transfer LBRY to the Scion NFT's wallet".to_string());
    }

    // Handle original NFT payment if it exists
    let og_id = scion_to_og_id(&minting_number);
    let og_wallet = to_nft_subaccount(og_id.clone());
    
    let og_exists = get_nft_owner(og_id.clone(), icrc7_principal()).await?.is_some();
    if og_exists {
        if !verify_lbry_payment(caller, nft_manager, Some(og_wallet.to_vec())).await? {
            return Err("Failed to transfer LBRY to the original NFT's wallet".to_string());
        }
    }

    // Calculate new scion ID and mint
    let new_scion_id = og_to_scion_id(&minting_number, &caller);
    match super::update::mint_scion_nft(new_scion_id, caller, None).await {
        Ok(result) => Ok("Scion NFT saved successfully!".to_string()),
        Err(e) => Err(format!("Mint failed: {}", e)),
    }
}
