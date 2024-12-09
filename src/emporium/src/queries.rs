use crate::{Nft, LISTING};
use ic_cdk::query;

#[query]
pub fn get_listing() -> Vec<(String, Nft)> {
    LISTING.with(|nfts| {
        let nft_map = nfts.borrow();
        nft_map
            .iter()
            .map(|(token_id, nft)| (token_id.clone(), nft.clone())) // Clone to ensure ownership
            .collect()
    })
}
#[query]
pub fn get_caller_listing() -> Vec<(String, Nft)> {
    let current_caller = ic_cdk::caller(); 
    LISTING.with(|nfts| {
        let nft_map = nfts.borrow();
        nft_map
            .iter()
            .filter(|(_, nft)| nft.owner == current_caller) // Filter by owner
            .map(|(token_id, nft)| (token_id.clone(), nft.clone())) // Clone to ensure ownership
            .collect()
    })
}
