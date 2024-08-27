use crate::{icrc7_principal, lbry_principal, alex_principal};
use crate::utils::to_nft_subaccount;
use crate::query::get_nft_balances;

use candid::Nat;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{BlockIndex, NumTokens, TransferArg, TransferError};


#[ic_cdk::update]
pub async fn withdraw(mint_number: Nat) -> Result<(Option<BlockIndex>, Option<BlockIndex>), String> {
    let caller = ic_cdk::api::caller();

    // Ensure caller owns the NFT
    let ownership_result = ic_cdk::call::<(Vec<Nat>,), (Vec<Option<Account>>,)>(
        icrc7_principal(),
        "icrc7_owner_of",
        (vec![mint_number.clone()],),
    )
    .await
    .map_err(|e| format!("Failed to call icrc7_owner_of: {:?}", e))?;

    let owner = ownership_result.0.get(0)
    .ok_or("No ownership information returned")?
    .as_ref()
    .ok_or("NFT not found")?;

    if owner.owner != caller {
        return Err("Caller is not the owner of the NFT".to_string());
    }

    let balances = get_nft_balances(mint_number.clone()).await?;

    // NFT wallet subaccount
    let subaccount = Some(to_nft_subaccount(mint_number.clone()));
    let to_account = Account {
        owner: caller,
        subaccount: None,
    };

    let mut lbry_result = None;
    let mut alex_result = None;

    // Check and transfer LBRY if sufficient
    if balances.lbry >= NumTokens::from(10_000_000u64) {
        let lbry_transfer_args = TransferArg {
            memo: None,
            amount: balances.lbry.clone(),
            from_subaccount: subaccount,
            fee: None,
            to: to_account.clone(),
            created_at_time: None,
        };

        // Withdraw LBRY
        match ic_cdk::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
            lbry_principal(),
            "icrc1_transfer",
            (lbry_transfer_args,),
        )
        .await
        {
            Ok((Ok(block_index),)) => {
                lbry_result = Some(block_index);
                ic_cdk::println!("Transferred {} LBRY from NFT# {} to {}", balances.lbry, mint_number, caller);
            }
            Ok((Err(e),)) => ic_cdk::println!("LBRY ledger transfer error: {:?}", e),
            Err(e) => ic_cdk::println!("Failed to call LBRY ledger: {:?}", e),
        }
    } else {
        ic_cdk::println!("LBRY balance ({}) is not enough to justify the transaction fee.", balances.lbry);
    }

    // Check and transfer ALEX if sufficient
    if balances.alex >= NumTokens::from(100_000u64) {
        let alex_transfer_args = TransferArg {
            memo: None,
            amount: balances.alex.clone(),
            from_subaccount: subaccount,
            fee: None,
            to: to_account,
            created_at_time: None,
        };

        // Withdraw ALEX
        match ic_cdk::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
            alex_principal(),
            "icrc1_transfer",
            (alex_transfer_args,),
        )
        .await
        {
            Ok((Ok(block_index),)) => {
                alex_result = Some(block_index);
                ic_cdk::println!("Transferred {} ALEX from NFT# {} to {}", balances.alex, mint_number, caller);
            }
            Ok((Err(e),)) => ic_cdk::println!("ALEX ledger transfer error: {:?}", e),
            Err(e) => ic_cdk::println!("Failed to call ALEX ledger: {:?}", e),
        }
    } else {
        ic_cdk::println!("ALEX balance ({}) is not enough to justify the transaction fee.", balances.alex);
    }

    if lbry_result.is_none() && alex_result.is_none() {
        Err("No transfers were executed due to insufficient balances".to_string())
    } else {
        Ok((lbry_result, alex_result))
    }
}