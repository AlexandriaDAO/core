use candid::{CandidType, Deserialize};
use crate::storage::{Slot, SlotContent, SHELVES, NFT_SHELVES, USER_SHELVES, create_shelf};


#[ic_cdk::update]
pub async fn store_shelf(
    title: String,
    description: Option<String>,
    slots: Vec<Slot>,
) -> Result<(), String> {
    let shelf = create_shelf(title, description, slots).await?;  // Remove owner parameter
    let shelf_id = shelf.shelf_id.clone();
    let now = shelf.created_at;

    // Store NFT references
    for slot in shelf.slots.values() {
        if let SlotContent::Nft(nft_id) = &slot.content {
            NFT_SHELVES.with(|nft_shelves| {
                let mut nft_map = nft_shelves.borrow_mut();
                let mut shelves = nft_map.get(nft_id).unwrap_or_default();
                shelves.0.push(shelf_id.clone());
                nft_map.insert(nft_id.to_string(), shelves);
            });
        }
    }

    SHELVES.with(|shelves| {
        shelves.borrow_mut().insert(shelf_id.clone(), shelf.clone());
    });

    USER_SHELVES.with(|user_shelves| {
        let mut user_map = user_shelves.borrow_mut();
        let mut user_shelves_set = user_map.get(&shelf.owner).unwrap_or_default();
        user_shelves_set.0.insert((now, shelf_id.clone()));
        user_map.insert(shelf.owner, user_shelves_set);
    });

    Ok(())
}

// Update update_shelf function
#[ic_cdk::update]
pub fn update_shelf(shelf_id: String, updates: ShelfUpdate) -> Result<(), String> {
    SHELVES.with(|shelves| {
        let mut shelves_map = shelves.borrow_mut();
        if let Some(mut shelf) = shelves_map.get(&shelf_id) {
            // Enforce owner check using caller
            if shelf.owner != ic_cdk::caller() {
                return Err("Unauthorized: Only shelf owner can update".to_string());
            }

            if let Some(title) = updates.title {
                shelf.title = title;
            }
            shelf.description = updates.description;

            if let Some(new_slots) = updates.slots {
                if new_slots.len() > 500 {
                    return Err("Cannot exceed 500 slots per shelf".to_string());
                }
                // Handle NFT reference updates
                let old_nfts: Vec<String> = shelf.slots.values()
                    .filter_map(|slot| match &slot.content {
                        SlotContent::Nft(id) => Some(id.clone()),
                        _ => None
                    })
                    .collect();

                let new_nfts: Vec<String> = new_slots.iter()
                    .filter_map(|slot| match &slot.content {
                        SlotContent::Nft(id) => Some(id.clone()),
                        _ => None
                    })
                    .collect();

                // Remove old NFT references
                for nft_id in old_nfts.iter().filter(|id| !new_nfts.contains(id)) {
                    NFT_SHELVES.with(|nft_shelves| {
                        let mut nft_map = nft_shelves.borrow_mut();
                        if let Some(mut shelves) = nft_map.get(nft_id) {
                            shelves.0.retain(|id| id != &shelf_id);
                            nft_map.insert(nft_id.clone(), shelves);
                        }
                    });
                }

                // Add new NFT references
                for nft_id in new_nfts.iter().filter(|id| !old_nfts.contains(id)) {
                    NFT_SHELVES.with(|nft_shelves| {
                        let mut nft_map = nft_shelves.borrow_mut();
                        let mut shelves = nft_map.get(nft_id).unwrap_or_default();
                        shelves.0.push(shelf.shelf_id.clone());
                        nft_map.insert(nft_id.clone(), shelves);
                    });
                }

                // Update slots
                shelf.slots.clear();
                for slot in new_slots {
                    shelf.slots.insert(slot.id, slot);
                }
            }

            shelf.updated_at = ic_cdk::api::time();
            shelves_map.insert(shelf_id, shelf);
            Ok(())
        } else {
            Err("Shelf not found".to_string())
        }
    })
}

#[derive(CandidType, Deserialize)]
pub struct ShelfUpdate {
    pub title: Option<String>,
    pub description: Option<String>,
    pub slots: Option<Vec<Slot>>,
}

#[derive(CandidType, Deserialize)]
pub struct SlotReorderInput {
    pub slot_id: u32,
    pub reference_slot_id: Option<u32>,
    pub before: bool,
}

#[ic_cdk::update]
pub fn reorder_shelf_slot(shelf_id: String, reorder: SlotReorderInput) -> Result<(), String> {
    SHELVES.with(|shelves| {
        let mut shelves_map = shelves.borrow_mut();
        if let Some(mut shelf) = shelves_map.get(&shelf_id) {
            // Enforce owner check using caller
            if shelf.owner != ic_cdk::caller() {
                return Err("Unauthorized: Only shelf owner can reorder slots".to_string());
            }

            // Use the existing move_slot method to handle the reordering
            shelf.move_slot(reorder.slot_id, reorder.reference_slot_id, reorder.before)?;
            
            // Update the timestamp and save
            shelf.updated_at = ic_cdk::api::time();
            shelves_map.insert(shelf_id, shelf);
            Ok(())
        } else {
            Err("Shelf not found".to_string())
        }
    })
}


