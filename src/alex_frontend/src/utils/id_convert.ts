// // OG Conversions

export function arweaveIdToNat(arweaveId: string): bigint {
    // Remove any potential extra character and padding
    // can be 44 locally
    let id = arweaveId.slice(0, 43);

    // Add padding if necessary
    while (id.length % 4 !== 0) {
        id += '=';
    }

    // Replace URL-safe characters
    id = id.replace(/-/g, '+').replace(/_/g, '/');

    // Decode Base64 to Uint8Array
    const idBytes = base64DecodeToUint8Array(id);

    return bytesToBigInt(idBytes);
}

export function natToArweaveId(num: bigint): string {
    // Check if it's likely a scion ID (approximately > 90 characters when as string)
    const numStr = num.toString();
    
    // If it's a scion ID, convert it to original ID first
    if (numStr.length > 90) {
        // Extract principal hash (first 64 bits after shifting right)
        const shifted = num >> 256n;
        const mask = (1n << 64n) - 1n;
        const principalHash = shifted & mask;
        
        // Reconstruct original number using XOR
        const shiftedHash = principalHash << 256n;
        num = num ^ shiftedHash;
    }
    
    // Convert BigInt to Uint8Array
    const idBytes = bigIntToBytes(num);

    // Encode Uint8Array to Base64
    let id = base64Encode(idBytes);
    // Replace standard Base64 characters with URL-safe ones and remove padding
    return id.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64DecodeToUint8Array(input: string): Uint8Array {
    const binaryString = atob(input);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function bytesToBigInt(bytes: Uint8Array): bigint {
    let result = BigInt(0);
    for (const byte of bytes) {
        result = (result << BigInt(8)) | BigInt(byte);
    }
    return result;
}

function bigIntToBytes(num: bigint): Uint8Array {
    const hex = num.toString(16).padStart(2, '0');
    const len = hex.length / 2;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

function base64Encode(input: Uint8Array): string {
    const base64 = btoa(String.fromCharCode.apply(null, input as unknown as number[]));
    return base64;
}







// // We use the backend version to convert these.

// // Scion Conversions (should be 96-97 bits, so below the 100-bit limit)

// // Hash principal to a fixed-size number (returns a BigInt)
// function hashPrincipal(principal: string): bigint {
//     let hash = BigInt(0);
//     const prime = BigInt(31);
    
//     // Use a rolling hash function with prime numbers
//     for (let i = 0; i < principal.length; i++) {
//         hash = hash * prime + BigInt(principal.charCodeAt(i));
//     }
    
//     // Ensure positive and fixed size (64 bits)
//     return hash & ((BigInt(1) << BigInt(64)) - BigInt(1));
// }

// // Convert original number and principal to scion ID
// export function ogToScionId(ogNumber: bigint, principal: string): bigint {
//     // Get 64-bit hash of principal
//     const principalHash = hashPrincipal(principal);
    
//     // Shift principal hash left by 256 bits to ensure first 32 digits are unique
//     // This puts the principal-based uniqueness at the start
//     const shiftedHash = principalHash << BigInt(256);
    
//     // Combine with original number to ensure uniqueness across different ogNumbers
//     // XOR maintains reversibility while mixing the values
//     return shiftedHash ^ ogNumber;
// }

// // Convert scion ID back to original number and principal hash
// export function scionToOgId(scionId: bigint): [bigint, bigint] {
//     // Extract principal hash (first 64 bits after shifting right)
//     const principalHash = (scionId >> BigInt(256)) & ((BigInt(1) << BigInt(64)) - BigInt(1));
    
//     // Reconstruct original number using the same XOR operation
//     const ogNumber = scionId ^ (principalHash << BigInt(256));
    
//     return [ogNumber, principalHash];
// }