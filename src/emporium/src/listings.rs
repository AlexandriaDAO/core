use crate::{id_converter, Nft, NftStatus, LISTING};
use candid::{CandidType, Nat, Principal};
use ic_cdk::query;
use serde::Deserialize;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ArweaveNft {
    pub arweave_id: String,
    pub owner: Principal,
    pub price: u64,
    pub token_id: Nat,
    pub status: NftStatus,
    pub time: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ListingsQuery {
    pub page: u64,
    pub page_size: u64,
    pub sort_by: SortBy,
    pub sort_order: SortOrder,
    pub selected_user: Option<Principal>, // User selector filter
    pub search_term: Option<String>,      // Token ID search within filtered set
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum SortBy {
    Price, // Sort by NFT price - most useful for marketplace
    Time,  // Sort by listing time - show newest/oldest first
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum SortOrder {
    Asc,  // Ascending: oldest first, lowest price first
    Desc, // Descending: newest first, highest price first
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ListingsResponse {
    pub nfts: Vec<ArweaveNft>,
    pub total_count: u64,
    pub page: u64,
    pub page_size: u64,
    pub total_pages: u64,
    pub has_next: bool,
    pub has_prev: bool,
}

impl Default for ListingsQuery {
    fn default() -> Self {
        Self {
            page: 1,
            page_size: 12,
            sort_by: SortBy::Time,       // Default: show by time
            sort_order: SortOrder::Desc, // Default: newest first
            selected_user: None,         // Default: all users
            search_term: None,           // Default: no search
        }
    }
}

/**
 * Core query function with filtering funnel approach:
 *
 * Filtering Logic:
 * 1. Start with all listings in storage
 * 2. Apply user filter (if specified) -> narrows down to specific user's listings
 * 3. Apply search filter (if specified) -> searches within the user-filtered results
 * 4. Sort the final filtered results
 * 5. Apply pagination
 *
 * Scenarios:
 * - No user + No search = All listings
 * - No user + Search = Search through ALL listings
 * - User selected + No search = Only that user's listings
 * - User selected + Search = Search only within that user's listings
 */
#[query]
pub fn get_listings(query: ListingsQuery) -> ListingsResponse {
    LISTING.with(|storage| {
        let listings = storage.borrow();

        // STEP 1: Apply user filter first
        // This creates our "scope" for the search
        let user_filtered: Vec<Nft> = if let Some(selected_user) = query.selected_user {
            // Scenario: User is selected -> only show that user's listings
            listings
                .iter()
                .filter(|(_, nft)| nft.owner == selected_user)
                .map(|(_, nft)| nft.clone())
                .collect()
        } else {
            // Scenario: No user selected -> show all listings from all users
            listings
                .iter()
                .map(|(_, nft)| nft.clone())
                .collect()
        };

        // STEP 2: Apply search filter within the user-filtered scope
        let mut search_filtered: Vec<Nft> =
            if let Some(ref search_term) = query.search_term {
                // Search for token IDs within the current scope (all users OR specific user)
                user_filtered
                    .into_iter()
                    .filter(|nft| matches_token_search(nft, search_term))
                    .collect()
            } else {
                // No search term -> use all results from user filter step
                user_filtered
            };

        // STEP 3: Sort the filtered results
        sort_listings(&mut search_filtered, &query.sort_by, &query.sort_order);

        // STEP 4: Calculate pagination info
        let total_count = search_filtered.len() as u64;
        let total_pages = if total_count == 0 {
            1
        } else {
            (total_count + query.page_size - 1) / query.page_size // Ceiling division
        };

        // STEP 5: Apply pagination with bounds checking
        let start_idx = ((query.page - 1) * query.page_size) as usize;
        let end_idx = (start_idx + query.page_size as usize).min(search_filtered.len());

        let paginated_nfts = if start_idx < search_filtered.len() {
            search_filtered[start_idx..end_idx].to_vec()
        } else {
            Vec::new()
        };

        // Convert to ArweaveNft only for the paginated results
        let nfts: Vec<ArweaveNft> = paginated_nfts
            .into_iter()
            .map(|nft| ArweaveNft {
                arweave_id: id_converter::nat_to_arweave_id(nft.token_id.clone()),
                owner: nft.owner,
                price: nft.price,
                token_id: nft.token_id,
                status: nft.status,
                time: nft.time,
            })
            .collect();

        ListingsResponse {
            nfts,
            total_count,
            page: query.page,
            page_size: query.page_size,
            total_pages,
            has_next: query.page < total_pages,
            has_prev: query.page > 1,
        }
    })
}

/**
 * Search for token IDs within NFT data
 * Supports both direct Nat token IDs and Arweave ID matching
 */
fn matches_token_search(nft: &Nft, search_term: &str) -> bool {
    // Try parsing as direct Nat token ID (e.g., "123", "456")
    if let Ok(token_id) = search_term.parse::<Nat>() {
        if nft.token_id == token_id {
            return true;
        }
    }

    // Generate arweave_id from token_id and compare
    let arweave_id = id_converter::nat_to_arweave_id(nft.token_id.clone());
    if arweave_id == search_term {
        return true;
    }

    false
}

/**
 * Efficient sorting using unstable sort for better performance
 * unstable_sort is faster than stable_sort when order of equal elements doesn't matter
 */
fn sort_listings(items: &mut [Nft], sort_by: &SortBy, sort_order: &SortOrder) {
    match (sort_by, sort_order) {
        // Price sorting - useful for finding cheapest/most expensive
        (SortBy::Price, SortOrder::Asc) => {
            items.sort_unstable_by(|a, b| a.price.cmp(&b.price)); // Lowest price first
        }
        (SortBy::Price, SortOrder::Desc) => {
            items.sort_unstable_by(|a, b| b.price.cmp(&a.price)); // Highest price first
        }

        // Time sorting - useful for finding newest/oldest listings
        (SortBy::Time, SortOrder::Asc) => {
            items.sort_unstable_by(|a, b| a.time.cmp(&b.time)); // Oldest first
        }
        (SortBy::Time, SortOrder::Desc) => {
            items.sort_unstable_by(|a, b| b.time.cmp(&a.time)); // Newest first (default)
        }
    }
}

// ===== UTILITY FUNCTIONS FOR UI =====

/**
 * Get all unique users who have listings
 * Used for: User selector dropdown in marketplace
 */
#[query]
pub fn get_listing_users() -> Vec<Principal> {
    LISTING.with(|storage| {
        let listings = storage.borrow();
        let mut users: Vec<Principal> = listings.iter().map(|(_, nft)| nft.owner).collect();

        // Remove duplicates and sort for consistent dropdown order
        users.sort_unstable();
        users.dedup();
        users
    })
}

/**
 * Get listed NFTs for multiple token IDs
 * Returns Option<Nft> for each token_id - None if token is not found
 * Used for: Frontend price display and listing status in token grids
 */
#[query]
pub fn get_listed_tokens(token_ids: Vec<Nat>) -> Vec<Option<Nft>> {
    LISTING.with(|storage| {
        let listings = storage.borrow();
        token_ids
            .into_iter()
            .map(|token_id| listings.get(&token_id.to_string()))
            .collect()
    })
}

// . Easy Extensions:
//   - User's buying history (from existing logs system)
//   - User's favorite NFTs (new storage + queries)
//   - User's total trading volume
//   - User's reputation/rating system
