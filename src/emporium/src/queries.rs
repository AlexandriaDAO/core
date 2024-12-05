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
