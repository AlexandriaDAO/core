/// Balance operations for LBRY token transfers
/// Uses subaccount pattern for user balances within the Kairos canister
use candid::{Nat, Principal};
use ic_cdk::api::call::CallResult;
use icrc_ledger_types::icrc1::account::{Account, Subaccount};
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};

use crate::constants::{LBRY_CANISTER_ID, NFT_MANAGER_CANISTER_ID, LBRY_TRANSFER_FEE};

/// Convert principal to subaccount for balance tracking
/// MUST match NFT Manager's implementation exactly
pub fn principal_to_subaccount(principal: &Principal) -> Subaccount {
    let mut subaccount = [0u8; 32];
    let principal_bytes = principal.as_slice();

    // First bytes: principal bytes (padded with zeros if needed)
    let principal_len = principal_bytes.len();
    subaccount[..principal_len].copy_from_slice(principal_bytes);

    // Byte 28: length of the principal
    subaccount[28] = principal_len as u8;

    // Last 3 bytes: CRC24 checksum (must match NFT Manager)
    let checksum = calculate_crc24(principal_bytes);
    subaccount[29] = ((checksum >> 16) & 0xFF) as u8;
    subaccount[30] = ((checksum >> 8) & 0xFF) as u8;
    subaccount[31] = (checksum & 0xFF) as u8;

    subaccount
}

/// CRC24 checksum - matches NFT Manager's implementation
fn calculate_crc24(data: &[u8]) -> u32 {
    const CRC24_POLY: u32 = 0x1864CFB; // CRC-24 polynomial
    let mut crc: u32 = 0xB704CE;       // CRC-24 initial value

    for &byte in data {
        crc ^= (byte as u32) << 16;
        for _ in 0..8 {
            crc <<= 1;
            if (crc & 0x1000000) != 0 {
                crc ^= CRC24_POLY;
            }
        }
    }

    crc & 0xFFFFFF // Return 24 bits only
}

/// Get the LBRY canister principal
pub fn lbry_principal() -> Principal {
    Principal::from_text(LBRY_CANISTER_ID).unwrap()
}

/// Get the NFT Manager canister principal
pub fn nft_manager_principal() -> Principal {
    Principal::from_text(NFT_MANAGER_CANISTER_ID).unwrap()
}

/// Get user's LBRY balance in their Kairos subaccount
pub async fn get_user_kairos_balance(user: Principal) -> Result<u64, String> {
    let account = Account {
        owner: ic_cdk::id(),
        subaccount: Some(principal_to_subaccount(&user)),
    };

    let balance_result: CallResult<(Nat,)> = ic_cdk::call(
        lbry_principal(),
        "icrc1_balance_of",
        (account,),
    ).await;

    match balance_result {
        Ok((balance,)) => {
            // Convert Nat to u64
            let balance_u64: u64 = balance.0.try_into().unwrap_or(0);
            Ok(balance_u64)
        }
        Err((code, msg)) => Err(format!("Error fetching balance: {:?} - {}", code, msg)),
    }
}

/// Get house pool balance (Kairos main account, subaccount: None)
pub async fn get_house_balance() -> Result<u64, String> {
    let account = Account {
        owner: ic_cdk::id(),
        subaccount: None,
    };

    let balance_result: CallResult<(Nat,)> = ic_cdk::call(
        lbry_principal(),
        "icrc1_balance_of",
        (account,),
    ).await;

    match balance_result {
        Ok((balance,)) => {
            let balance_u64: u64 = balance.0.try_into().unwrap_or(0);
            Ok(balance_u64)
        }
        Err((code, msg)) => Err(format!("Error fetching house balance: {:?} - {}", code, msg)),
    }
}

/// Transfer LBRY from user's Kairos subaccount to house pool (on game loss)
pub async fn transfer_bet_to_house(user: Principal, amount: u64) -> Result<Nat, String> {
    let transfer_arg = TransferArg {
        to: Account {
            owner: ic_cdk::id(),
            subaccount: None, // House pool
        },
        fee: Some(Nat::from(LBRY_TRANSFER_FEE)),
        memo: None,
        from_subaccount: Some(principal_to_subaccount(&user)),
        created_at_time: None,
        amount: Nat::from(amount),
    };

    let transfer_result: CallResult<(Result<Nat, TransferError>,)> = ic_cdk::call(
        lbry_principal(),
        "icrc1_transfer",
        (transfer_arg,),
    ).await;

    match transfer_result {
        Ok((Ok(block_index),)) => Ok(block_index),
        Ok((Err(e),)) => Err(format!("Transfer to house failed: {:?}", e)),
        Err((code, msg)) => Err(format!("Error calling LBRY: {:?} - {}", code, msg)),
    }
}

/// Transfer winnings from house pool to user's NFT Manager subaccount (locked balance)
/// This returns winnings to the user's spending balance in NFT Manager
pub async fn transfer_winnings_to_user(user: Principal, amount: u64) -> Result<Nat, String> {
    let transfer_arg = TransferArg {
        to: Account {
            owner: nft_manager_principal(),
            subaccount: Some(principal_to_subaccount(&user)),
        },
        fee: Some(Nat::from(LBRY_TRANSFER_FEE)),
        memo: None,
        from_subaccount: None, // From house pool
        created_at_time: None,
        amount: Nat::from(amount),
    };

    let transfer_result: CallResult<(Result<Nat, TransferError>,)> = ic_cdk::call(
        lbry_principal(),
        "icrc1_transfer",
        (transfer_arg,),
    ).await;

    match transfer_result {
        Ok((Ok(block_index),)) => Ok(block_index),
        Ok((Err(e),)) => Err(format!("Transfer to user failed: {:?}", e)),
        Err((code, msg)) => Err(format!("Error calling LBRY: {:?} - {}", code, msg)),
    }
}

/// Return unused bet amount back to user's NFT Manager subaccount
/// Used when game ends and we want to return funds to user's spending balance
pub async fn return_to_user_spending_balance(user: Principal, amount: u64) -> Result<Nat, String> {
    let transfer_arg = TransferArg {
        to: Account {
            owner: nft_manager_principal(),
            subaccount: Some(principal_to_subaccount(&user)),
        },
        fee: Some(Nat::from(LBRY_TRANSFER_FEE)),
        memo: None,
        from_subaccount: Some(principal_to_subaccount(&user)), // From user's Kairos subaccount
        created_at_time: None,
        amount: Nat::from(amount),
    };

    let transfer_result: CallResult<(Result<Nat, TransferError>,)> = ic_cdk::call(
        lbry_principal(),
        "icrc1_transfer",
        (transfer_arg,),
    ).await;

    match transfer_result {
        Ok((Ok(block_index),)) => Ok(block_index),
        Ok((Err(e),)) => Err(format!("Return to user failed: {:?}", e)),
        Err((code, msg)) => Err(format!("Error calling LBRY: {:?} - {}", code, msg)),
    }
}
