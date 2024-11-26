
use std::ptr::null;

use candid::Principal;
use ic_cdk::{api::call, caller, update};

use crate::{
    utils::{get_principal, is_owner, EMPORIUM_CANISTER_ID, ICRC7_CANISTER_ID},
    Nft, LISTING,
};
#[update]
pub async fn list_nft(token_id: u64, icp_amount: u64) -> Result<String, String> {
    //check ownership
    //desposit nft to canister
    //add record to listing
    match is_owner(caller(), token_id).await {
        Ok(true) => {}
        Ok(false) => return Err("You can't list this NFT, ownership proof failed!".to_string()),
        Err(_) => return Err("Something went wrong !".to_string()),
    };
    //desposit_nft_to_canister(token_id).await?;

    LISTING.with(|nfts| -> Result<(), String> {
        let mut nft_map = nfts.borrow_mut();
        let nft = match nft_map.get(&token_id) {
            Some(existing_nft_sale) => {
                return Err("Nft already on sale can't list ".to_string());
            }
            None => Nft {
                owner: caller(),
                price: icp_amount,
                token_id,
                status: "listed".to_string(),
            },
        };

        nft_map.insert(token_id, nft);
        Ok(())
    })?;

    Ok("Nft added for sale".to_string())
    // transfer
}
pub async fn cancel_nft_listing(token_id:u64)-> Result<String,String>
{
    //nft transfer to owner 
    //delete record from storage 


    Ok("Successfully cancelled ".to_string())

}

pub async fn desposit_nft_to_canister(token_id: u64) -> Result<String, String> {
    let nft_canister = get_principal(ICRC7_CANISTER_ID);

    let args = (caller(), get_principal(EMPORIUM_CANISTER_ID), token_id);
    let call_result: ic_cdk::api::call::CallResult<()> =
        ic_cdk::call(nft_canister, "icrc37_transfer_from", (args,)).await;

    match call_result {
        Ok(()) => Ok(("Sucessfully transafered").to_string()),
        Err((code, msg)) => Err(format!("Transfer error {}: {}", code as u8, msg)),
    }
}

