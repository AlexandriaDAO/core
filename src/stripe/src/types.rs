use candid::{CandidType, Deserialize};
use ic_stable_structures::{storable::Bound, Storable};

#[derive(CandidType, Deserialize)]
pub struct HttpRequest {
    pub method: String,
    pub url: String,
    pub headers: Vec<(String, String)>,
    pub body: Vec<u8>,
}

#[derive(CandidType)]
pub struct HttpResponse {
    pub status_code: u16,
    pub headers: Vec<(String, String)>,
    pub body: Vec<u8>,
    pub upgrade: Option<bool>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct UserBalance {
    pub balance: u64, // Balance in cents (USD)
    pub last_updated: u64,
    pub total_deposits: u64,
    pub deposit_count: u32,
}

impl Default for UserBalance {
    fn default() -> Self {
        Self {
            balance: 0,
            last_updated: 0,
            total_deposits: 0,
            deposit_count: 0,
        }
    }
}

impl Storable for UserBalance {
    const BOUND: Bound = Bound::Bounded {
        max_size: 100,
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        std::borrow::Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}
