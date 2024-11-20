use candid::{Nat, Principal};

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

pub fn is_within_100_digits(number: Nat) -> bool {
    let digit_count = number.to_string().replace("_", "").len();
    digit_count <= 100
}

pub fn principal(id: &str) -> Principal {
    Principal::from_text(id).expect(&format!("Invalid principal: {}", id))
}

fn arweave_id_to_nat(arweave_id: &str) -> Vec<u8> {
    let mut id = arweave_id.chars().take(43).collect::<String>();
    while id.len() % 4 != 0 {
        id.push('=');
    }
    id = id.replace('-', "+").replace('_', "/");
    
    base64_decode(&id)
}

fn nat_to_arweave_id(num: &[u8]) -> String {
    let mut id = base64_encode(num);
    id = id.replace('+', "-").replace('/', "_");
    id.trim_end_matches('=').to_string()
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