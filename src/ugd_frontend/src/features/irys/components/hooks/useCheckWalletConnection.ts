// useCheckWalletConnection.ts
import { useState, useEffect } from "react";
import { ethers } from "ethers";

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

	useEffect(() => {
		console.log("checkConnection 1");

		const checkConnection = async () => {
			console.log("checkConnection 2");
			if (await checkEthersConnection()) return;
			// if (await checkSolanaConnection()) return;
			// await checkNearConnection();
		};

		checkConnection();
	}, []);

	return [connected, provider, address, blockchain];
};

export default useCheckWalletConnection;














// // useCheckWalletConnection.ts
// import { useState, useEffect } from "react";
// import { ethers } from "ethers";

// const useCheckWalletConnection = (): [boolean, any, string | null, string] => {
//   const [connected, setConnected] = useState<boolean>(false);
//   const [provider, setProvider] = useState<any>(null);
//   const [address, setAddress] = useState<string | null>(null);
//   const [blockchain, setBlockchain] = useState<string>("");

//   const checkEthersConnection = async () => {
//     try {
//       // Replace this with your desired private key
//       const privateKey = "YOUR_PRIVATE_KEY_HERE";

//       // Create a new ethers.Wallet instance with the private key
//       const wallet = new ethers.Wallet(privateKey);

//       // Connect the wallet to a provider (you can use a default provider or specify your own)
//       const ethProvider = new ethers.providers.JsonRpcProvider();
//       const connectedWallet = wallet.connect(ethProvider);

//       setConnected(true);
//       setProvider(ethProvider);
//       setAddress(connectedWallet.address);
//       setBlockchain("EVM");
//       return true; // Connected
//     } catch (error) {
//       console.error("Error connecting with private key:", error);
//     }
//     return false; // Not connected
//   };

//   useEffect(() => {
//     console.log("checkConnection 1");

//     const checkConnection = async () => {
//       console.log("checkConnection 2");
//       await checkEthersConnection();
//     };

//     checkConnection();
//   }, []);

//   return [connected, provider, address, blockchain];
// };

// export default useCheckWalletConnection;