use candid::{Nat, Principal};
use ic_cdk::api::call::CallResult;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};

use crate::guard::not_anon;
use crate::id_converter::principal_to_subaccount;
use crate::{lbry_principal, kairos_principal};

#[ic_cdk::update(guard = "not_anon")]
pub async fn withdraw_topup() -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    let balance = get_topup_balance(caller).await?;
    
    if balance == Nat::from(0u64) {
        return Err("No balance to withdraw".to_string());
    }

    let fee = Nat::from(4000000u64);
    
    if balance <= fee {
        return Err("Balance too low to cover transfer fee".to_string());
    }

    let transfer_amount = balance.clone() - fee.clone();
    
    let transfer_arg = TransferArg {
        to: Account {
            owner: caller,
            subaccount: None,
        },
        fee: Some(fee),
        memo: None,
        from_subaccount: Some(principal_to_subaccount(caller)),
        created_at_time: None,
        amount: transfer_amount.clone(),
    };

    let transfer_result: CallResult<(Result<Nat, TransferError>,)> = ic_cdk::call(
        lbry_principal(),
        "icrc1_transfer",
        (transfer_arg,),
    ).await;

    match transfer_result {
        Ok((Ok(_block_index),)) => {
            Ok(format!("Successfully withdrew {} LBRY tokens", balance))
        },
        Ok((Err(e),)) => {
            Err(format!("LBRY transfer failed: {:?}", e))
        },
        Err((code, msg)) => {
            Err(format!("Error calling LBRY canister: {:?} - {}", code, msg))
        },
    }
}

pub async fn get_topup_balance(principal: Principal) -> Result<Nat, String> {
    let account = Account {
        owner: ic_cdk::id(),
        subaccount: Some(principal_to_subaccount(principal)),
    };

    let balance_result: CallResult<(Nat,)> = ic_cdk::call(
        lbry_principal(),
        "icrc1_balance_of",
        (account,),
    ).await;

    match balance_result {
        Ok((balance,)) => Ok(balance),
        Err((code, msg)) => Err(format!("Error fetching balance: {:?} - {}", code, msg)),
    }
}
