use ic_cdk::query;
use crate::{Nft, LISTING};

#[query]
pub fn get_listing() -> Vec<(u64, Nft)> {
    LISTING.with(|nfts| {
        let nft_map = nfts.borrow();
        nft_map
            .iter()
            .map(|(token_id, nft)| (token_id.clone(), nft.clone())) // Clone to ensure ownership
            .collect()
    })
}