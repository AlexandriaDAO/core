// I'm going to have to think about how to handle the mint# issue. it's cool if you can choose, and it'd reduce conflicts, but it currently leaves gaps in the 'current_count' and I'm not to thrilled with how we do it now anyway.
// Will work in a solution where we don't run into concurrency issues as lots of people mint NFTs at once.
// Also need to ensure the mint# never changes, otherwise the money will get left behind.

// Do the withdraw all, so whatever nfts you have associated with a principal, they all get dispersed at once.



// Need to add a guard on the withdraw function so only the owner can call it.
// Need to add a gaurd on the withdraw function so that only verified NFTs will withdraw.










use candid::{CandidType, Deserialize, Nat, Principal};
use icrc_ledger_types::icrc1::account::{Account, Subaccount};
use icrc_ledger_types::icrc1::transfer::{BlockIndex, NumTokens, TransferArg, TransferError};
use serde::Serialize;

#[derive(CandidType, Deserialize, Serialize)]
pub struct TransferArgs {
    mint_number: Nat,
    to_account: Account,
}

#[derive(CandidType, Deserialize, Serialize)]
pub struct TokenBalances {
    lbry: NumTokens,
    alex: NumTokens,
}

const LBRY_FEE: u64 = 4_000_000;
const ALEX_FEE: u64 = 10_000;

const ICRC7_CANISTER_ID: &str = "fjqb7-6qaaa-aaaak-qc7gq-cai";
const LBRY_CANISTER_ID: &str = "hdtfn-naaaa-aaaam-aciva-cai";
const ALEX_CANISTER_ID: &str = "7hcrm-4iaaa-aaaak-akuka-cai";

// Function to retrieve token balances
#[ic_cdk::update]
pub async fn get_token_balances(mint_number: Nat) -> Result<TokenBalances, String> {
    let account = Account {
        owner: ic_cdk::id(),
        subaccount: Some(to_subaccount(mint_number)),
    };

    // Get the LBRY balance
    let lbry_balance = ic_cdk::call::<(Account,), (NumTokens,)>(
        principal(LBRY_CANISTER_ID),
        "icrc1_balance_of",
        (account,),
    )
    .await
    .map_err(|e| format!("Failed to get LBRY balance: {:?}", e))?
    .0;

    // Get the ALEX balance
    let alex_balance = ic_cdk::call::<(Account,), (NumTokens,)>(
        principal(ALEX_CANISTER_ID),
        "icrc1_balance_of",
        (account,),
    )
    .await
    .map_err(|e| format!("Failed to get ALEX balance: {:?}", e))?
    .0;

    let lbry_fee = NumTokens::from(LBRY_FEE);
    let alex_fee = NumTokens::from(ALEX_FEE);

    Ok(TokenBalances {
        lbry: if lbry_balance > lbry_fee { lbry_balance - lbry_fee } else { NumTokens::from(0u64) },
        alex: if alex_balance > alex_fee { alex_balance - alex_fee } else { NumTokens::from(0u64) },
    })
}

#[ic_cdk::update]
pub async fn withdraw(mint_number: Nat) -> Result<(Option<BlockIndex>, Option<BlockIndex>), String> {
    let caller = ic_cdk::api::caller();

    // Ensure caller owns the NFT
    let ownership_result = ic_cdk::call::<(Vec<Nat>,), (Vec<Option<Account>>,)>(
        principal(ICRC7_CANISTER_ID),
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

    let balances = get_token_balances(mint_number.clone()).await?;

    // NFT wallet subaccount
    let subaccount = Some(to_subaccount(mint_number.clone()));
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
            principal(LBRY_CANISTER_ID),
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
            principal(ALEX_CANISTER_ID),
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
































// Helper Functions
pub fn to_subaccount(id: Nat) -> Subaccount {
    let mut subaccount = [0; 32];
    let digits: Vec<u8> = id
        .0
        .to_string()
        .chars()
        .map(|c| c.to_digit(10).unwrap() as u8)
        .collect();
    
    let start = 32 - digits.len().min(32);
    subaccount[start..].copy_from_slice(&digits[digits.len().saturating_sub(32)..]);

    // Log the generated subaccount
    ic_cdk::println!("Generated subaccount: {:?}", subaccount);
    
    subaccount
}

fn principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}