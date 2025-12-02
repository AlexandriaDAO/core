export const hexDecode = (hexString: string): Uint8Array => {
	// Match pairs of hex characters and convert them to a Uint8Array
	const byteArray = hexString.match(/.{1,2}/g);
	if (!byteArray) {
		throw new Error("Invalid hex string");
	}
	return Uint8Array.from(byteArray.map((byte) => parseInt(byte, 16)));
};

export const hexEncode = (bytes: Uint8Array): string => {
	// Convert each byte to a hex string and concatenate
	return Array.from(bytes)
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
};