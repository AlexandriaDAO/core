use std::collections::HashMap;

use ic_certified_map::{Hash, HashTree};
use serde_bytes::ByteBuf;

use candid::Principal;
use serde::Serialize;
use simple_asn1::{from_der, oid, ASN1Block, ASN1EncodeErr};

use crate::with_settings;
use crate::hash::{self, Value};
use crate::settings::types::Settings;
use crate::signature::SignatureMap;

use super::types::{Delegation, DelegationError};


/// Generates a unique seed for delegation, derived from the salt and Principal.
///
/// This function creates a deterministic but unique seed for each principal by
/// combining the canister's configured salt with the principal's bytes. This seed
/// is then used as a key in the signature map.
///
/// # Parameters
/// * `principal`: The Principal for which to generate a seed.
///
/// # Returns
/// A `Hash` value representing the unique seed.
///
/// # Security Properties
/// - The salt prevents different canisters from generating the same seed for a given principal
/// - The seed is deterministic for a given principal and salt, ensuring consistency across calls
/// - The seed is hashed, making it difficult to reverse-engineer the original principal
///
/// # Example
/// ```
/// use candid::Principal;
/// use ic_siwo::delegation::utils::generate_seed;
///
/// let principal = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
/// let seed = generate_seed(&principal);
/// // The seed can now be used as a lookup key in the signature map
/// ```
pub fn generate_seed(principal: &Principal) -> Hash {
    with_settings!(|settings: &Settings| {
        let mut seed: Vec<u8> = vec![];

        // Add salt to the seed
        let salt = settings.salt.as_bytes();
        seed.push(salt.len() as u8);
        seed.extend_from_slice(salt);

        // Add principal bytes to the seed
        let principal_bytes = principal.as_slice();
        seed.push(principal_bytes.len() as u8);
        seed.extend_from_slice(principal_bytes);


        // Hash the combined bytes to create the seed
        hash::hash_bytes(seed)
    })
}

/// Creates a delegation with the provided session key and expiration, including a list of canisters for identity delegation.
///
/// This function builds a delegation object that authorizes a session key to act on behalf
/// of a user for a limited time, optionally restricting the delegation to specific target canisters.
///
/// # Parameters
/// * `session_key`: A DER-encoded public key uniquely identifying the session.
/// * `expiration`: Expiration time in nanoseconds since the UNIX epoch.
///
/// # Returns
/// * `Ok(Delegation)`: A new delegation object if successful
/// * `Err(DelegationError)`: If validation fails for the session key or expiration
///
/// # Validation
/// The function performs these validations:
/// - Session key must not be empty
/// - Session key must be valid DER-encoded data
/// - Expiration must not be zero (must be a valid future timestamp)
///
/// # Example
/// ```
/// use serde_bytes::ByteBuf;
/// use ic_siwo::delegation::utils::create_delegation;
///
/// // Given a DER-encoded session public key and expiration timestamp
/// let result = create_delegation(
///     ByteBuf::from(session_key_bytes),
///     expiration_timestamp_nanos
/// );
///
/// match result {
///     Ok(delegation) => println!("Created delegation expiring at: {}", delegation.expiration),
///     Err(e) => println!("Failed to create delegation: {}", e),
/// }
/// ```
pub fn create_delegation(
    session_key: ByteBuf,
    expiration: u64,
) -> Result<Delegation, DelegationError> {
    // Validate the session key and expiration
    if session_key.is_empty() {
        return Err(DelegationError::InvalidSessionKey(
            "Session key is empty".to_string(),
        ));
    }

    // Validate the session key is DER-encoded
    from_der(&session_key).map_err(|e| {
        DelegationError::InvalidSessionKey(format!("Session key should be DER-encoded: {}", e))
    })?;

    if expiration == 0 {
        return Err(DelegationError::InvalidExpiration(
            "Expiration is 0".to_string(),
        ));
    }
    with_settings!(|settings: &Settings| {
        Ok(Delegation {
            pubkey: session_key.clone(),
            expiration,
            targets: settings.targets.clone(),
        })
    })
}

