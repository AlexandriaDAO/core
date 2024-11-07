export function arweaveIdToNat(arweaveId: string): bigint {
    // Remove any potential extra character and padding
    let id = arweaveId.slice(0, 43);

    // Add padding if necessary
    while (id.length % 4 !== 0) {
        id += '=';
    }

    // Replace URL-safe characters
    id = id.replace(/-/g, '+').replace(/_/g, '/');

    // Decode Base64 to Uint8Array
    const idBytes = base64DecodeToUint8Array(id);

    // Convert Uint8Array to BigInt
    return bytesToBigInt(idBytes);
}

export function natToArweaveId(num: bigint): string {
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















// // Scion version:

// Hash function for the principal to create a smaller fingerprint
function hashPrincipal(principal: string): bigint {
    let hash = BigInt(0);
    const prime = BigInt(31);
    
    for (let i = 0; i < principal.length; i++) {
        hash = (hash * prime + BigInt(principal.charCodeAt(i))) & ((BigInt(1) << BigInt(32)) - BigInt(1));
    }
    
    return hash;
}

export function ogToScionId(ogNum: bigint, principal: string): bigint {
    // Get a 32-bit hash of the principal
    const principalHash = hashPrincipal(principal);
    
    // XOR the principalHash with the first 32 bits of ogNum
    const firstPart = ogNum >> BigInt(ogNum.toString(2).length - 32);
    const xoredPart = firstPart ^ principalHash;
    
    // Reconstruct the number with the XORed first part
    const restMask = (BigInt(1) << BigInt(ogNum.toString(2).length - 32)) - BigInt(1);
    const restPart = ogNum & restMask;
    const maskedOgNum = (xoredPart << BigInt(ogNum.toString(2).length - 32)) | restPart;
    
    // Combine with hash as before
    const scionId = (maskedOgNum << BigInt(32)) | principalHash;
    
    return scionId;
}

export function scionToOgId(scionId: bigint): [bigint, bigint] {
    // Extract the original number and principal hash
    const principalHash = scionId & ((BigInt(1) << BigInt(32)) - BigInt(1));
    const maskedOgNum = scionId >> BigInt(32);
    
    // Get the length of the masked number
    const maskedLength = maskedOgNum.toString(2).length;
    
    // Extract and un-XOR the first part
    const firstPart = maskedOgNum >> BigInt(maskedLength - 32);
    const originalFirstPart = firstPart ^ principalHash;
    
    // Reconstruct the original number
    const restMask = (BigInt(1) << BigInt(maskedLength - 32)) - BigInt(1);
    const restPart = maskedOgNum & restMask;
    const ogNum = (originalFirstPart << BigInt(maskedLength - 32)) | restPart;
    
    return [ogNum, principalHash];
}

// Helper function to verify a scion belongs to a principal
export function verifyScionOwnership(scionId: bigint, principal: string): boolean {
    const [_, storedPrincipalHash] = scionToOgId(scionId);
    const calculatedPrincipalHash = hashPrincipal(principal);
    
    return storedPrincipalHash === calculatedPrincipalHash;
}

// Example demonstrations
export function demonstrateConversions() {
    const examples = [
        {
            ogNumber: BigInt("12365768980998987654657687980909089786755678798090"),
            principal: "aaaaa-aa"
        },
        {
            ogNumber: BigInt("12365768980998987654657687980909089786755678798090"),
            principal: "2vxsx-fae"
        },
        {
            ogNumber: BigInt("12365768980998987654657687980909089786755678798090"),
            principal: "rrkah-fqaaa-aaaaa-aaaaq-cai"
        },
        {
            ogNumber: BigInt("412365768980998987654657687980909089786755678798090"),
            principal: "rrkah-fqaaa-aaaaa-aaaaq-cai"
        }
    ];

    for (const example of examples) {
        const scionId = ogToScionId(example.ogNumber, example.principal);
        const [recoveredOgNum, principalHash] = scionToOgId(scionId);
        
        console.log("\nExample:");
        console.log(`Principal: ${example.principal}`);
        console.log(`Principal Hash: ${hashPrincipal(example.principal)}`);
        console.log(`Original Number: ${example.ogNumber}`);
        console.log(`Scion ID: ${scionId}`);
        console.log(`Recovered Original Number: ${recoveredOgNum}`);
        console.log(`Is Valid: ${example.ogNumber === recoveredOgNum}`);
    }
}