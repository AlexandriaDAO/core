// useCheckWalletConnection.ts
import { useState, useEffect } from "react";
import { ethers } from "ethers";
// import { connect, WalletConnection, keyStores } from "near-api-js";

declare global {
	interface Window {
		ethereum: any;
		solana: any;
	}
}

const useCheckWalletConnection = (): [boolean, any, string | null, string] => {
	const [connected, setConnected] = useState<boolean>(false);
	const [provider, setProvider] = useState<any>(null);
	const [address, setAddress] = useState<string | null>(null);
	const [blockchain, setBlockchain] = useState<string>("");

	const checkEthersConnection = async () => {
		try {
			if (window.ethereum) {
				//@ts-ignore
				const ethProvider = new ethers.BrowserProvider(window.ethereum);
				const accounts = await ethProvider.listAccounts();

				if (accounts.length > 0) {
					setConnected(true);
					setProvider(ethProvider);
					setAddress(accounts[0].address);
					setBlockchain("EVM");
					return true; // Connected
				}
			}
		} catch (error) {
			console.error("Error checking Ethereum wallet connection:", error);
		}
		return false; // Not connected
	};

	// Check Solana
	const checkSolanaConnection = async () => {
		try {
			if (window.solana && window.solana.isPhantom) {
				// Attempt to connect (this is just a placeholder - adapt based on your Solana logic)
				const response = await window.solana.connect({ onlyIfTrusted: true });
				if (response.publicKey) {
					setConnected(true);
					setProvider(window.solana);
					setAddress(response.publicKey.toString());
					setBlockchain("Solana");
					return true;
				}
			}
		} catch (error) {
			console.error("Error checking Solana wallet connection:", error);
		}
		return false;
	};

	// Placeholder for NEAR connection check
	// const checkNearConnection = async () => {
	// 	try {
	// 		// Add NEAR connection logic here
	// 		// Example: Connect and check if signed in
	// 		const config = {
	// 			networkId: "mainnet",
	// 			keyStore: new keyStores.BrowserLocalStorageKeyStore(),
	// 			nodeUrl: "https://rpc.mainnet.near.org",
	// 			walletUrl: "https://wallet.mainnet.near.org",
	// 			helperUrl: "https://helper.mainnet.near.org",
	// 			explorerUrl: "https://explorer.mainnet.near.org",
	// 		};
	// 		const near = await connect(config);
	// 		const wallet = new WalletConnection(near, null);
	// 		if (wallet.isSignedIn()) {
	// 			setConnected(true);
	// 			setProvider(wallet);
	// 			setAddress(wallet.getAccountId());
	// 			setBlockchain("NEAR");
	// 			return true;
	// 		}
	// 	} catch (error) {
	// 		console.error("Error checking NEAR wallet connection:", error);
	// 	}
	// 	return false;
	// };

	useEffect(() => {
		console.log("checkConnection 1");

		const checkConnection = async () => {
			console.log("checkConnection 2");
			if (await checkEthersConnection()) return;
			if (await checkSolanaConnection()) return;
			// await checkNearConnection();
		};

		checkConnection();
	}, []);

	return [connected, provider, address, blockchain];
};

export default useCheckWalletConnection;
