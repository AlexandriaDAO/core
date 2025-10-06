use candid::Principal;
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk::{caller, init, post_upgrade, pre_upgrade, println, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use std::cell::RefCell;

use crate::types::UserBalance;

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static USER_BALANCES: RefCell<StableBTreeMap<Principal, UserBalance, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );

    static STRIPE_API_SECRET: RefCell<String> = RefCell::new(String::new());
    static STRIPE_WEBHOOK_SECRET: RefCell<String> = RefCell::new(String::new());
}

#[init]
fn init() {
    println!("Stripe backend canister initialized");
}

#[pre_upgrade]
fn pre_upgrade() {
    let api_secret = STRIPE_API_SECRET.with(|s| s.borrow().clone());
    let webhook_secret = STRIPE_WEBHOOK_SECRET.with(|s| s.borrow().clone());
    stable_save((api_secret, webhook_secret)).expect("Failed to save secrets to stable memory");
    println!("Pre-upgrade: Saved state to stable memory");
}

#[post_upgrade]
fn post_upgrade() {
    let (api_secret, webhook_secret): (String, String) = stable_restore().unwrap_or_default();

    STRIPE_API_SECRET.with(|s| {
        *s.borrow_mut() = api_secret;
    });

    STRIPE_WEBHOOK_SECRET.with(|s| {
        *s.borrow_mut() = webhook_secret;
    });

    println!("Post-upgrade: Restored state from stable memory");
}

// const ADMIN_PRINCIPAL: &str = "mgxur-7e22f-jfivc-k7fnr-mcjv3-5o2xz-mmmu5-l5lpq-g5aob-dgs7a-oae";
const ADMIN_PRINCIPAL: Principal = Principal::anonymous();

#[update]
pub fn update_stripe_api_secret(new_secret: String) -> Result<String, String> {
    if caller() != ADMIN_PRINCIPAL {
        return Err("Unauthorized: Only admin can update Stripe API secret".to_string());
    }

    STRIPE_API_SECRET.with(|secret| {
        *secret.borrow_mut() = new_secret;
    });

    Ok("Stripe API secret updated successfully".to_string())
}

#[update]
pub fn update_stripe_webhook_secret(new_secret: String) -> Result<String, String> {
    if caller() != ADMIN_PRINCIPAL {
        return Err("Unauthorized: Only admin can update Stripe webhook secret".to_string());
    }

    STRIPE_WEBHOOK_SECRET.with(|secret| {
        *secret.borrow_mut() = new_secret;
    });

    Ok("Stripe webhook secret updated successfully".to_string())
}

pub fn get_user_balance(user: &Principal) -> UserBalance {
    USER_BALANCES.with(|balances| {
        let balances = balances.borrow();
        balances.get(user).unwrap_or_default()
    })
}

pub fn update_user_balance<F>(user: &Principal, updater: F) -> UserBalance
where
    F: FnOnce(&mut UserBalance),
{
    USER_BALANCES.with(|balances| {
        let mut balances = balances.borrow_mut();
        let mut user_balance = balances.get(user).unwrap_or_default();
        updater(&mut user_balance);
        user_balance.last_updated = ic_cdk::api::time();
        balances.insert(*user, user_balance.clone());
        user_balance
    })
}

pub fn get_stripe_api_secret() -> String {
    STRIPE_API_SECRET.with(|secret| secret.borrow().clone())
}

pub fn get_stripe_webhook_secret() -> String {
    STRIPE_WEBHOOK_SECRET.with(|secret| secret.borrow().clone())
}