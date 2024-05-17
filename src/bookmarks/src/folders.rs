use candid::{CandidType, Deserialize, Encode, Decode, Principal};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::{borrow::Cow, cell::RefCell};

use ic_cdk::caller;
use ic_cdk::{update, query};

use super::{
  BookMark,
  BM,
};

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Deserialize, Clone)]
pub struct UserFolders {
    pub folders: Vec<UserFolder>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct UserFolder {
    pub name: String,
    pub post_ids: Vec<u64>,
}

impl Storable for UserFolders {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
    RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // K: user principal | V: UserFolders
    pub static USER_FOLDERS: RefCell<StableBTreeMap<Principal, UserFolders, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(7))),
        )
    );
}

impl UserFolders {
    fn create_folder(&mut self, name: String) -> Result<(), String> {
        if self.folders.len() >= 20 {
            return Err("Maximum number of folders reached".to_string());
        }

        if self.folders.iter().any(|folder| folder.name == name) {
            return Err("Folder with the same name already exists".to_string());
        }

        let new_folder = UserFolder {
            name,
            post_ids: Vec::new(),
        };

        self.folders.push(new_folder);
        Ok(())
    }

    fn add_post_id(&mut self, folder_name: String, post_id: u64) -> Result<(), String> {
        if let Some(folder) = self.folders.iter_mut().find(|folder| folder.name == folder_name) {
            if folder.post_ids.len() >= 1000 {
              return Err("Maximum number of bookmarks (1,000) reached for this folder".to_string());
            }
            
            if !folder.post_ids.contains(&post_id) {
                folder.post_ids.push(post_id);
                Ok(())
            } else {
                Err("Post ID already exists in the folder".to_string())
            }
        } else {
            Err("Folder not found".to_string())
        }
    }
}

#[update]
pub fn create_folder(name: String) -> Result<(), String> {
    let user_principal = caller();

    USER_FOLDERS.with(|user_folders| {
        let mut user_folders = user_folders.borrow_mut();
        if let Some(mut user_entry) = user_folders.remove(&user_principal) {
            match user_entry.create_folder(name) {
                Ok(_) => {
                    user_folders.insert(user_principal, user_entry);
                    Ok(())
                }
                Err(e) => {
                    user_folders.insert(user_principal, user_entry);
                    Err(e)
                }
            }
        } else {
            let mut new_user_entry = UserFolders {
                folders: Vec::new(),
            };
            new_user_entry.create_folder(name)?;
            user_folders.insert(user_principal, new_user_entry);
            Ok(())
        }
    })
}


#[update]
pub fn delete_folder(name: String) -> Result<(), String> {
    let user_principal = caller();

    USER_FOLDERS.with(|user_folders| {
        let mut user_folders = user_folders.borrow_mut();
        if let Some(mut user_entry) = user_folders.remove(&user_principal) {
            if let Some(index) = user_entry.folders.iter().position(|folder| folder.name == name) {
                user_entry.folders.remove(index);
                user_folders.insert(user_principal, user_entry);
                Ok(())
            } else {
                user_folders.insert(user_principal, user_entry);
                Err("Folder not found".to_string())
            }
        } else {
            Err("User folders not found".to_string())
        }
    })
}

#[update]
pub fn add_bm_to_folder(folder_name: String, post_id: u64) -> Result<(), String> {
    let user_principal = caller();

    USER_FOLDERS.with(|user_folders| {
        let mut user_folders = user_folders.borrow_mut();
        if let Some(mut user_entry) = user_folders.remove(&user_principal) {
            match user_entry.add_post_id(folder_name, post_id) {
                Ok(_) => {
                    user_folders.insert(user_principal, user_entry);
                    Ok(())
                }
                Err(e) => {
                    user_folders.insert(user_principal, user_entry);
                    Err(e)
                }
            }
        } else {
            Err("User folders not found".to_string())
        }
    })
}

#[query]
pub fn get_user_folders() -> Result<Vec<UserFolder>, String> {
    let user_principal = caller();

    USER_FOLDERS.with(|user_folders| {
        let user_folders = user_folders.borrow();
        if let Some(user_entry) = user_folders.get(&user_principal) {
            Ok(user_entry.folders.clone())
        } else {
            Err("User folders not found".to_string())
        }
    })
}


// Get Posts out of Folders

fn get_bms(post_ids: Vec<u64>) -> Vec<Option<BookMark>> {
  assert!(post_ids.len() <= 100, "Maximum of 100 post IDs allowed");

  BM.with(|bm| {
    post_ids
    .iter()
    .map(|post_id| bm.borrow().get(post_id))
    .collect()
  })
}

fn get_folder_posts_section(
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
pub fn get_user_folder_posts(folder_name: String, slot: usize, amount: Option<usize>) -> (Vec<Option<BookMark>>, usize) {
  const MAX_AMOUNT: usize = 40;
  let amount = amount.unwrap_or(10).min(MAX_AMOUNT);

  let user_principal = caller();

  USER_FOLDERS.with(|user_folders| {
      user_folders
          .borrow()
          .get(&user_principal)
          .and_then(|user_entry| {
              user_entry
                  .folders
                  .iter()
                  .find(|folder| folder.name == folder_name)
                  .map(|folder| get_folder_posts_section(&folder.post_ids, slot, amount))
          })
          .unwrap_or_else(|| (Vec::new(), 0))
  })
}