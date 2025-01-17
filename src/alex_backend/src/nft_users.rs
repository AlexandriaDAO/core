use candid::{CandidType, Deserialize, Principal};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable};
use ic_stable_structures::storable::Bound;
use std::cell::RefCell;
use ic_cdk::api::call::CallResult;

const MAX_VALUE_SIZE: u32 = 256;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    static NFT_USERS: RefCell<StableBTreeMap<Principal, UserNFTInfo, VirtualMemory<DefaultMemoryImpl>>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        ));
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UserNFTInfo {
    pub principal: Principal,
    pub username: String,
    pub has_nfts: bool,
    pub has_scion_nfts: bool,
    pub last_updated: u64,
}

impl Storable for UserNFTInfo {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        let bytes = candid::encode_one(self).expect("Failed to encode UserNFTInfo");
        std::borrow::Cow::Owned(bytes)
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap_or_else(|err| {
            ic_cdk::trap(&format!("Failed to decode UserNFTInfo: {}", err));
        })
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

#[derive(CandidType, Deserialize)]
pub struct UserInfo {
    pub principal: Principal,
    pub username: String,
}

async fn check_nft_ownership(owner: Principal, nft_canister: Principal) -> Result<bool, String> {
    #[derive(CandidType)]
    struct TokensOfArgs {
        owner: Principal,
        subaccount: Vec<Vec<u8>>,
    }

    let args = TokensOfArgs {
        owner,
        subaccount: vec![],
    };

    let result: CallResult<(Vec<candid::Nat>,)> = ic_cdk::api::call::call(
        nft_canister,
        "icrc7_tokens_of",
        (args, None::<candid::Nat>, Some(candid::Nat::from(1_u64))),
    ).await;

    match result {
        Ok((tokens,)) => Ok(!tokens.is_empty()),
        Err((code, msg)) => Err(format!("Error checking NFTs: {} (rejection code: {:?})", msg, code))
    }
}

async fn get_all_users(user_canister: Principal) -> Result<Vec<UserInfo>, String> {
    let result: CallResult<(Vec<UserInfo>,)> = ic_cdk::api::call::call(
        user_canister,
        "get_all_users",
        (),
    ).await;

    match result {
        Ok((users,)) => Ok(users),
        Err((code, msg)) => Err(format!("Error getting users: {} (rejection code: {:?})", msg, code))
    }
}

async fn update_nft_users() -> Result<Vec<UserNFTInfo>, String> {
    let users = get_all_users(crate::user_principal()).await?;
    let mut updated_users = Vec::new();
    
    for user in users {
        let has_nfts = check_nft_ownership(user.principal, crate::icrc7_principal()).await?;
        let has_scion_nfts = check_nft_ownership(user.principal, crate::icrc7_scion_principal()).await?;
        
        let nft_info = UserNFTInfo {
            principal: user.principal,
            username: user.username,
            has_nfts,
            has_scion_nfts,
            last_updated: ic_cdk::api::time(),
        };
        
        // Always update the user info, regardless of NFT ownership
        NFT_USERS.with(|users| users.borrow_mut().insert(user.principal, nft_info.clone()));
        updated_users.push(nft_info);
    }
    
    Ok(updated_users)
}

fn setup_timer() {
    // Set up timer to update NFT users every 4 hours
    let timer_duration_nanos: u64 = 4 * 60 * 60 * 1_000_000_000; // 4 hours in nanoseconds
    ic_cdk_timers::set_timer_interval(std::time::Duration::from_nanos(timer_duration_nanos), || {
        ic_cdk::spawn(async {
            match update_nft_users().await {
                Ok(_) => ic_cdk::println!("Successfully updated NFT users"),
                Err(e) => ic_cdk::println!("Failed to update NFT users: {}", e),
            }
        });
    });
}

#[ic_cdk::init]
fn init() {
    setup_timer();
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    setup_timer();
}

#[ic_cdk::query]
pub fn get_stored_nft_users() -> Vec<UserNFTInfo> {
    NFT_USERS.with(|users| {
        users.borrow()
            .iter()
            .map(|(_, value)| value.clone())
            .collect()
    })
}