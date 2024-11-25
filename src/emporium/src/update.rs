use ic_cdk::{caller, update};

use crate::utils::is_owner;
#[update]
pub async  fn list_nft(token_id: u64, icp_amount: u64) -> Result<String, String> {
    //check ownership
    //desposit nft to canister
    // add record to listing
    match is_owner(caller(), token_id).await {
        Ok(true) => {
         
           return  Ok("Deposited!".to_string());
        }
        Ok(false) => Err("You can't list this NFT, ownership proof failed!".to_string()),
        Err(_) => Err("Something went wrong !".to_string()),
    }
   
}
