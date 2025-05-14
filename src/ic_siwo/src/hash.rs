/// Utilities for computing hashes of values.
use ic_certified_map::Hash;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::convert::AsRef;

/// Represents different types of values that can be hashed.
#[derive(Clone, Serialize, Deserialize)]
pub enum Value<'a> {
    Bytes(#[serde(with = "serde_bytes")] &'a [u8]),
    String(&'a str),
    U64(u64),
    Array(Vec<Value<'a>>),
}

/// Computes a hash of a map where keys are strings and values are `Value`.
pub(crate) fn hash_of_map<S: AsRef<str>>(map: HashMap<S, Value>) -> Hash {
    let mut hashes = map
        .into_iter()
        .map(|(key, val)| hash_key_value(key.as_ref(), val))
        .collect::<Vec<_>>();

    hashes.sort_unstable();
    let mut hasher = Sha256::new();
    for hash in hashes {
        hasher.update(&hash);
    }

    hasher.finalize().into()
}

/// Computes a hash with a domain separator.
pub(crate) fn hash_with_domain(sep: &[u8], bytes: &[u8]) -> Hash {
    let mut hasher = Sha256::new();
    hasher.update([sep.len() as u8]);
    hasher.update(sep);
    hasher.update(bytes);
    hasher.finalize().into()
}

/// Helper function to hash a key and value pair.
fn hash_key_value(key: &str, val: Value<'_>) -> Vec<u8> {
    let mut key_hash = hash_string(key).to_vec();
    let val_hash = hash_value(val);
    key_hash.extend_from_slice(&val_hash[..]);
    key_hash
}

/// Hashes a string.
pub(crate) fn hash_string(value: &str) -> Hash {
    hash_bytes(value.as_bytes())
}

/// Hashes a byte slice.
pub(crate) fn hash_bytes(value: impl AsRef<[u8]>) -> Hash {
    let mut hasher = Sha256::new();
    hasher.update(value.as_ref());
    hasher.finalize().into()
}

/// Hashes a 64-bit unsigned integer.
fn hash_u64(value: u64) -> Hash {
    let mut buf = [0u8; 10];
    let mut n = value;
    let mut i = 0;

    loop {
        let byte = (n & 0x7f) as u8;
        n >>= 7;
        buf[i] = byte | if n != 0 { 0x80 } else { 0 };

        if n == 0 {
            break;
        }
        i += 1;
    }

    hash_bytes(&buf[..=i])
}

/// Hashes an array of `Value`.
fn hash_array(elements: Vec<Value<'_>>) -> Hash {
    let mut hasher = Sha256::new();
    for element in elements {
        hasher.update(&hash_value(element)[..]);
    }

    hasher.finalize().into()
}

/// Hashes a `Value`.
fn hash_value(val: Value<'_>) -> Hash {
    match val {
        Value::String(s) => hash_string(s),
        Value::Bytes(b) => hash_bytes(b),
        Value::U64(n) => hash_u64(n),
        Value::Array(a) => hash_array(a),
    }
}