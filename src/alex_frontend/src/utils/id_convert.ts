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
