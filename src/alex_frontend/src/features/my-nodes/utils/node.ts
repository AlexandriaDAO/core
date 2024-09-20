import { Principal } from "@dfinity/principal";
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/vetkd/vetkd.did';


export const shorten = (
	text: string,
	startLength: number = 6,
	endLength: number = 4
): string => {
	if (text.length <= startLength + endLength) {
		return text;
	}
	return `${text.slice(0, startLength)}...${text.slice(-endLength)}`;
};


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



export const ibe_decrypt =	 async(actor: ActorSubclass<_SERVICE>, encoded:string)=> {
	const vetkd = await import('ic-vetkd-utils');

	const frontend_canister_id = process.env.CANISTER_ID_ALEX_FRONTEND!;

	const tsk_seed = window.crypto.getRandomValues(new Uint8Array(32));
	const tsk = new vetkd.TransportSecretKey(tsk_seed);

	const ek_bytes_hex = await actor.encrypted_ibe_decryption_key(tsk.public_key());

	const pk_bytes_hex = await actor.encryption_key();

	const k_bytes = tsk.decrypt(
		hexDecode(ek_bytes_hex),
		hexDecode(pk_bytes_hex),
		Principal.fromText(frontend_canister_id).toUint8Array()
	);

	const ibe_ciphertext = vetkd.IBECiphertext.deserialize(hexDecode(encoded));
	const ibe_plaintext = ibe_ciphertext.decrypt(k_bytes);
	const decoded = new TextDecoder().decode(ibe_plaintext);

	return decoded;
}

const alex_wallet_canister_id = process.env.CANISTER_ID_ALEX_WALLET!;

export const ibe_encrypt = async(actor: ActorSubclass<_SERVICE>, message:string, receiver:string = alex_wallet_canister_id)=> {
	if(message.length == 0) throw new Error("Message is empty");

	const vetkd = await import('ic-vetkd-utils');

	const pk_bytes_hex = await actor.encryption_key();

	const message_encoded = new TextEncoder().encode(message);
	const seed = window.crypto.getRandomValues(new Uint8Array(32));

	let ibe_principal = Principal.fromText(receiver);

	const ibe_ciphertext = vetkd.IBECiphertext.encrypt(
		hexDecode(pk_bytes_hex),
		ibe_principal.toUint8Array(),
		message_encoded,
		seed
	);

	const encoded = hexEncode(ibe_ciphertext.serialize());

	return encoded;
}