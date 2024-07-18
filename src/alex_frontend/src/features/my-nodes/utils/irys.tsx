import { WebIrys } from "@irys/sdk";
import { TypedEthereumSigner } from "arbundles";
import { Wallet, ethers } from "ethers";

export const getSimpleWebIrys = async (wallet: Wallet | null = null) => {
	if (!wallet) {
		console.error("A key is required");
		return null;
	}

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
			network: "mainnet",
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
export const getSigningWebIrys = async (wallet: Wallet | null = null) => {
	if (!wallet) {
		console.error("A key is required");
		return null;
	}

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
		network: "mainnet",
		token: "ethereum",
		wallet: {
			name: "ethersv5",
			provider,
		},
	});

	await irys.ready();

	return irys;
};