/// Constructs a hash tree as proof of an entry in the signature map.
///
/// This function creates a witness (a pruned hash tree) that proves the existence
/// of a signature for a specific delegation in the signature map. This witness can
/// be verified against the root hash of the signature map to prove authenticity.
///
/// # Parameters
/// * `signature_map`: The map containing signatures.
/// * `seed`: The unique seed identifying the delegation's owner.
/// * `delegation_hash`: The hash of the delegation being witnessed.
///
/// # Returns
/// * `Ok(HashTree)`: A hash tree witness if the signature exists and is valid
/// * `Err(DelegationError)`: If the signature is not found, has expired, or the witness hash doesn't match
///
/// # Error Conditions
/// - `SignatureExpired`: If the signature exists but has expired
/// - `SignatureNotFound`: If no signature exists for the given seed and delegation hash
/// - `WitnessHashMismatch`: If the witness hash doesn't match the root hash (indicating corruption)
///
/// # Example
/// ```
/// use ic_siwo::delegation::utils::{witness, generate_seed, create_delegation_hash};
///
/// // Generate a witness for a delegation
/// let seed = generate_seed(&principal);
/// let delegation_hash = create_delegation_hash(&delegation);
/// let witness_result = witness(&signature_map, seed, delegation_hash);
///
/// match witness_result {
///     Ok(hash_tree) => {
///         // Use the hash tree to create a certified signature
///         let certified_sig = create_certified_signature(certificate, hash_tree)?;
///     },
///     Err(e) => println!("Failed to create witness: {}", e),
/// }
/// ```
pub fn witness(
    signature_map: &SignatureMap,
    seed: Hash,
    delegation_hash: Hash,
) -> Result<HashTree, DelegationError> {
    let seed_hash = hash::hash_bytes(seed);

    if signature_map.is_expired(ic_cdk::api::time(), seed_hash, delegation_hash) {
        return Err(DelegationError::SignatureExpired);
    }

    let witness = signature_map
        .witness(seed_hash, delegation_hash)
        .ok_or(DelegationError::SignatureNotFound)?;

    let witness_hash = witness.reconstruct();
    let root_hash = signature_map.root_hash();
    if witness_hash != root_hash {
        return Err(DelegationError::WitnessHashMismatch(
            witness_hash,
            root_hash,
        ));
    }

    Ok(witness)
}


#[derive(Serialize)]
struct CertificateSignature<'a> {
    certificate: ByteBuf,
    tree: HashTree<'a>,
}

/// Creates a certified signature using a certificate and a state hash tree.
///
/// This function combines a certificate from the Internet Computer with a hash tree
/// to create a certified signature. This signature can be used to prove that the delegation
/// was created by this canister and has not been tampered with.
///
/// # Parameters
/// * `certificate`: Bytes representing the certificate from the Internet Computer.
/// * `tree`: The `HashTree` witness for the delegation.
///
/// # Returns
/// * `Ok(Vec<u8>)`: The CBOR-serialized certified signature
/// * `Err(DelegationError)`: If serialization fails
///
/// # Certification Process
/// 1. The certificate proves the canister's state root hash at a point in time
/// 2. The hash tree proves that a specific signature exists in that state
/// 3. Together, they prove the delegation is authentic and was created by this canister
///
/// # Example
/// ```
/// use ic_siwo::delegation::utils::create_certified_signature;
///
/// // Given a certificate from ic_cdk::api::data_certificate() and a hash tree witness
/// let certified_sig_result = create_certified_signature(certificate, hash_tree);
///
/// match certified_sig_result {
///     Ok(certified_sig) => {
///         // Use the certified signature in a SignedDelegation
///     },
///     Err(e) => println!("Failed to create certified signature: {}", e),
/// }
/// ```
pub fn create_certified_signature(
    certificate: Vec<u8>,
    tree: HashTree,
) -> Result<Vec<u8>, DelegationError> {
    let certificate_signature = CertificateSignature {
        certificate: ByteBuf::from(certificate),
        tree,
    };

    cbor_serialize(&certificate_signature)
}

