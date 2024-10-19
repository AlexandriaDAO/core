use ic_cdk::query;
use candid::Principal;


pub const ALEX: &str = "7hcrm-4iaaa-aaaak-akuka-cai";
pub const LBRY: &str = "hdtfn-naaaa-aaaam-aciva-cai";
pub const ALEX_BACKEND: &str = "xj2l7-vyaaa-aaaap-abl4a-cai";
pub const ALEX_FRONTEND: &str = "xo3nl-yaaaa-aaaap-abl4q-cai";
pub const ALEX_LIBRARIAN: &str = "rby3s-dqaaa-aaaak-qizqa-cai";
pub const ALEX_WALLET: &str = "ju4sh-3yaaa-aaaap-ahapa-cai";
pub const BOOKMARKS: &str = "sklez-7aaaa-aaaan-qlrva-cai";
pub const ICP_LEDGER: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";
pub const ICP_SWAP: &str = "5qx27-tyaaa-aaaal-qjafa-cai";
pub const ICRC7: &str = "fjqb7-6qaaa-aaaak-qc7gq-cai";
pub const INTERNET_IDENTITY: &str = "rdmx6-jaaaa-aaaaa-aaadq-cai";
pub const NFT_MANAGER: &str = "forhl-tiaaa-aaaak-qc7ga-cai";
pub const REGISTRY: &str = "uxyan-oyaaa-aaaap-qhezq-cai";
pub const SYSTEM_API: &str = "xhfe4-aqaaa-aaaak-akv4q-cai";
pub const TOKENOMICS: &str = "chddw-rqaaa-aaaao-qevqq-cai";
pub const VETKD: &str = "fzemm-saaaa-aaaan-qlsla-cai";
pub const XRC: &str = "uf6dk-hyaaa-aaaaq-qaaaq-cai";

#[query]
pub fn get_registry_principal(canister_name: String) -> Principal {
    match canister_name.as_str() {
        "ALEX" => get_principal(ALEX),
        "LBRY" => get_principal(LBRY),
        "ALEX_BACKEND" => get_principal(ALEX_BACKEND),
        "ALEX_FRONTEND" => get_principal(ALEX_FRONTEND),
        "ALEX_LIBRARIAN" => get_principal(ALEX_LIBRARIAN),
        "ALEX_WALLET" => get_principal(ALEX_WALLET),
        "BOOKMARKS" => get_principal(BOOKMARKS),
        "ICP_LEDGER" => get_principal(ICP_LEDGER),
        "ICP_SWAP" => get_principal(ICP_SWAP),
        "ICRC7" => get_principal(ICRC7),
        "INTERNET_IDENTITY" => get_principal(INTERNET_IDENTITY),
        "NFT_MANAGER" => get_principal(NFT_MANAGER),
        "REGISTRY" => get_principal(REGISTRY),
        "SYSTEM_API" => get_principal(SYSTEM_API),
        "TOKENOMICS" => get_principal(TOKENOMICS),
        "VETKD" => get_principal(VETKD),
        "XRC" => get_principal(XRC),
        _ => panic!("Unknown canister name: {}", canister_name),
    }
}


fn get_principal(id: &str) -> Principal {
  Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

ic_cdk::export_candid!();

