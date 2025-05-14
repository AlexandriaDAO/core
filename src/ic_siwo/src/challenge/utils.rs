use ed25519_dalek::VerifyingKey;
use simple_asn1::from_der;

/// Decodes a DER-encoded Ed25519 public key into a VerifyingKey.
///
/// This function parses a DER (Distinguished Encoding Rules) encoded Ed25519 public key
/// and extracts the raw 32-byte key material to create a verifying key that can be used
/// for signature verification.
///
/// # DER Structure for Ed25519 Public Keys
/// ```
/// SEQUENCE {
///   SEQUENCE {
///     OBJECT IDENTIFIER 1.3.101.112 (Ed25519)
///   }
///   BIT STRING <actual 32-byte key>
/// }
/// ```
///
/// # Parameters
/// - `der_bytes`: A byte slice containing the DER-encoded Ed25519 public key
///
/// # Returns
/// - `Ok(VerifyingKey)`: The decoded Ed25519 verifying key
/// - `Err(String)`: A detailed error message if decoding fails
///
/// # Errors
/// This function can fail if:
/// - The DER data is malformed
/// - The ASN.1 structure doesn't match the expected Ed25519 public key format
/// - The embedded public key is not exactly 32 bytes
/// - The key bytes cannot be converted to a valid Ed25519 verifying key
///
/// # Example
/// ```
/// use ic_siwo::challenge::utils::decode_der_public_key;
/// 
/// // Assume der_encoded_key contains a DER-encoded Ed25519 public key
/// match decode_der_public_key(&der_encoded_key) {
///     Ok(verifying_key) => {
///         // Use verifying_key for signature verification
///         println!("Successfully decoded public key");
///     },
///     Err(err) => {
///         println!("Failed to decode public key: {}", err);
///     }
/// }
/// ```
pub(super) fn decode_der_public_key(der_bytes: &[u8]) -> Result<VerifyingKey, String> {
    match from_der(der_bytes) {
        Ok(asn1_blocks) => {
            // Ed25519 public key in DER format typically has this structure:
            // SEQUENCE {
            //   SEQUENCE {
            //     OBJECT IDENTIFIER 1.3.101.112 (Ed25519)
            //   }
            //   BIT STRING <actual 32-byte key>
            // }

            // Navigate through the ASN.1 structure to find the bit string
            if asn1_blocks.len() < 1 {
                return Err("Invalid ASN.1 structure: empty".to_string());
            }

            if let simple_asn1::ASN1Block::Sequence(_, blocks) = &asn1_blocks[0] {
                if blocks.len() < 2 {
                    return Err("Invalid ASN.1 structure: sequence too short".to_string());
                }

                if let simple_asn1::ASN1Block::BitString(_, _, bytes) = &blocks[1] {
                    let key_bytes: [u8; 32] = match bytes.as_slice().try_into() {
                        Ok(array) => array,
                        Err(_) => return Err("Public key must be exactly 32 bytes".to_string())
                    };

                    match VerifyingKey::from_bytes(&key_bytes) {
                        Ok(key) => Ok(key),
                        Err(_) => Err("Failed to create verifying key from bytes".to_string())
                    }
                } else {
                    Err("Expected BitString for public key".to_string())
                }
            } else {
                Err("Invalid ASN.1 structure: expected sequence".to_string())
            }
        },
        Err(_) => Err("Failed to decode DER-encoded public key".to_string())
    }
}