/// Creates a hash of a delegation for signature and verification purposes.
///
/// This function deterministically converts a delegation into a hash value that can
/// be signed and later verified. It processes all fields of the delegation including
/// the public key, expiration, and optional targets.
///
/// # Parameters
/// * `delegation`: The delegation to hash.
///
/// # Returns
/// A `Hash` value representing the delegation.
///
/// # Hashing Process
/// 1. Create a map with all delegation fields
/// 2. Convert each field to an appropriate `Value` type
/// 3. Hash the map using a domain-specific hash function
///
/// # Example
/// ```
/// use ic_siwo::delegation::utils::create_delegation_hash;
/// use ic_siwo::delegation::types::Delegation;
///
/// // Given a delegation object
/// let delegation_hash = create_delegation_hash(&delegation);
/// // This hash can now be signed or used for lookups
/// ```
pub fn create_delegation_hash(delegation: &Delegation) -> Hash {
    let mut delegation_map = HashMap::new();

    delegation_map.insert("pubkey", Value::Bytes(&delegation.pubkey));
    delegation_map.insert("expiration", Value::U64(delegation.expiration));

    if let Some(targets) = delegation.targets.as_ref() {
        let mut arr = Vec::with_capacity(targets.len());
        for t in targets.iter() {
            arr.push(Value::Bytes(t.as_ref()));
        }
        delegation_map.insert("targets", Value::Array(arr));
    }

    let delegation_map_hash = hash::hash_of_map(delegation_map);

    hash::hash_with_domain(b"ic-request-auth-delegation", &delegation_map_hash)
}

/// Creates a DER-encoded public key for a user canister from a given seed.
///
/// This function generates a canister-specific public key that incorporates both
/// the canister's identity and the provided seed. The key follows the ASN.1 DER
/// encoding format with a custom algorithm OID.
///
/// # Parameters
/// * `seed`: Bytes representing the seed for key generation.
///
/// # Returns
/// * `Ok(Vec<u8>)`: DER-encoded public key bytes
/// * `Err(ASN1EncodeErr)`: If ASN.1 encoding fails
///
/// # Key Structure
/// The generated key has this format:
/// - Format: ASN.1 DER encoding
/// - Algorithm: OID 1.3.6.1.4.1.56387.1.2 (canister-specific algorithm)
/// - Public Key: Combined canister ID and seed
///
/// # Example
/// ```
/// use ic_siwo::delegation::utils::create_user_canister_pubkey;
///
/// // Given a seed (possibly derived from a user identity)
/// match create_user_canister_pubkey(seed_bytes) {
///     Ok(der_key) => {
///         // Use the DER-encoded key for authentication
///         println!("Generated canister public key of length: {}", der_key.len());
///     },
///     Err(e) => println!("Failed to create canister public key: {}", e),
/// }
/// ```
pub(crate) fn create_user_canister_pubkey(
    seed: Vec<u8>,
) -> Result<Vec<u8>, ASN1EncodeErr> {
    let canister_id: Vec<u8> = ic_cdk::api::id().as_slice().to_vec();

    let mut key: Vec<u8> = vec![];
    key.push(canister_id.len() as u8);
    key.extend(canister_id);
    key.extend(seed);

    let algorithm = oid!(1, 3, 6, 1, 4, 1, 56387, 1, 2);
    let algorithm = ASN1Block::Sequence(0, vec![ASN1Block::ObjectIdentifier(0, algorithm)]);
    let subject_public_key = ASN1Block::BitString(0, key.len() * 8, key.to_vec());
    let subject_public_key_info = ASN1Block::Sequence(0, vec![algorithm, subject_public_key]);
    simple_asn1::to_der(&subject_public_key_info)
}

/// Serializes data into CBOR format.
///
/// This is a helper function that serializes data into CBOR (Concise Binary Object
/// Representation) format, which is a compact binary serialization format suitable for
/// efficient network transmission and storage.
///
/// # Parameters
/// * `data`: The data to serialize, which must implement the `Serialize` trait.
///
/// # Returns
/// * `Ok(Vec<u8>)`: CBOR serialized data
/// * `Err(DelegationError)`: If serialization fails
///
/// # Serialization Process
/// 1. Creates a self-describing CBOR serializer
/// 2. Serializes the data into CBOR format
/// 3. Returns the resulting bytes
///
/// # Example
/// ```
/// use ic_siwo::delegation::utils::cbor_serialize;
///
/// // Given some serializable data
/// let result = cbor_serialize(&my_data);
/// match result {
///     Ok(cbor_bytes) => {
///         // Use the CBOR bytes
///     },
///     Err(e) => println!("Serialization failed: {}", e),
/// }
/// ```
fn cbor_serialize<T: Serialize>(data: &T) -> Result<Vec<u8>, DelegationError> {
    let mut cbor_serializer = serde_cbor::ser::Serializer::new(Vec::new());

    cbor_serializer
        .self_describe()
        .map_err(|e| DelegationError::SerializationError(e.to_string()))?;

    data.serialize(&mut cbor_serializer)
        .map_err(|e| DelegationError::SerializationError(e.to_string()))?;

    Ok(cbor_serializer.into_inner())
}