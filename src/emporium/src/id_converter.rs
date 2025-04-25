use ic_cdk::query;
use candid::Nat;
use num_bigint::BigUint;

#[query]
pub fn arweave_id_to_nat(arweave_id: String) -> Nat {
    // can be 44 locally
    let mut id = arweave_id.chars().take(43).collect::<String>();
    while id.len() % 4 != 0 {
        id.push('=');
    }
    id = id.replace('-', "+").replace('_', "/");
    
    let bytes = base64_decode(&id);
    let big_uint = BigUint::from_bytes_be(&bytes);
    Nat::from(big_uint)
}

#[query]
pub fn nat_to_arweave_id(num: Nat) -> String {
    let big_uint: BigUint = num.0;
    let bytes = big_uint.to_bytes_be();
    let id = base64_encode(&bytes);
    id.replace('+', "-").replace('/', "_").trim_end_matches('=').to_string()
}

#[query]
pub fn is_arweave_id(id: String) -> bool {
    // Check length
    // can be 44 locally
    if id.len() != 43 {
        return false;
    }

    // Check characters
    id.chars().all(|c| {
        matches!(c,
            'A'..='Z' |
            'a'..='z' |
            '0'..='9' |
            '-' |
            '_'
        )
    })
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
        let b2 = if i + 1 < input.len() { input[i + 1] } else { 0 };
        let b3 = if i + 2 < input.len() { input[i + 2] } else { 0 };

        result.push(CHARSET[(b1 >> 2) as usize] as char);
        result.push(CHARSET[((b1 & 0x03) << 4 | b2 >> 4) as usize] as char);
        result.push(CHARSET[((b2 & 0x0f) << 2 | b3 >> 6) as usize] as char);
        result.push(CHARSET[(b3 & 0x3f) as usize] as char);

        i += 3;
    }

    let padding = (3 - input.len() % 3) % 3;
    if padding > 0 {
        result.truncate(result.len() - padding);
    }

    result
}