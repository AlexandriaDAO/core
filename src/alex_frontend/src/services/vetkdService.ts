
import { Principal } from "@dfinity/principal";
import { hexDecode, hexEncode } from "@/utils/vetkd";
import { getActorVetkd } from "@/features/auth/utils/authUtils";

const frontend_canister_id = process.env.CANISTER_ID_ALEX_FRONTEND!;
const user_canister_id = process.env.CANISTER_ID_USER!;

export const ibe_decrypt =	 async(encoded:string, receiver:string = frontend_canister_id)=> {
	const vetkd = await import('ic-vetkd-utils');
	const actor = await getActorVetkd();

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
export const ibe_encrypt = async( message:string, receiver:string = user_canister_id)=> {
	if(message.length == 0) throw new Error("Message is empty");

	const vetkd = await import('ic-vetkd-utils');
	const actor = await getActorVetkd();

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