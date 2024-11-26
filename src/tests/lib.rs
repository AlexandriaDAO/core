use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use ic_cdk::{query, update};

pub const ICP_SWAP: &str = "54fqz-5iaaa-aaaap-qkmqa-cai";
pub const TOKENOMICS: &str = "5sh5r-gyaaa-aaaap-qkmra-cai";
pub const MAINNET_LEDGER_CANISTER_ID: Principal = Principal::from_slice(&[0]); // Replace with actual ID

// Mock user principals
const ALICE_PRINCIPAL: &str = "y2weh-ihng6-rprub-vcuup-kejnv-4ekaf-2uhvg-3m3l5-kx7rt-hcxzr-oqe";  // Test user 1
const BOB_PRINCIPAL: &str = "n6qc2-zcayn-kjnwe-glmwn-ectuw-xau6y-sih7l-wh3kl-2nt33-mxpfl-jae";  // Test user 2  
const CHARLIE_PRINCIPAL: &str = "dlahm-6ddl4-jqtgp-kgyby-7vega-xcrbl-sv42z-q5vdc-qoqo5-if7y2-nqe";  // Test user 3

#[query]
fn get_mock_user() -> Principal {
    Principal::from_text(ALICE_PRINCIPAL).unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_setup() {
        assert!(true, "Basic test passed!");
        
        // Test that we can parse one of our mock principals
        let alice = Principal::from_text(ALICE_PRINCIPAL).unwrap();
        assert!(alice.to_text() == ALICE_PRINCIPAL);
    }
}



ic_cdk::export_candid!();
