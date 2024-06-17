use ic_cdk::api::caller;
use ic_cdk::{query, update};

use super::utils::hash_principal;
use super::{BookMark, BM, UGBN, USER_FAVORITES, USER_SAVES};

#[query]
fn get_bms(post_ids: Vec<u64>) -> Vec<Option<BookMark>> {
    assert!(post_ids.len() <= 100, "Maximum of 100 post IDs allowed");

    BM.with(|bm| {
        post_ids
            .iter()
            .map(|post_id| bm.borrow().get(post_id))
            .collect()
    })
}

// Should say that it's not your bookmark if the operation fails.
#[update]
pub fn remove_bm(post_id: u64) {
    let owner_hash = hash_principal(caller());

    USER_SAVES.with(|user_saves| {
        let user_saves = user_saves.borrow_mut();

        if let Some(mut user_entry) = user_saves.get(&owner_hash) {
            if let Some(index) = user_entry.post_id.iter().position(|&id| id == post_id) {
                user_entry.post_id.remove(index);
            }
        }
    });
}

fn get_bookmarks_section(
    post_ids: &[u64],
    slot: usize,
    amount: usize,
) -> (Vec<Option<BookMark>>, usize) {
    let total_entries = post_ids.len();
    let start_index = (slot * amount).min(total_entries);
    let end_index = (start_index + amount).min(total_entries);

    let section_ids: Vec<u64> = post_ids[start_index..end_index].to_vec();
    let bookmarks = get_bms(section_ids);

    (bookmarks, total_entries)
}

#[query]
pub fn get_user_bms(slot: usize, amount: Option<usize>) -> (Vec<Option<BookMark>>, usize) {
    const MAX_AMOUNT: usize = 40;
    let amount = amount.unwrap_or(10).min(MAX_AMOUNT);

    let owner_hash = hash_principal(caller());

    USER_SAVES.with(|user_bms| {
        user_bms
            .borrow()
            .get(&owner_hash)
            .map(|user_entry| get_bookmarks_section(&user_entry.post_id, slot, amount))
            .unwrap_or_else(|| (Vec::new(), 0))
    })
}

#[query]
pub fn get_user_favorites(slot: usize, amount: Option<usize>) -> (Vec<Option<BookMark>>, usize) {
    const MAX_AMOUNT: usize = 40;
    let amount = amount.unwrap_or(10).min(MAX_AMOUNT);

    let caller = caller();

    USER_FAVORITES.with(|favorites| {
        favorites
            .borrow()
            .get(&caller)
            .map(|user_favorites| get_bookmarks_section(&user_favorites.favorite_ids, slot, amount))
            .unwrap_or_else(|| (Vec::new(), 0))
    })
}

#[query]
pub fn get_ugbn_posts(
    ugbn: u64,
    slot: usize,
    amount: Option<usize>,
) -> (Vec<Option<BookMark>>, usize) {
    const MAX_AMOUNT: usize = 40;
    let amount = amount.unwrap_or(10).min(MAX_AMOUNT);

    UGBN.with(|ugbn_map| {
        ugbn_map
            .borrow()
            .get(&ugbn)
            .map(|ugbn_entry| get_bookmarks_section(&ugbn_entry.ugbn, slot, amount))
            .unwrap_or_else(|| (Vec::new(), 0))
    })
}
