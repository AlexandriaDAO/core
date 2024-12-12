use crate::{Listing, Nft, LISTING};
use ic_cdk::query;

#[query]
pub fn get_listing(page: Option<u64>, page_size: Option<u64>) -> Listing {
    let page = page.unwrap_or(1); // Default to 1 if None
    let page_size = page_size.unwrap_or(10); // Default to 10 if None

    LISTING.with(|nfts| {
        let nft_map = nfts.borrow();
        let total_count = nft_map.len();
        let total_pages = (total_count as f64 / page_size as f64).ceil() as u64;
        let start_index = ((page - 1) * page_size) as usize;

        let nfts = nft_map
            .iter()
            .map(|(token_id, nft)| (token_id.clone(), nft.clone()))
            .skip(start_index)
            .take(page_size as usize)
            .collect();

        Listing {
            nfts,
            total_pages,
            current_page: page,
            page_size,
        }
    })
}
#[query]
pub fn get_listing_total_count() -> usize {
    LISTING.with(|nfts| {
        let nft_map = nfts.borrow();
        nft_map
            .iter()
            .map(|(token_id, nft)| (token_id.clone(), nft.clone())) // Clone to ensure ownership
            .count()
    })
}


#[query]
pub fn get_caller_listing(page: Option<u64>, page_size: Option<u64>) -> Listing {
    let page = page.unwrap_or(1); // Default to 1 if None
    let page_size = page_size.unwrap_or(10); // Default to 10 if None
    let current_caller = ic_cdk::caller();
    LISTING.with(|nfts| {
        let nft_map = nfts.borrow();
        let total_count = nft_map.len();
        let total_pages = (total_count as f64 / page_size as f64).ceil() as u64;
        let start_index = ((page - 1) * page_size) as usize;
        let nfts=nft_map
            .iter()
            .filter(|(_, nft)| nft.owner == current_caller) // Filter by owner
            .map(|(token_id, nft)| (token_id.clone(), nft.clone())) // Clone to ensure ownership
            .skip(start_index)
            .take(page_size as usize).collect();
        Listing {
            nfts,
            total_pages,
            current_page: page,
            page_size,
        }
    })
}