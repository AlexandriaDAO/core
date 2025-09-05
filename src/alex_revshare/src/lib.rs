use candid::{CandidType, Deserialize, Principal, Nat};
use ic_cdk::{init, post_upgrade, update, query};
use ic_cdk_timers::set_timer_interval;
use std::cell::RefCell;
use std::collections::HashMap;
use std::time::Duration;

// Constants
const MIN_ICP_BALANCE: u64 = 100_000_000;  // 1 ICP minimum to trigger swap
const ICP_FEE: u64 = 10_000;               // 0.0001 ICP transaction fee
const CHECK_INTERVAL: u64 = 3600;          // Check every hour
const BATCH_THRESHOLD: u64 = 500_000_000;  // 5 ICP - batch swaps when this much accumulates

// Canister IDs
const ICP_LEDGER: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";
const LBRY_CANISTER: &str = "y33wz-myaaa-aaaap-qkmna-cai";
const CORE_ICP_SWAP: &str = "54fqz-5iaaa-aaaap-qkmqa-cai";
const LBRY_BURN_ADDRESS: &str = "54fqz-5iaaa-aaaap-qkmqa-cai"; // Minting account = burn

// Types
#[derive(CandidType, Deserialize, Clone)]
pub struct Account {
    pub owner: Principal,
    pub subaccount: Option<[u8; 32]>,
}

#[derive(CandidType, Deserialize)]
pub struct TransferArgs {
    pub from_subaccount: Option<[u8; 32]>,
    pub to: Account,
    pub amount: Nat,
    pub fee: Option<Nat>,
    pub memo: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum TransferError {
    BadFee { expected_fee: Nat },
    BadBurn { min_burn_amount: Nat },
    InsufficientFunds { balance: Nat },
    TooOld,
    CreatedInFuture { ledger_time: u64 },
    Duplicate { duplicate_of: Nat },
    TemporarilyUnavailable,
    GenericError { error_code: Nat, message: String },
}

#[derive(CandidType, Deserialize)]
pub struct ProjectDeposit {
    pub project_id: Principal,
    pub amount: u64,
    pub timestamp: u64,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct ProjectStats {
    pub total_deposited: u64,
    pub total_swapped: u64,
    pub deposit_count: u32,
    pub last_deposit: u64,
}

#[derive(CandidType, Deserialize)]
pub struct GlobalStats {
    pub total_icp_received: u64,
    pub total_icp_swapped: u64,
    pub total_lbry_burned: u64,
    pub pending_icp: u64,
    pub project_count: u32,
    pub last_swap_time: u64,
    pub last_burn_time: u64,
}

// State
thread_local! {
    static PROJECT_STATS: RefCell<HashMap<Principal, ProjectStats>> = RefCell::new(HashMap::new());
    static PENDING_ICP: RefCell<u64> = RefCell::new(0);
    static TOTAL_ICP_RECEIVED: RefCell<u64> = RefCell::new(0);
    static TOTAL_ICP_SWAPPED: RefCell<u64> = RefCell::new(0);
    static TOTAL_LBRY_BURNED: RefCell<u64> = RefCell::new(0);
    static LAST_SWAP_TIME: RefCell<u64> = RefCell::new(0);
    static LAST_BURN_TIME: RefCell<u64> = RefCell::new(0);
}

// Initialize and set up timer
#[init]
fn init() {
    setup_timer();
    ic_cdk::print("Alex RevShare service initialized");
}

#[post_upgrade]
fn post_upgrade() {
    setup_timer();
    ic_cdk::print("Alex RevShare service upgraded - timer restarted");
}

fn setup_timer() {
    set_timer_interval(
        Duration::from_secs(CHECK_INTERVAL),
        || {
            ic_cdk::spawn(async {
                let _ = process_revenue().await;
            });
        }
    );
}

// Track deposits - projects should transfer ICP directly via ICRC-1
// This function just records who sent funds for tracking purposes
#[update]
pub async fn notify_deposit(amount: u64) -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    // Track the deposit by caller
    PROJECT_STATS.with(|stats| {
        let mut stats = stats.borrow_mut();
        let project = stats.entry(caller).or_insert(ProjectStats {
            total_deposited: 0,
            total_swapped: 0,
            deposit_count: 0,
            last_deposit: 0,
        });
        
        project.total_deposited += amount;
        project.deposit_count += 1;
        project.last_deposit = ic_cdk::api::time();
    });
    
