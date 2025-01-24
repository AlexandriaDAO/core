use candid::{CandidType, Principal};
use serde::Deserialize;

pub const LBRY_CANISTER_ID: &str = "y33wz-myaaa-aaaap-qkmna-cai";
pub const ASSET_CANISTER_FEE: u64 = 100_000_000;  //1 LBRY



#[derive(Clone, Debug, CandidType, Deserialize)]
pub enum Permission {
    Prepare,
    ManagePermissions,
    Commit,
}


#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct GrantPermissionArguments {
    pub permission: Permission,       // Permission type
    pub to_principal: Principal,      // The principal to whom the permission is granted
}