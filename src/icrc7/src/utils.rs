use candid::Principal;
use icrc_ledger_types::icrc::generic_value::{self, Value};
use icrc_ledger_types::icrc1::account::{Account, Subaccount, DEFAULT_SUBACCOUNT};

pub fn account_transformer(account: Account) -> Account {
    if let Some(_) = account.subaccount {
        account
    } else {
        Account {
            owner: account.owner,
            subaccount: Some(DEFAULT_SUBACCOUNT.clone()),
        }
    }
}

pub fn default_account(owner: &Principal) -> Account {
    Account {
        owner: owner.clone(),
        subaccount: Some(DEFAULT_SUBACCOUNT.clone()),
    }
}

pub fn burn_subaccount() -> Subaccount {
    let mut bytes = [0; 32];
    let slice = b"BURN SUBACCOUNT";
    bytes[0..15].copy_from_slice(slice);
    bytes
}

pub fn burn_account() -> Account {
    Account {
        owner: ic_cdk::api::id(),
        subaccount: Some(burn_subaccount()),
    }
}

pub fn hash_icrc_value(value: &Value) -> generic_value::Hash {
    return value.hash();
}
