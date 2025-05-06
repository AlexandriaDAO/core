use candid::{CandidType, Nat, Principal, Deserialize};
use ic_cdk;
use std::convert::TryInto;
use std::ops::Bound;
use std::collections::BTreeMap; // HashSet is no longer used directly in this file.

use crate::storage::{
    // SHELVES, // No longer used in this file as feeds have moved
    TAG_POPULARITY_INDEX, TAG_LEXICAL_INDEX, TAG_METADATA,
    FOLLOWED_USERS, FOLLOWED_TAGS, // Keep FOLLOWED_*
    Shelf, Item, ShelfId, NormalizedTag, // ItemId is no longer used directly
    TagMetadata, PrincipalSet, NormalizedTagSet
};
// Remove UserProfileOrder import

use crate::types::TagPopularityKey; // TagShelfAssociationKey is no longer used
use crate::utils::normalize_tag; // Keep
use crate::guard::not_anon; // Keep

// --- Pagination Defaults ---
pub(super) const DEFAULT_PAGE_LIMIT: usize = 20; // Keep pub(super) for now
pub(super) const MAX_PAGE_LIMIT: usize = 50;   // Keep pub(super) for now

// --- Pagination Input Types ---

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct OffsetPaginationInput {
    pub offset: Nat,
    pub limit: Nat,
}

impl OffsetPaginationInput {
    pub fn get_limit(&self) -> usize { // <<< Make pub
        self.limit.clone().0.try_into().unwrap_or(DEFAULT_PAGE_LIMIT).min(MAX_PAGE_LIMIT)
    }

    pub fn get_offset(&self) -> usize { // <<< Make pub
        self.offset.clone().0.try_into().unwrap_or(0)
    }
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct CursorPaginationInput<C: CandidType + Clone> {
    pub cursor: Option<C>,
    pub limit: Nat,
}

impl<C: CandidType + Clone> CursorPaginationInput<C> {
    pub fn get_limit(&self) -> usize { // <<< Make pub
        self.limit.clone().0.try_into().unwrap_or(DEFAULT_PAGE_LIMIT).min(MAX_PAGE_LIMIT)
    }
}

// --- Pagination Result Types ---

#[derive(CandidType, Debug, Clone)]
pub struct OffsetPaginatedResult<T: CandidType + Clone> {
    pub items: Vec<T>,
    pub total_count: Nat,
    pub limit: Nat,
    pub offset: Nat,
}

#[derive(CandidType, Debug, Clone)]
pub struct CursorPaginatedResult<T: CandidType + Clone, C: CandidType + Clone> {
    pub items: Vec<T>,
    pub next_cursor: Option<C>,
    pub limit: Nat,
}

#[derive(CandidType, Debug)]
pub enum QueryError {
    ShelfNotFound,
    UserNotFound,
    InvalidTimeRange,
    TagNotFound,
    InvalidCursor,
}

pub type QueryResult<T> = Result<T, QueryError>;

// --- Public Shelf structure for Candid export ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ShelfPublic {
    pub shelf_id: ShelfId,
    pub title: String,
    pub description: Option<String>,
    pub owner: Principal,
    pub items: BTreeMap<u32, Item>, // Assuming Item is CandidType
    // Use Vec for positions, ordered by the tracker
    pub item_positions: Vec<(u32, f64)>,
    pub created_at: u64,
    pub updated_at: u64,
    pub appears_in: Vec<ShelfId>,
    pub tags: Vec<NormalizedTag>, // Assuming NormalizedTag (String) is CandidType
    pub is_public: bool,
}

// Helper function to convert internal Shelf to ShelfPublic
impl From<Shelf> for ShelfPublic {
    fn from(shelf: Shelf) -> Self {
        Self {
            shelf_id: shelf.shelf_id,
            title: shelf.title,
            description: shelf.description,
            owner: shelf.owner,
            items: shelf.items,
            item_positions: shelf.item_positions.get_ordered_entries(), // Use tracker method
            created_at: shelf.created_at,
            updated_at: shelf.updated_at,
            appears_in: shelf.appears_in,
            tags: shelf.tags,
            is_public: shelf.is_public,
        }
    }
}

/// Get the number of shelves associated with a specific tag.
#[ic_cdk::query]
pub fn get_tag_shelf_count(tag: String) -> u64 {
     let normalized_tag = normalize_tag(&tag);
     
     crate::storage::TAG_METADATA.with(|meta| {
         meta.borrow()
             .get(&normalized_tag)
             .map_or(0, |m| m.current_shelf_count)
     })
}

