use crate::{Listing, Nft, LISTING};
use candid::{Nat, Principal};
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

        let start_index = ((page - 1) * page_size) as usize;
        let nfts: Vec<(String, Nft)> = nft_map
            .iter()
            .filter(|(_, nft)| nft.owner == current_caller) // Filter by owner
            .map(|(token_id, nft)| (token_id.clone(), nft.clone())) // Clone to ensure ownership
            .skip(start_index)
            .take(page_size as usize)
            .collect();
        let total_count = nfts.len();
        let total_pages = (total_count as f64 / page_size as f64).ceil() as u64;
        Listing {
            nfts,
            total_pages,
            current_page: page,
            page_size,
        }
    })
}

#[query]
pub fn get_search_listing(
    page: Option<u64>,
    page_size: Option<u64>,
    sort_order: Option<String>,   // "asc" or "desc"
    token_id_filter: Option<Nat>, // Optional filter by token_id
    owner: Option<Principal>,
) -> Listing {
    // search by nft owner, token_id and filter by price in assending or decending order
    let page: u64 = page.unwrap_or(1); // Default to 1 if None
    let page_size = page_size.unwrap_or(10); // Default to 10 if None

    LISTING.with(|nfts| {
        let nft_map = nfts.borrow();

        let mut nfts: Vec<(String, Nft)> = nft_map
            .iter()
            .filter(|(_, nft)| {
                if let Some(ref token_id_filter) = token_id_filter {
                    nft.token_id == *token_id_filter
                } else if let Some(ref owner) = owner {
                    nft.owner == *owner
                } else {
                    true
                }
            })
            .map(|(token_id, nft)| (token_id.clone(), nft.clone())) // Clone to ensure ownership
            .collect();
        if let Some(ref order) = sort_order {
            if order.to_lowercase() == "asc" {
                nfts.sort_by(|a, b| a.1.price.cmp(&b.1.price));
            } else if order.to_lowercase() == "desc" {
                nfts.sort_by(|a, b| b.1.price.cmp(&a.1.price));
            }
        }

        let total_count = nfts.len();
        let total_pages = (total_count as f64 / page_size as f64).ceil() as u64;
        let start_index = ((page - 1) * page_size) as usize;

        let paginated_nfts = nfts
            .into_iter()
            .skip(start_index)
            .take(page_size as usize)
            .collect();

        Listing {
            nfts: paginated_nfts,
            total_pages,
            current_page: page,
            page_size,
        }
    })
}
