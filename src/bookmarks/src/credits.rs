// // Component where users send ICP and buy credits.
// use candid::Principal;
// use ic_cdk::api::caller;


// #[ic_cdk_macros::query]
// pub fn whoami() -> Principal {
//     let principal_from_caller: Principal = caller();
//     principal_from_caller
// }
use candid::{CandidType, Deserialize, Principal};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::{borrow::Cow, cell::RefCell};

type Memory = VirtualMemory<DefaultMemoryImpl>;

const MAX_BALANCE_STORE_SIZE: u32 = 50000;
const EXCHANGE_RATE: u64 = 2000; // 20 credits per 0.01 ICP

#[derive(CandidType, Deserialize)]
struct UserBalance {
    credit_balance: u64,
}

impl Storable for UserBalance {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_BALANCE_STORE_SIZE,
        is_fixed_size: false,
    };
}

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
struct StorablePrincipal(Principal);

impl Storable for StorablePrincipal {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(self.0.to_text().as_bytes().to_vec())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        StorablePrincipal(Principal::from_text(String::from_utf8(bytes.to_vec()).unwrap()).unwrap())
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 64,
        is_fixed_size: true,
    };
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static BALANCE_STORE: RefCell<StableBTreeMap<StorablePrincipal, UserBalance, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );
}

#[ic_cdk_macros::update]
pub fn deposit_icp(user_principal: Principal, icp_amount: u64) -> Result<(), String> {
    let cycles_received = ic_cdk::api::call::msg_cycles_available();
    let icp_received = cycles_received / 100_000_000; // Convert cycles to ICP (1 ICP = 100,000,000 cycles)

    if icp_received != icp_amount {
        return Err(format!(
            "Incorrect ICP amount received. Expected: {}, Received: {}",
            icp_amount, icp_received
        ));
    }

    let credits_to_mint = icp_amount * EXCHANGE_RATE;

    BALANCE_STORE.with(|balance_store| {
        let mut balance_store = balance_store.borrow_mut();
        let storable_principal = StorablePrincipal(user_principal);

        let updated_balance = balance_store
            .remove(&storable_principal)
            .map(|balance| UserBalance {
                credit_balance: balance.credit_balance + credits_to_mint,
            })
            .unwrap_or_else(|| UserBalance {
                credit_balance: credits_to_mint,
            });

        balance_store.insert(storable_principal, updated_balance);
    });

    Ok(())
}




#[ic_cdk_macros::query]
pub fn get_credit_balance(user_principal: Principal) -> u64 {
    BALANCE_STORE.with(|balance_store| {
        balance_store
            .borrow()
            .get(&StorablePrincipal(user_principal))
            .map(|balance| balance.credit_balance)
            .unwrap_or(0)
    })
}