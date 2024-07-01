import { WebIrys } from "@irys/sdk";
import { TypedEthereumSigner } from "arbundles";
import { Wallet, ethers, computeAddress } from "ethers";
import { ec as EC } from 'elliptic';
import { ucg_backend} from "../../../../../declarations/ucg_backend";
import { Node } from "../../../../../declarations/ucg_backend/ucg_backend.did";
// Initialize the elliptic curve
const ec = new EC('secp256k1');

/**
 * Converts a public key (compressed or uncompressed) to an Ethereum address.
 * @param publicKey The public key in hexadecimal format.
 * @returns The Ethereum address corresponding to the public key.
 */
function publicKeyToAddress(publicKey: string): string {
    // Remove the '0x' prefix if it exists
    if (publicKey.startsWith('0x')) {
        publicKey = publicKey.slice(2);
    }

    let uncompressedPublicKey: string;

    if (publicKey.startsWith('02') || publicKey.startsWith('03')) {
        // Decompress the public key
        const key = ec.keyFromPublic(publicKey, 'hex');
        uncompressedPublicKey = key.getPublic().encode('hex', false).slice(2); // Remove the '04' prefix
    } else if (publicKey.startsWith('04')) {
        // The public key is already uncompressed
        uncompressedPublicKey = publicKey.slice(2); // Remove the '04' prefix
    } else {
        throw new Error("Invalid public key format");
    }

    // Compute the address
    const address = computeAddress('0x' + uncompressedPublicKey);
    return address;
}

export const getSimpleWebIrys = async (wallet: Wallet | null = null) => {
	if (!wallet) {
		console.error("A key is required");
		return null;
	}

	// Assuming metamask is installed, handle case otherwise
	//@ts-ignore
	const provider = new ethers.BrowserProvider(window.ethereum);

	const irys = new WebIrys({
		network: "devnet",
		token: "ethereum",
		wallet: {
			name: "ethersv6",
			provider,
		},
	});

	await irys.ready();

	return irys;
};



export const getSigningWebIrys = async (node_id: string = '') => {
	if (!node_id) {
		console.error("A ndoe is required");
		return null;
	}

	const result = await ucg_backend.get_node_by_id(node_id)

	let node: Node | undefined = undefined;

	if(result.length>0){
		node = result[0]
	}

	if(!node) return null;

	const wallet = new ethers.Wallet(node.pvt_key);

	const signer = new TypedEthereumSigner(wallet.privateKey);

	const provider = {
		getSigner: () => {
			return {
				getAddress: () => wallet.address,
				_signTypedData: async (
					_domain: never,
					_types: never,
					message: {
						address: string;
						"Transaction hash": Uint8Array;
					}
				) => {
					const convertedMsg = Buffer.from(
						message["Transaction hash"]
					);
					const signature = await signer.sign(convertedMsg);
					const bSig = Buffer.from(signature);
					const pad = Buffer.concat([
						Buffer.from([0]),
						Buffer.from(bSig),
					]).toString("hex");
					return pad;
				},
			};
		},
		_ready: () => {},
	};

	const irys = new WebIrys({
		network: "devnet",
		token: "ethereum",
		wallet: {
			name: "ethersv5",
			provider,
		},
	});
	await irys.ready();

	return irys;
};




// // handle data should be signed in the backend with private key
// export const getSigningWebIrysFormNode = async (node_id: string = '') => {
// 	if (!node_id) {
// 		console.error("A ndoe is required");
// 		return null;
// 	}

// 	const result = await ucg_backend.get_public_key_by_node_id(node_id)
// 	if('Err' in result) throw new Error(result.Err)

// 	let pub_key = 'Ok' in result ? result.Ok : '';

// 	console.log('pub_key', pub_key);

// 	const pubKey = Buffer.from(pub_key, "hex");

// 	console.log('address', publicKeyToAddress(pub_key));

// 	const signer = new TypedEthereumSigner('0x54d8a539123e15c56028557bff8b0704728138fdc04c04363374ca80efa16084');


// 	const provider = {
// 		// For EVM wallets
// 		getPublicKey: async () => {
// 			return pubKey;
// 		},
// 		getSigner: () => {
// 			return {
// 				getAddress: () => publicKeyToAddress(pub_key), // pubkey is address for TypedEthereumSigner
// 				_signTypedData: async (
// 					_domain: never,
// 					_types: never,
// 					message: {
// 						address: string;
// 						"Transaction hash": Uint8Array;
// 					}
// 				) => {
// 					console.log('message',message, message["Transaction hash"]);
// 					const convertedMsg = Buffer.from(message["Transaction hash"]);
// 					console.log('converted message', convertedMsg, convertedMsg.toString('hex'));

// 					// const signature_result = await ucg_backend.sign_data('1', convertedMsg);
// 					// if('Err' in signature_result) throw new Error(signature_result.Err)

// 					// let signature = 'Ok' in signature_result ? signature_result.Ok : '';

// 					const signature = await signer.sign(convertedMsg);
// 					console.log('signature', signature, signature.toString());

// 					const bSig = Buffer.from(signature);
// 					console.log('bSig', bSig);

// 					const pad = Buffer.concat([
// 						Buffer.from([0]),
// 						Buffer.from(bSig),
// 					]).toString("hex");
// 					console.log('pad', pad);
// 					return null;
// 					return pad;
// 				},
// 			};
// 		},
// 		_ready: () => {},
// 	};

// 	const irys = new WebIrys({
// 		network: "devnet",
// 		token: "ethereum",
// 		wallet: {
// 			name: "ethersv5",
// 			provider,
// 		},
// 	});

// 	await irys.ready();

// 	return irys;
// };
