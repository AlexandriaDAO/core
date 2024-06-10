import { WebIrys } from "@irys/sdk";
// import { providers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

import BigNumber from "bignumber.js";
import getRpcUrl from "./getRpcUrl";

interface WindowWithEthereum extends Window {
	ethereum?: any;
}

/**
 * Creates a new Irys object with the specified configuration.
 *
 * @param {string} url - The Irys network URL.
 * @param {string} currency - The currency to use (e.g., "matic").
 * @param {string} providerUrl - The provider URL for the Ethereum network.
 * @returns {Promise<WebIrys>} - A reference to the initialized Irys object.
 */
const getIrys = async (
	network: string = process.env.NEXT_PUBLIC_NETWORK || "devnet",
	token: string = process.env.NEXT_PUBLIC_TOKEN || "",
	providerUrl: string = process.env.PROVIDER_URL || "https://ethereum-sepolia-rpc.publicnode.com",
): Promise<WebIrys> => {
	await (window as WindowWithEthereum).ethereum.enable();
	// const provider = new providers.Web3Provider((window as WindowWithEthereum).ethereum);
	const provider = new JsonRpcProvider(providerUrl);
	const wallet = { name: "ethersv5", provider: provider };
	const webIrys = new WebIrys({ network, token, wallet });
	await webIrys.ready();

	console.log(`Connected to webIrys from ${webIrys.address}`);
	return webIrys;
};

export default getIrys;




// import { WebIrys } from "@irys/sdk";

// interface WindowWithEthereum extends Window {
//   ethereum?: any;
// }

// /**
//  * Creates a new Irys object with the specified configuration.
//  *
//  * @param {string} network - The Irys network (e.g., "devnet").
//  * @param {string} token - The token to use (e.g., "ethereum").
//  * @param {string} providerUrl - The provider URL for the Ethereum network.
//  * @returns {Promise<WebIrys>} - A reference to the initialized Irys object.
//  */
// const getIrys = async (
//   network: string = process.env.NEXT_PUBLIC_NETWORK || "devnet",
//   token: string = process.env.NEXT_PUBLIC_TOKEN || "",
//   providerUrl: string = process.env.NEXT_PUBLIC_PROVIDER_URL || ""
// ): Promise<WebIrys> => {
//   await (window as WindowWithEthereum).ethereum.enable();
//   const webIrys = new WebIrys({ network, token, config: { providerUrl } });
//   await webIrys.ready();

//   console.log(`Connected to webIrys from ${webIrys.address}`);
//   return webIrys;
// };

// export default getIrys;