    // Update total received
    TOTAL_ICP_RECEIVED.with(|t| {
        *t.borrow_mut() += amount;
    });
    
    // Check current balance to update pending
    let icp_balance = get_icp_balance().await?;
    PENDING_ICP.with(|p| {
        *p.borrow_mut() = icp_balance;
    });
    
    Ok(format!("Deposit of {} ICP recorded for {}", amount / 100_000_000, caller))
}

// Internal function - only called by timer, not exposed publicly
async fn process_revenue() -> Result<String, String> {
    ic_cdk::println!("REVSHARE: Processing accumulated revenue...");
    
    let balance = get_icp_balance().await?;
    
    if balance < MIN_ICP_BALANCE {
        return Ok(format!("Balance {} below minimum {}", balance, MIN_ICP_BALANCE));
    }
    
    // Swap ICP for LBRY
    let swap_amount = balance - ICP_FEE * 2; // Keep some for fees
    let _lbry_received = swap_icp_for_lbry(swap_amount).await?;
    
    // Update stats
    TOTAL_ICP_SWAPPED.with(|t| *t.borrow_mut() += swap_amount);
    LAST_SWAP_TIME.with(|t| *t.borrow_mut() = ic_cdk::api::time());
    PENDING_ICP.with(|p| *p.borrow_mut() = 0);
    
    // Burn all LBRY
    let burned = burn_all_lbry().await?;
    
    TOTAL_LBRY_BURNED.with(|t| *t.borrow_mut() += burned);
    LAST_BURN_TIME.with(|t| *t.borrow_mut() = ic_cdk::api::time());
    
    Ok(format!("Swapped {} ICP and burned {} LBRY", swap_amount / 100_000_000, burned))
}

// Get current ICP balance
async fn get_icp_balance() -> Result<u64, String> {
    let ledger = Principal::from_text(ICP_LEDGER).unwrap();
    let account = Account {
        owner: ic_cdk::id(),
        subaccount: None,
    };
    
    let result: Result<(Nat,), _> = ic_cdk::call(
        ledger,
        "icrc1_balance_of",
        (account,)
    ).await;
    
    match result {
        Ok((balance,)) => {
            let balance_str = balance.to_string();
            Ok(balance_str.parse::<u64>().unwrap_or(0))
        }
        Err(e) => Err(format!("Failed to get balance: {:?}", e))
    }
}

// Swap ICP for LBRY using core swap canister
async fn swap_icp_for_lbry(amount: u64) -> Result<u64, String> {
    let swap_canister = Principal::from_text(CORE_ICP_SWAP).unwrap();
    let icp_ledger = Principal::from_text(ICP_LEDGER).unwrap();
    
    // First approve the swap canister to spend our ICP
    let approve_args = TransferArgs {
        from_subaccount: None,
        to: Account { 
            owner: swap_canister, 
            subaccount: None 
        },
        amount: Nat::from(amount + ICP_FEE),
        fee: Some(Nat::from(ICP_FEE)),
        memo: None,
        created_at_time: None,
    };
    
    let approve_result: Result<(Result<Nat, TransferError>,), _> = ic_cdk::call(
        icp_ledger,
        "icrc2_approve",
        (approve_args,)
    ).await;
    
    match approve_result {
        Ok((Ok(_),)) => {
            ic_cdk::println!("Approved swap canister to spend {} ICP", amount / 100_000_000);
        }
        Ok((Err(e),)) => return Err(format!("Approval failed: {:?}", e)),
        Err(e) => return Err(format!("Approval call failed: {:?}", e)),
    }
    
    // Call swap function
    let swap_result: Result<(String,), _> = ic_cdk::call(
        swap_canister,
        "swap",
        (amount, None::<[u8; 32]>)
    ).await;
    
    match swap_result {
        Ok((msg,)) => {
            ic_cdk::println!("Swap successful: {}", msg);
            
            // Check LBRY balance to see what we received
            let lbry_balance = get_lbry_balance().await?;
            Ok(lbry_balance)
        }
        Err(e) => Err(format!("Swap failed: {:?}", e))
    }
}

// Get LBRY balance
async fn get_lbry_balance() -> Result<u64, String> {
    let lbry = Principal::from_text(LBRY_CANISTER).unwrap();
    let account = Account {
        owner: ic_cdk::id(),
        subaccount: None,
    };
    
    let result: Result<(Nat,), _> = ic_cdk::call(
        lbry,
        "icrc1_balance_of",
        (account,)
    ).await;
    
    match result {
        Ok((balance,)) => {
            let balance_str = balance.to_string();
            Ok(balance_str.parse::<u64>().unwrap_or(0))
        }
        Err(e) => Err(format!("Failed to get LBRY balance: {:?}", e))
    }
}

// Burn all LBRY tokens
async fn burn_all_lbry() -> Result<u64, String> {
    let lbry_balance = get_lbry_balance().await?;
    
    if lbry_balance == 0 {
        return Ok(0);
    }
    
    let lbry = Principal::from_text(LBRY_CANISTER).unwrap();
    let burn_address = Principal::from_text(LBRY_BURN_ADDRESS).unwrap();
    
    let transfer_args = TransferArgs {
        from_subaccount: None,
        to: Account {
            owner: burn_address,
            subaccount: None,
        },
        amount: Nat::from(lbry_balance),
        fee: None,
        memo: None,
        created_at_time: None,
    };
    
    let result: Result<(Result<Nat, TransferError>,), _> = ic_cdk::call(
        lbry,
        "icrc1_transfer",
        (transfer_args,)
    ).await;
    
    match result {
        Ok((Ok(_),)) => {
            ic_cdk::println!("Burned {} LBRY tokens", lbry_balance);
            Ok(lbry_balance)
        }
        Ok((Err(e),)) => Err(format!("Burn transfer failed: {:?}", e)),
        Err(e) => Err(format!("Burn call failed: {:?}", e))
    }
}

// Query functions
#[query]
pub fn get_global_stats() -> GlobalStats {
    GlobalStats {
        total_icp_received: TOTAL_ICP_RECEIVED.with(|t| *t.borrow()),
        total_icp_swapped: TOTAL_ICP_SWAPPED.with(|t| *t.borrow()),
        total_lbry_burned: TOTAL_LBRY_BURNED.with(|t| *t.borrow()),
        pending_icp: PENDING_ICP.with(|p| *p.borrow()),
        project_count: PROJECT_STATS.with(|s| s.borrow().len() as u32),
        last_swap_time: LAST_SWAP_TIME.with(|t| *t.borrow()),
        last_burn_time: LAST_BURN_TIME.with(|t| *t.borrow()),
    }
}

#[query]
pub fn get_project_stats(project_id: Principal) -> Option<ProjectStats> {
    PROJECT_STATS.with(|stats| {
        stats.borrow().get(&project_id).cloned()
    })
}

#[query]
pub fn get_all_project_stats() -> Vec<(Principal, ProjectStats)> {
    PROJECT_STATS.with(|stats| {
        stats.borrow().iter()
            .map(|(k, v)| (*k, v.clone()))
            .collect()
    })
}

// Export candid
ic_cdk::export_candid!();