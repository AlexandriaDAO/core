use crate::{Listing, Nft, LISTING};
use candid::{Nat, Principal};
use ic_cdk::{caller, query};
use icrc_ledger_types::icrc1::account::Subaccount;

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
    search_type: String,
) -> Listing {
    // search by nft owner, token_id and filter by price in assending or decending order
    let page: u64 = page.unwrap_or(1); // Default to 1 if None
    let page_size = page_size.unwrap_or(10); // Default to 10 if None

    LISTING.with(|nfts| {
        let nft_map = nfts.borrow();

        let mut nfts: Vec<(String, Nft)> = nft_map
            .iter()
            .filter(|(_, nft)| {
                if search_type == "userListings".to_string() {
                    if let Some(ref token_id_filter) = token_id_filter {
                        nft.token_id == *token_id_filter && nft.owner == caller()
                    } else {
                        nft.owner == caller()
                    }
                } else if let Some(ref token_id_filter) = token_id_filter {
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


#[ic_cdk::query]
pub fn principal_to_subaccount(principal: Principal) -> Subaccount {
    let mut subaccount = [0u8; 32];
    let principal_bytes = principal.as_slice();
    
    // First 28 bytes: principal bytes (padded with zeros if needed)
    let principal_len = principal_bytes.len();
    subaccount[..principal_len].copy_from_slice(principal_bytes);
    
    // Byte 28: length of the principal
    subaccount[28] = principal_len as u8;
    
    // Last 3 bytes: CRC24 checksum of the principal
    let checksum = calculate_crc24(principal_bytes);
    subaccount[29] = ((checksum >> 16) & 0xFF) as u8;
    subaccount[30] = ((checksum >> 8) & 0xFF) as u8;
    subaccount[31] = (checksum & 0xFF) as u8;
    
    subaccount
}

// CRC24 implementation
fn calculate_crc24(data: &[u8]) -> u32 {
    const CRC24_POLY: u32 = 0x1864CFB; // CRC-24 polynomial
    let mut crc: u32 = 0xB704CE;       // CRC-24 initial value
    
    for &byte in data {
        crc ^= (byte as u32) << 16;
        for _ in 0..8 {
            crc <<= 1;
            if (crc & 0x1000000) != 0 {
                crc ^= CRC24_POLY;
            }
        }
    }
    
    crc & 0xFFFFFF // Return 24 bits only
}
