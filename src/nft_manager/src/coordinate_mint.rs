use candid::{Nat, Principal};
use ic_cdk::api::call::CallResult;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};

use crate::guard::not_anon;
use crate::id_converter::*;
use crate::{icrc7_principal, icrc7_scion_principal, icp_swap_principal, nft_manager_principal, lbry_principal};

const LBRY_MINT_COST: u64 = 1;
const LBRY_E8S: u64 = 100_000_000; // 10^8 for 8 decimal places
const LBRY_MINT_COST_E8S: u64 = LBRY_MINT_COST * LBRY_E8S;


/*

  Psuedocode for refactoring:

  Reason:
   - Right now, there's no possibility that this case can be triggered in coordinate_mint(): `(None, Some(_)) => mint_scion_from_scion(minting_number, caller).await,`
     - The reason is that the minting_number we passed is just derived from the arweave tx_id by itself, not by the owner principal.

   - Instead, we should take the raw arweave tx_id as a string, and an optional owner principal as the parameters.
     - Then convert it to the minting_number with arweave_id_to_nat(arweave_id: String) from id_converter.rs
       - If there's no owner principal, then we could just continue with the current logic.
       - If there is an owner principal, it's possibly a scion nft and so we must check.
         - First we need to convert the minting_number to the scion_id with og_to_scion_id(minting_number: Nat, principal: Principal) from id_converter.rs
         - Then we need to check if the scion_id exists with `icrc7_owner_of: (vec nat) → (vec opt record {owner:principal; subaccount:opt vec nat8}) query` from icrc7_scion_principal() canister.
            - If there's no owner, then we can continue with the current logic.
            - If there is an owner, then it's a scion nft, and we trigger the mint_scion_from_scion(minting_number, caller).await, thus rewarding the scion nft owner.


- The incentive structure should work like this: 
    - If you mint an original nft, you pay 1LBRY to ICP_SWAP (the burn address)
    - If you mint a scion_nft from an original nft, you pay 1LBRY to the original nft owner's wallet
    - If you mint a scion_nft from another scion_nft, you pay 1LBRY to the scion_nft owner's wallet
  */ 


#[ic_cdk::update(decoding_quota = 200, guard = "not_anon")]
pub async fn coordinate_mint(
    arweave_id: String,
    owner_principal: Option<Principal>,
) -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    // Convert arweave_id to minting_number
    let minting_number = arweave_id_to_nat(arweave_id);

    // Check ownership to prevent duplicate mints
    let [og_owner, scion_owner] = check_existing_ownership(&minting_number).await?;
    
    if og_owner == Some(caller) || scion_owner == Some(caller) {
        return Err("You already own this NFT".to_string());
    }

    // Check if caller already owns a scion NFT for this number
    let potential_scion_id = og_to_scion_id(minting_number.clone(), caller);
    let caller_scion = get_nft_owner(potential_scion_id, icrc7_scion_principal()).await?;
    
    if caller_scion.is_some() {
        return Err("You have already minted a scion NFT from this number".to_string());
    }

    // If owner_principal is provided, check if it's a scion NFT
    if let Some(owner) = owner_principal {
        let scion_id = og_to_scion_id(minting_number.clone(), owner);
        let scion_owner = get_nft_owner(scion_id, icrc7_scion_principal()).await?;
        
        if let Some(owner) = scion_owner {
            // This is a scion NFT, mint from scion
            return mint_scion_from_scion(minting_number, caller, owner).await;
        }
    }

    // Handle other minting scenarios
    match (og_owner, scion_owner) {
        (None, None) => mint_original(minting_number, caller).await,
        (Some(owner), None) => mint_scion_from_original(minting_number, caller).await,
        (Some(_), Some(_)) => Err("Both original and scion NFTs already exist".to_string()),
        (None, Some(_)) => Err("Invalid state: Scion exists without original".to_string()),
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
    to_subaccount: Option<Vec<u8>>,
) -> Result<bool, String> {
    // Get the user's subaccount for spending from NFT manager
    let from_subaccount = principal_to_subaccount(from);

    let transfer_arg = TransferArg {
        to: Account {
            owner: to,
            subaccount: to_subaccount.map(|s| s.try_into().unwrap()),
        },
        fee: None,
        memo: None,
        // Set the from_subaccount to the user's spending account
        from_subaccount: Some(from_subaccount),
        created_at_time: None,
        amount: Nat::from(LBRY_MINT_COST_E8S),
    };

    // Call LBRY canister to verify the transfer
    let transfer_result: CallResult<(Result<Nat, TransferError>,)> = ic_cdk::call(
        lbry_principal(),
        "icrc1_transfer",
        (transfer_arg,),
    ).await;

    match transfer_result {
        Ok((result,)) => match result {
            Ok(_) => Ok(true),
            Err(e) => Err(format!("LBRY transfer failed: {:?}", e)),
        },
        Err((code, msg)) => Err(format!("Error calling LBRY canister: {:?} - {}", code, msg)),
    }
}

async fn mint_original(minting_number: Nat, caller: Principal) -> Result<String, String> {
    // Verify LBRY payment to ICP_SWAP (burn address)
    let payment_result = verify_lbry_payment(
        caller,
        icp_swap_principal(),
        None
    ).await?;

    if !payment_result {
        return Err("Failed to transfer LBRY tokens to ICP_SWAP".to_string());
    }

    // Mint the original NFT
    match super::update::mint_nft(minting_number, None).await {
        Ok(_) => Ok("Original NFT minted successfully!".to_string()),
        Err(e) => Err(format!("Mint failed: {}", e)),
    }
}

async fn mint_scion_from_original(minting_number: Nat, caller: Principal) -> Result<String, String> {
    let nft_wallet = to_nft_subaccount(minting_number.clone());
    
    // Verify LBRY payment to NFT wallet
    let payment_result = verify_lbry_payment(
        caller,
        nft_manager_principal(),
        Some(nft_wallet.to_vec())
    ).await?;

    if !payment_result {
        return Err("Failed to transfer LBRY to original NFT owner".to_string());
    }

    // Calculate new scion ID and mint
    let new_scion_id = og_to_scion_id(minting_number, caller);
    match super::update::mint_scion_nft(new_scion_id, None).await {
        Ok(_) => Ok("Scion NFT saved successfully!".to_string()),
        Err(e) => Err(format!("Mint failed: {}", e)),
    }
}

async fn mint_scion_from_scion(
    minting_number: Nat, 
    caller: Principal,
    scion_owner: Principal
) -> Result<String, String> {
    // Calculate the existing scion's ID to get its wallet
    let existing_scion_id = og_to_scion_id(minting_number.clone(), scion_owner);
    let scion_wallet = to_nft_subaccount(existing_scion_id);
    
    // Send LBRY to the existing scion NFT's wallet
    let payment_result = verify_lbry_payment(
        caller,
        nft_manager_principal(),
        Some(scion_wallet.to_vec())
    ).await?;

    if !payment_result {
        return Err("Failed to transfer LBRY to the Scion NFT's wallet".to_string());
    }

    // Calculate new scion ID for the caller and mint
    let new_scion_id = og_to_scion_id(minting_number, caller);
    match super::update::mint_scion_nft(new_scion_id, None).await {
        Ok(_) => Ok("Scion NFT saved successfully!".to_string()),
        Err(e) => Err(format!("Mint failed: {}", e)),
    }
}