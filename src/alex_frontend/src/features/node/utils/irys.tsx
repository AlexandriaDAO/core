import { WebIrys } from "@irys/sdk";
import { TypedEthereumSigner } from "arbundles";
import { Wallet, ethers } from "ethers";


const getWallet = ()=>{
	const privateKey = process.env.ETH_PRIVATE_KEY;
	if (!privateKey) {
		throw new Error("Key is not defined");
	}
	const wallet = new ethers.Wallet(privateKey);

	return wallet
}


export const getSimpleWebIrys = async () => {

	const wallet = getWallet();

	// Assuming metamask is installed, handle case otherwise
	// let provider = ethers.getDefaultProvider();
	let provider = null;

    //@ts-ignore
	if (window.ethereum) {
		//@ts-ignore
		provider = new ethers.BrowserProvider(window.ethereum);
	}else{
		throw new Error("MetaMask not installed")
	}

	try{
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
	}catch(error){
		console.log(error);
	}

	throw new Error('Unable to connect to wallet')
};



// handle data should be signed in the backend with private key
export const getSigningWebIrys = async () => {

	const wallet = getWallet();

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
