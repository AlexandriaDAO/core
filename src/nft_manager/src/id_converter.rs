use ic_cdk::query;
use candid::{CandidType, Deserialize};
use serde::Serialize;
use icrc_ledger_types::icrc1::account::Subaccount;

#[derive(Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
struct Nat(Vec<u8>);

impl Nat {
    fn from_bytes(bytes: Vec<u8>) -> Self {
        Nat(bytes)
    }

    fn to_bytes(&self) -> &[u8] {
        &self.0
    }

    fn to_decimal_string(&self) -> String {
        let mut result = String::new();
        let mut carry = 0u16;
        let mut digits = vec![];

        for &byte in self.0.iter().rev() {
            carry = (carry << 8) | byte as u16;
            digits.push(carry % 10);
            carry /= 10;
        }

        while carry > 0 {
            digits.push(carry % 10);
            carry /= 10;
        }

        if digits.is_empty() {
            digits.push(0);
        }

        for digit in digits.into_iter().rev() {
            result.push_str(&digit.to_string());
        }

        result
    }
}


#[query]
fn arweave_id_to_nat(arweave_id: String) -> Nat {
    let mut id = arweave_id.chars().take(43).collect::<String>();
    while id.len() % 4 != 0 {
        id.push('=');
    }
    id = id.replace('-', "+").replace('_', "/");
    
    Nat::from_bytes(base64_decode(&id))
}

#[query]
fn nat_to_arweave_id(num: Nat) -> String {
    let id = base64_encode(&num.to_bytes());
    id.replace('+', "-").replace('/', "_").trim_end_matches('=').to_string()
}

fn base64_decode(input: &str) -> Vec<u8> {
    let mut result = Vec::new();
    let mut buf = 0u32;
    let mut buf_len = 0;

    for &c in input.as_bytes() {
        let val = match c {
            b'A'..=b'Z' => c - b'A',
            b'a'..=b'z' => c - b'a' + 26,
            b'0'..=b'9' => c - b'0' + 52,
            b'+' => 62,
            b'/' => 63,
            b'=' => break,
            _ => continue,
        };

        buf = (buf << 6) | val as u32;
        buf_len += 6;

        if buf_len >= 8 {
            buf_len -= 8;
            result.push((buf >> buf_len) as u8);
        }
    }

    result
}

fn base64_encode(input: &[u8]) -> String {
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = String::new();
    let mut i = 0;

    while i < input.len() {
        let b1 = input[i];
        let b2 = input.get(i + 1).copied().unwrap_or(0);
        let b3 = input.get(i + 2).copied().unwrap_or(0);

        result.push(CHARSET[(b1 >> 2) as usize] as char);
        result.push(CHARSET[((b1 & 0x03) << 4 | b2 >> 4) as usize] as char);
        result.push(CHARSET[((b2 & 0x0f) << 2 | b3 >> 6) as usize] as char);
        result.push(CHARSET[(b3 & 0x3f) as usize] as char);

        i += 3;
    }

    let padding = (3 - input.len() % 3) % 3;
    result.truncate(result.len() - padding);

    result
}

#[ic_cdk::query]
pub fn to_nft_subaccount(id: candid::Nat) -> Subaccount {
    let mut subaccount = [0; 32];
    let num_str = id.to_string();
    
    // Convert string to individual digits
    let digits: Vec<u8> = num_str
        .chars()
        .filter_map(|c| c.to_digit(10))  // Convert to digit, filtering out non-digits
        .map(|d| d as u8)                // Convert u32 to u8
        .collect();
    
    let start = 32 - digits.len().min(32);
    subaccount[start..].copy_from_slice(&digits[digits.len().saturating_sub(32)..]);

    subaccount
}
