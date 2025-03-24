// This canister is not currently active, and likely not needed.

use ic_cdk::query;
use candid::Principal;


pub const ALEX: &str = "ysy5f-2qaaa-aaaap-qkmmq-cai";
pub const LBRY: &str = "y33wz-myaaa-aaaap-qkmna-cai";
pub const ALEX_BACKEND: &str = "y42qn-baaaa-aaaap-qkmnq-cai";
pub const ALEX_FRONTEND: &str = "yj5ba-aiaaa-aaaap-qkmoa-cai";
pub const USER: &str = "yo4hu-nqaaa-aaaap-qkmoq-cai";
pub const ALEX_WALLET: &str = "yh7mi-3yaaa-aaaap-qkmpa-cai";
pub const PERPETUA: &str = "ya6k4-waaaa-aaaap-qkmpq-cai";
pub const ICP_LEDGER: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";
pub const ICP_SWAP: &str = "54fqz-5iaaa-aaaap-qkmqa-cai";
pub const ICRC7: &str = "53ewn-qqaaa-aaaap-qkmqq-cai";
pub const ICRC7_SCION: &str = "53ewn-qqaaa-aaaap-qkmqq-cai";
pub const INTERNET_IDENTITY: &str = "rdmx6-jaaaa-aaaaa-aaadq-cai";
pub const NFT_MANAGER: &str = "5sh5r-gyaaa-aaaap-qkmra-cai";
pub const SYSTEM_API: &str = "5vg3f-laaaa-aaaap-qkmrq-cai";
pub const TOKENOMICS: &str = "5abki-kiaaa-aaaap-qkmsa-cai";
pub const VETKD: &str = "5ham4-hqaaa-aaaap-qkmsq-cai";
pub const XRC: &str = "uf6dk-hyaaa-aaaaq-qaaaq-cai";

#[query]
pub fn get_registry_principal(canister_name: String) -> Principal {
    match canister_name.as_str() {
        "ALEX" => get_principal(ALEX),
        "LBRY" => get_principal(LBRY),
        "ALEX_BACKEND" => get_principal(ALEX_BACKEND),
        "ALEX_FRONTEND" => get_principal(ALEX_FRONTEND),
        "USER" => get_principal(USER),
        "ALEX_WALLET" => get_principal(ALEX_WALLET),
        "PERPETUA" => get_principal(PERPETUA),
        "ICP_LEDGER" => get_principal(ICP_LEDGER),
        "ICP_SWAP" => get_principal(ICP_SWAP),
        "ICRC7" => get_principal(ICRC7),
        "ICRC7_SCION" => get_principal(ICRC7_SCION),
        "INTERNET_IDENTITY" => get_principal(INTERNET_IDENTITY),
        "NFT_MANAGER" => get_principal(NFT_MANAGER),
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

