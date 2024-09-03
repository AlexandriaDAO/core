use candid::{Nat, Principal};
use icrc_ledger_types::icrc1::account::Subaccount;
use ic_cdk::api::time;

const MAX_QUERY_BATCH_SIZE: usize = 100;
const MAX_UPDATE_BATCH_SIZE: usize = 20;

pub fn check_query_batch_size<T>(batch: &Vec<T>) -> Result<(), String> {
    if batch.len() > MAX_QUERY_BATCH_SIZE {
        Err(format!("Batch size exceeds maximum allowed ({})", MAX_QUERY_BATCH_SIZE))
    } else {
        Ok(())
    }
}

pub fn check_update_batch_size<T>(batch: &Vec<T>) -> Result<(), String> {
    if batch.len() > MAX_UPDATE_BATCH_SIZE {
        Err(format!("Batch size exceeds maximum allowed ({})", MAX_UPDATE_BATCH_SIZE))
    } else {
        Ok(())
    }
}

pub fn is_within_32_digits(number: &Nat) -> bool {
  let max_32_digit = Nat::from(10u128.pow(32) - 1);
  number <= &max_32_digit
}

pub fn batch_is_within_32_digits(numbers: &[Nat]) -> bool {
  let max_32_digit = Nat::from(10u128.pow(32) - 1);
  numbers.iter().all(|number| number <= &max_32_digit)
}

pub fn principal(id: &str) -> Principal {
  Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

pub fn to_nft_subaccount(id: Nat) -> Subaccount {
  let mut subaccount = [0; 32];
  let digits: Vec<u8> = id
      .0
      .to_string()
      .chars()
      .map(|c| c.to_digit(10).unwrap() as u8)
      .collect();
  
  let start = 32 - digits.len().min(32);
  subaccount[start..].copy_from_slice(&digits[digits.len().saturating_sub(32)..]);

  subaccount
}