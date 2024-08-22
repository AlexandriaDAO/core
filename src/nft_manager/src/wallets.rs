// // Make to_account optional, as it should disperse to the caller or NFT owner.
// // I have to decide if the to_account should be allowed at all. People will only use the claim function in our app anyway.

// I'm going to have to think about how to handle the mint# issue. it's cool if you can choose, and it'd reduce conflicts, but it currently leaves gaps in the 'current_count' and I'm not to thrilled with how we do it now anyway.
// Will work in a solution where we don't run into concurrency issues as lots of people mint NFTs at once.
// Also need to ensure the mint# never changes, otherwise the money will get left behind.

// Do the withdraw all, so whatever nfts you have associated with a principal, they all get dispersed at once.
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

const ICRC7_CANISTER_ID: &str = "fjqb7-6qaaa-aaaak-qc7gq-cai";
const LBRY_CANISTER_ID: &str = "hdtfn-naaaa-aaaam-aciva-cai";
const ALEX_CANISTER_ID: &str = "7hcrm-4iaaa-aaaak-akuka-cai";
const LBRY_FEE: u64 = 4_000_000;
const ALEX_FEE: u64 = 10_000;


// Function to retrieve token balances
#[ic_cdk::update]
pub async fn get_token_balances(mint_number: Nat) -> Result<TokenBalances, String> {
    let account = Account {
        owner: ic_cdk::id(),
        subaccount: Some(to_subaccount(mint_number)),
    };

    // Get the LBRY balance
    let lbry_balance = ic_cdk::call::<(Account,), (NumTokens,)>(
        Principal::from_text(LBRY_CANISTER_ID).expect("Could not decode the LBRY principal."),
        "icrc1_balance_of",
        (account,),
    )
    .await
    .map_err(|e| format!("Failed to get LBRY balance: {:?}", e))?
    .0;

    // Get the ALEX balance
    let alex_balance = ic_cdk::call::<(Account,), (NumTokens,)>(
        Principal::from_text(ALEX_CANISTER_ID).expect("Could not decode the ALEX principal."),
        "icrc1_balance_of",
        (account,),
    )
    .await
    .map_err(|e| format!("Failed to get ALEX balance: {:?}", e))?
    .0;

    // Ok(TokenBalances {
    //     lbry: lbry_balance - NumTokens::from(LBRY_FEE),
    //     alex: alex_balance - NumTokens::from(ALEX_FEE),
    // })

    let lbry_fee = NumTokens::from(LBRY_FEE);
    let alex_fee = NumTokens::from(ALEX_FEE);

    Ok(TokenBalances {
        lbry: if lbry_balance > lbry_fee { lbry_balance - lbry_fee } else { NumTokens::from(0u64) },
        alex: if alex_balance > alex_fee { alex_balance - alex_fee } else { NumTokens::from(0u64) },
    })
}

// Withdraws the full ICRC token balance from the NFT's subaccount to the specified account.
#[ic_cdk::update]
pub async fn withdraw(mint_number: Nat) -> Result<(BlockIndex, BlockIndex), String> {
    let caller = ic_cdk::api::caller();

    // Ensure caller owns the NFT
    let ownership_result = ic_cdk::call::<(Vec<Nat>,), (Vec<Option<Account>>,)>(
        Principal::from_text(ICRC7_CANISTER_ID).expect("Could not decode the ICRC7 principal."),
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


    ic_cdk::println!(
        "Transfering {} LBRY and {} ALEX from NFT# {} to {}", 
        balances.lbry, balances.alex, mint_number, caller
    );

    let lbry_result = if balances.lbry > NumTokens::from(0u64) {
        let lbry_transfer_args = TransferArg {
            memo: None,
            amount: balances.lbry,
            from_subaccount: subaccount,
            fee: None,
            to: to_account.clone(),
            created_at_time: None,
        };

        // Withdraw LBRY
        ic_cdk::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
            Principal::from_text(LBRY_CANISTER_ID).expect("Could not decode the LBRY principal."),
            "icrc1_transfer",
            (lbry_transfer_args,),
        )
        .await
        .map_err(|e| format!("Failed to call LBRY ledger: {:?}", e))?
        .0
        .map_err(|e| format!("LBRY ledger transfer error: {:?}", e))?
    } else {
        BlockIndex::from(0u64) // Return 0 if no transfer was made
    };

    let alex_result = if balances.alex > NumTokens::from(0u64) {
        let alex_transfer_args = TransferArg {
            memo: None,
            amount: balances.alex,
            from_subaccount: subaccount,
            fee: None,
            to: to_account,
            created_at_time: None,
        };

        // Withdraw ALEX
        ic_cdk::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
            Principal::from_text(ALEX_CANISTER_ID).expect("Could not decode the ALEX principal."),
            "icrc1_transfer",
            (alex_transfer_args,),
        )
        .await
        .map_err(|e| format!("Failed to call ALEX ledger: {:?}", e))?
        .0
        .map_err(|e| format!("ALEX ledger transfer error: {:?}", e))?
    } else {
        BlockIndex::from(0u64) // Return 0 if no transfer was made
    };

    Ok((lbry_result, alex_result))
}


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