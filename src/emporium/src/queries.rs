use crate::{ Listing, LogEntry, Logs, Nft, LISTING, LOGS };
use candid::{ Nat, Principal };
use ic_cdk::{ api::call, caller, query };

#[query]
pub fn get_listing(page: Option<u64>, page_size: Option<u64>) -> Listing {
    let page = page.unwrap_or(1); // Default to 1 if None
    let page_size = page_size.unwrap_or(10); // Default to 10 if None

    LISTING.with(|nfts| {
        let nft_map = nfts.borrow();
        let total_count = nft_map.len();
        let total_pages = ((total_count as f64) / (page_size as f64)).ceil() as u64;
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
        let total_pages = ((total_count as f64) / (page_size as f64)).ceil() as u64;
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
    sort_order: Option<String>, // "asc" or "desc"
    token_id_filter: Option<Nat>, // Optional filter by token_id
    sort_by_time: Option<String>, // "asc" or "desc" (for timestamp)
    owner: Option<Principal>,
    search_type: String
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
        ic_cdk::println!("The sort is {:?}",sort_by_time);
        // Sorting by time
        if let Some(ref sort_by_time) = sort_by_time {
            ic_cdk::println!("Sorting by time: {:?}", sort_by_time);
        
            if sort_by_time.to_lowercase() == "asc" {
                nfts.sort_by(|a, b| a.1.time.cmp(&b.1.time));
            } else if sort_by_time.to_lowercase() == "desc" {
                nfts.sort_by(|a, b| b.1.time.cmp(&a.1.time));
            }
        }
        

        let total_count = nfts.len();
        let total_pages = ((total_count as f64) / (page_size as f64)).ceil() as u64;
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

#[query]
pub fn get_logs(page: Option<u64>, page_size: Option<u64>, token_id_filter: Option<Nat>) -> Logs {
    let page = page.unwrap_or(1); // Default to 1 if None
    let page_size = page_size.unwrap_or(10); // Default to 10 if None

    LOGS.with(|logs| {
        let logs_map = logs.borrow();
        let total_count = logs_map.len();
        let total_pages = ((total_count as f64) / (page_size as f64)).ceil() as u64;
        let start_index = ((page - 1) * page_size) as usize;

        let filtered_logs: Vec<(u64, LogEntry)> = logs_map
            .iter()
            .filter(|(_, log)| -> bool {
                if token_id_filter.is_some() && token_id_filter != Some(log.token_id.clone()) {
                    return false;
                }
                return true;
            })
            .skip(start_index) // Skip entries before the page start
            .take(page_size as usize) // Take only `page_size` items
            .map(|(timestamp, log)| (timestamp, log.clone())) // Clone log entry
            .collect();
        // Sort the logs by timestamp
        let mut logs = filtered_logs;
        logs.sort_by_key(|(timestamp, _)| std::cmp::Reverse(*timestamp)); // Sort by timestamp in descending order
        Logs {
            logs,
            total_pages,
            current_page: page,
            page_size,
        }
    })
}
#[query]
pub fn get_caller_logs(
    page: Option<u64>,
    page_size: Option<u64>,
    token_id_filter: Option<Nat>
) -> Logs {
    let page = page.unwrap_or(1); // Default to 1 if None
    let page_size = page_size.unwrap_or(10); // Default to 10 if None
    LOGS.with(|logs| {
        let logs_map = logs.borrow();

        // Filter logs where caller is either buyer or seller
        let filtered_logs: Vec<(u64, LogEntry)> = logs_map
            .iter()
            .filter(|(_, log)| -> bool {
                if token_id_filter.is_some() && token_id_filter != Some(log.token_id.clone()) {
                    return false;
                }

                log.buyer == caller() || log.seller == caller()
            })
            .map(|(timestamp, log)| (timestamp, log.clone()))
            .collect();

        let total_count = filtered_logs.len();
        let total_pages = ((total_count as f64) / (page_size as f64)).ceil() as u64;
        let start_index = ((page - 1) * page_size) as usize;

        // Sort the logs by timestamp
        let mut logs = filtered_logs;
        logs.sort_by_key(|(timestamp, _)| std::cmp::Reverse(*timestamp)); // Sort by timestamp in descending order

        // Apply pagination to sorted logs
        logs = logs
            .into_iter()
            .skip(start_index)
            .take(page_size as usize)
            .collect();

        Logs {
            logs,
            total_pages,
            current_page: page,
            page_size,
        }
    })
}
