import { WalletConnection, connect, keyStores } from "near-api-js";

import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { WebIrys } from "@irys/sdk";
import { ethers } from "ethers";

const etherIrys = async () => {
	// @ts-ignore
	const provider = new ethers.BrowserProvider(window.ethereum);
	await provider.getSigner();
	const irys = new WebIrys({
		network: process.env.NEXT_PUBLIC_NETWORK || "devnet",
		token: process.env.NEXT_PUBLIC_TOKEN || "ethereum",
		wallet: { provider, name: "ethersv6" },
	});
	await irys.ready();

	return irys;
};

const phantomIrys = async () => {
  //@ts-ignore
	await window.solana.connect();
	const provider = new PhantomWalletAdapter();
	await provider.connect();
	const network = process.env.NEXT_PUBLIC_NETWORK;
	let wallet;

	if (network === "devnet") {
		wallet = { rpcUrl: process.env.NEXT_PUBLIC_RPC_SOLANA, name: "solana", provider };
	} else {
		wallet = { name: "solana", provider };
	}

	const webIrys = new WebIrys({
		network: process.env.NEXT_PUBLIC_NETWORK || "devnet",
		token: "solana",
		wallet,
	});
	await webIrys.ready();

	return webIrys;
};

const rainbowKitIrys = async () => {
  console.log("rainbowKitIrys 0");
  
	//@ts-ignore
	const provider = new ethers.BrowserProvider(window.ethereum);
	console.log("rainbowKitIrys 1 provider=", provider);

	const irys = new WebIrys({
		network: process.env.NEXT_PUBLIC_NETWORK || "devnet",
		token: process.env.NEXT_PUBLIC_TOKEN || "ethereum",
		wallet: { provider: provider, name: "rainbowkitv2" },
	});
	console.log("rainbowKitIrys 2 ");

	irys.tokenConfig.getFee = async (): Promise<any> => {
		return 0;
	};

	await irys.ready();
	console.log("rainbowKitIrys 3 irys=", irys);

	return irys;
};

const nearIrys = async () => {
	const config = {
		networkId: "mainnet",
		keyStore: new keyStores.BrowserLocalStorageKeyStore(),
		nodeUrl: "https://rpc.mainnet.near.org",
		walletUrl: "https://wallet.mainnet.near.org",
		helperUrl: "https://helper.mainnet.near.org",
		explorerUrl: "https://explorer.mainnet.near.org",
		headers: {},
	};
	const near = await connect(config);
	const wallet = new WalletConnection(near, "bundlr");
	wallet.requestSignIn({
		contractId: "",
	});

	const irys = new WebIrys({
		network: process.env.NEXT_PUBLIC_NETWORK || "devnet",
		token: "near",
		wallet: { provider: wallet },
	});
	await irys.ready();
	return irys;
};

const walletConnectIrys = async () => {
	const connector = await new WalletConnectProvider({
		rpc: "https://cloudflare-eth.com/",
	});
	await connector.enable();
	const provider = new ethers.BrowserProvider(connector);

	const irys = new WebIrys({
		network: process.env.NEXT_PUBLIC_NETWORK || "devnet",
		token: process.env.NEXT_PUBLIC_TOKEN || "ethereum",
		wallet: { provider },
	});
	await irys.ready();
	return irys;
};

export { etherIrys, phantomIrys, rainbowKitIrys, nearIrys, walletConnectIrys };
