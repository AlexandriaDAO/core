use ic_cdk;
use candid::{Principal, Nat, CandidType, Deserialize};
use serde::Serialize;
use std::cell::RefCell;
use ic_stable_structures::{StableBTreeMap, memory_manager::{MemoryManager, MemoryId}, DefaultMemoryImpl, Storable};
use std::borrow::Cow;

mod nft_users;
pub use nft_users::{UserNFTInfo, get_stored_nft_users};

pub const ICRC7_CANISTER_ID: &str = "53ewn-qqaaa-aaaap-qkmqq-cai";
pub const ICRC7_SCION_CANISTER_ID: &str = "uxyan-oyaaa-aaaap-qhezq-cai";
pub const USER_CANISTER_ID: &str = "yo4hu-nqaaa-aaaap-qkmoq-cai";
pub const ALEX_TOKEN_CANISTER_ID: &str = "ysy5f-2qaaa-aaaap-qkmmq-cai";

// Memory management for stable storage
type Memory = ic_stable_structures::memory_manager::VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );
    
    // Use a higher memory ID to avoid conflicts with existing memory usage
    static TOKEN_SUPPLY_CACHE: RefCell<StableBTreeMap<u8, CachedTokenSupply, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(10)))
        )
    );
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
struct CachedTokenSupply {
    circulating_supply: String,
    total_supply: String,
    last_updated: u64,
}

impl Storable for CachedTokenSupply {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 256,
        is_fixed_size: false,
    };
}

pub fn get_principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

pub fn icrc7_principal() -> Principal {
    get_principal(ICRC7_CANISTER_ID)
}

pub fn icrc7_scion_principal() -> Principal {
    get_principal(ICRC7_SCION_CANISTER_ID)
}

pub fn user_principal() -> Principal {
    get_principal(USER_CANISTER_ID)
}

pub fn alex_token_principal() -> Principal {
    get_principal(ALEX_TOKEN_CANISTER_ID)
}

#[derive(CandidType, Deserialize)]
pub struct HttpRequest {
    pub url: String,
    pub method: String,
    pub body: Vec<u8>,
    pub headers: Vec<(String, String)>,
}

#[derive(CandidType, Serialize)]
pub struct HttpResponse {
    pub body: Vec<u8>,
    pub headers: Vec<(String, String)>,
    pub status_code: u16,
}

#[derive(Serialize)]
struct TokenSupplyResponse {
    circulating_supply: String,
    total_supply: String,
}

// Query call that returns cached data
#[ic_cdk::query]
fn http_request(req: HttpRequest) -> HttpResponse {
    let parts: Vec<&str> = req.url.split('/').collect();
    
    if parts.len() >= 4 && parts[1] == "api" && parts[2] == "supply" && parts[3] == "alex" {
        // Get cached supply data
        let cached_supply = TOKEN_SUPPLY_CACHE.with(|cache| {
            cache.borrow().get(&0u8)
        });
        
        match cached_supply {
            Some(supply) => {
                let response = TokenSupplyResponse {
                    circulating_supply: supply.circulating_supply,
                    total_supply: supply.total_supply,
                };
                
                let json_body = serde_json::to_string(&response).unwrap_or_else(|_| 
                    r#"{"error": "Failed to serialize response"}"#.to_string()
                );
                
                HttpResponse {
                    body: json_body.into_bytes(),
                    headers: vec![
                        ("Content-Type".to_string(), "application/json".to_string()),
                        ("Access-Control-Allow-Origin".to_string(), "*".to_string()),
                        ("Cache-Control".to_string(), "max-age=1800".to_string()),
                        ("X-Requested-With".to_string(), "com.coingecko".to_string()),
                    ],
                    status_code: 200,
                }
            }
            None => {
                let error_body = r#"{"error": "Supply data not yet available"}"#;
                HttpResponse {
                    body: error_body.as_bytes().to_vec(),
                    headers: vec![
                        ("Content-Type".to_string(), "application/json".to_string()),
                    ],
                    status_code: 503,
                }
            }
        }
    } else {
        HttpResponse {
            body: b"Not Found".to_vec(),
            headers: vec![],
            status_code: 404,
        }
    }
}

// Update function to fetch and cache supply data
#[ic_cdk::update]
async fn update_alex_supply() -> Result<String, String> {
    let alex_canister = alex_token_principal();
    
    let result: Result<(Nat,), _> = ic_cdk::call(
        alex_canister,
        "icrc1_total_supply",
        (),
    ).await;
    
    match result {
        Ok((total_supply,)) => {
            let supply_str = total_supply.to_string();
            
            // Remove any underscores that might be in the string
            let clean_supply_str = supply_str.replace("_", "");
            
            // Format the supply with proper decimals
            let formatted_supply = if let Ok(supply_u128) = clean_supply_str.parse::<u128>() {
                let decimals = 100_000_000u128;
                let whole_part = supply_u128 / decimals;
                let fractional_part = supply_u128 % decimals;
                format!("{}.{:08}", whole_part, fractional_part)
            } else {
                // Fallback for very large numbers
                let len = clean_supply_str.len();
                if len > 8 {
                    let (whole, frac) = clean_supply_str.split_at(len - 8);
                    format!("{}.{}", whole, frac)
                } else {
                    format!("0.{:0>8}", clean_supply_str)
                }
            };
            
            // Store in cache
            let cached_data = CachedTokenSupply {
                circulating_supply: formatted_supply.clone(),
                total_supply: formatted_supply.clone(),
                last_updated: ic_cdk::api::time(),
            };
            
            TOKEN_SUPPLY_CACHE.with(|cache| {
                cache.borrow_mut().insert(0u8, cached_data);
            });
            
            Ok(formatted_supply)
        }
        Err(e) => Err(format!("Failed to fetch supply: {:?}", e)),
    }
}

// Timer callback to update supply every 24 hours
fn update_supply_timer() {
    ic_cdk::spawn(async {
        match update_alex_supply().await {
            Ok(supply) => ic_cdk::println!("Successfully updated ALEX token supply: {}", supply),
            Err(e) => ic_cdk::println!("Failed to update ALEX token supply: {}", e),
        }
    });
}

// Manual function to start the ALEX token supply timer
// Can be called by canister controllers after deployment
#[ic_cdk::update]
pub fn start_alex_supply_timer() -> Result<String, String> {
    // Set up timer to update supply every 24 hours
    let interval = std::time::Duration::from_secs(24 * 60 * 60); // 24 hours
    ic_cdk_timers::set_timer_interval(interval, update_supply_timer);
    
    // Do an immediate update
    ic_cdk::spawn(async {
        match update_alex_supply().await {
            Ok(supply) => ic_cdk::println!("Initial ALEX token supply fetch: {}", supply),
            Err(e) => ic_cdk::println!("Failed initial ALEX token supply fetch: {}", e),
        }
    });
    
    Ok("ALEX token supply timer started. Will update every 24 hours.".to_string())
}

ic_cdk::export_candid!();