/// Get popular tags (most associated shelves first - Paginated).
#[ic_cdk::query]
pub fn get_popular_tags(
    pagination: CursorPaginationInput<TagPopularityKey>
) -> QueryResult<CursorPaginatedResult<NormalizedTag, TagPopularityKey>> {
    let limit = pagination.get_limit();
    let limit_plus_one = limit + 1;
    let mut result_keys: Vec<TagPopularityKey> = Vec::with_capacity(limit_plus_one);

    TAG_POPULARITY_INDEX.with(|pop| {
        let map = pop.borrow();

        // Determine the starting bound for reverse iteration based on the cursor
        let start_bound = match pagination.cursor {
            Some(cursor_key) => Bound::Excluded(cursor_key), // Start exclusively before the cursor (higher popularity)
            None => Bound::Unbounded, // Start from the highest popularity
        };
        
        // Iterate in reverse (highest count first)
        for (key, _) in map.iter().rev() // Use iter().rev() for descending order
            .skip_while(|(k, _)| match start_bound {
                Bound::Excluded(ref cursor_key) => k >= cursor_key, // Skip keys >= cursor
                Bound::Unbounded => false,
                _ => unreachable!(), // Should only be Excluded or Unbounded
            })
            .take(limit_plus_one) 
        {
            result_keys.push(key.clone());
        }
    });

    // Determine the next cursor
    let next_cursor = if result_keys.len() == limit_plus_one {
        result_keys.pop() // Remove the extra item and use its key as the cursor
    } else {
        None
    };

    // Extract tags from the keys
    let items: Vec<NormalizedTag> = result_keys.into_iter().map(|key| key.1).collect();

    Ok(CursorPaginatedResult {
        items,
        next_cursor,
        limit: Nat::from(limit),
    })
}

/// Get tags starting with a given prefix (case-insensitive - Paginated).
#[ic_cdk::query]
pub fn get_tags_with_prefix(
    prefix: String, 
    pagination: CursorPaginationInput<NormalizedTag>
) -> QueryResult<CursorPaginatedResult<NormalizedTag, NormalizedTag>> {
    let normalized_prefix = normalize_tag(&prefix);
    if normalized_prefix.is_empty() {
        // Return empty result for empty prefix
        return Ok(CursorPaginatedResult {
            items: Vec::new(),
            next_cursor: None,
            limit: Nat::from(pagination.get_limit()),
        });
    }

    let limit = pagination.get_limit();
    let limit_plus_one = limit + 1;
    let mut matching_tags = Vec::with_capacity(limit_plus_one);

    TAG_LEXICAL_INDEX.with(|lex| {
        let map = lex.borrow();

        // Determine the start bound based on the cursor
        let start_bound = match pagination.cursor {
            Some(cursor_tag) => {
                // Basic validation: cursor must start with the prefix
                if !cursor_tag.starts_with(&normalized_prefix) {
                    return Err(QueryError::InvalidCursor); 
                }
                Bound::Excluded(cursor_tag)
            },
            None => Bound::Included(normalized_prefix.clone()), // Start from the prefix itself
        };

        // Iterate through tags starting from the bound
        for (tag, _) in map.range((start_bound, Bound::Unbounded)) {
            // Stop if the tag no longer starts with the prefix
            if !tag.starts_with(&normalized_prefix) {
                break;
            }

            matching_tags.push(tag.clone());

            // Stop if we have fetched enough tags for pagination
            if matching_tags.len() >= limit_plus_one {
                break;
            }
        }
        Ok(())
    })?;

    // Determine the next cursor
    let next_cursor = if matching_tags.len() == limit_plus_one {
        matching_tags.pop() // The last tag fetched is the cursor for the next page
    } else {
        None
    };

    // `matching_tags` now contains only the items for the current page
    let items = matching_tags;

    Ok(CursorPaginatedResult {
        items,
        next_cursor,
        limit: Nat::from(limit),
    })
}

// --- Follow System Queries ---

/// Query to get the list of tags followed by the caller.
#[ic_cdk::query(guard = "not_anon")]
pub fn get_my_followed_tags() -> QueryResult<Vec<NormalizedTag>> {
    let caller = ic_cdk::caller();

    FOLLOWED_TAGS.with(|followed| {
        let map = followed.borrow();
        let tags = map.get(&caller)
                     .map(|nts| nts.clone())
                     .map(|tag_set| tag_set.0.into_iter().collect())
                     .unwrap_or_default();
        Ok(tags)
    })
}

/// Query to get the list of users (Principals) followed by the caller.
#[ic_cdk::query(guard = "not_anon")]
pub fn get_my_followed_users() -> QueryResult<Vec<Principal>> {
    let caller = ic_cdk::caller();

    FOLLOWED_USERS.with(|followed| {
        let map = followed.borrow();
        // Retrieve the PrincipalSet for the caller, default to empty if not found.
        let users = map.get(&caller)
                     .map(|ps| ps.clone()) // Clone the PrincipalSet
                     .map(|user_set| user_set.0.into_iter().collect()) // Convert HashSet<Principal> to Vec<Principal>
                     .unwrap_or_default(); // Return empty Vec if user wasn't following anyone
        Ok(users)
    })
}

