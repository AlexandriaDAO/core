import { WebIrys } from "@irys/sdk";
import { TypedEthereumSigner } from "arbundles";
import { ethers } from "ethers";

const getIrys = async () => {
  const network = "devnet";
  const token = "ethereum";
  const pubKey = "0xeDa20F6d64944Ad132dE51927Ae1A32cFCDD8998";
  const privateKey = "1bda3c9bf8b1170093b4339835c01273766f30ec64077c07a7e174b0f67c5636";

  const signer = new TypedEthereumSigner(privateKey);

  const provider = {
    getPublicKey: async () => {
      return Buffer.from(pubKey, "hex");
    },
    getSigner: () => {
      return {
        getAddress: () => pubKey,
        _signTypedData: async (
          _domain: never,
          _types: never,
          message: { address: string; "Transaction hash": Uint8Array },
        ) => {
          const convertedMsg = Buffer.from(message["Transaction hash"]);
          const signature = await signer.sign(convertedMsg);
          const bSig = Buffer.from(signature);
          const pad = Buffer.concat([Buffer.from([0]), Buffer.from(bSig)]).toString("hex");
          return pad;
        },
      };
    },
    _ready: () => {},
  };

  const wallet = { name: "ethersv5", provider: provider };
  const irys = new WebIrys({ network, token, wallet });

  await irys.ready();

  return irys;
};

export default getIrys;
























// import Irys from "@irys/sdk";

// const getIrys = async () => {
// 	const network = "devnet";
//   const url = "https://devnet.irys.xyz";
// 	const providerUrl = "https://ethereum-sepolia-rpc.publicnode.com";
//   const token = "ethereum";
// 	const ETH_KEY = "1bda3c9bf8b1170093b4339835c01273766f30ec64077c07a7e174b0f67c5636";

//   const irys = new Irys({
//     url,
//     network, // "mainnet" || "devnet"
//     token, // Token used for payment
//     key: ETH_KEY, // Private key
//     config: { providerUrl }, // Optional provider URL, only required when using Devnet
//   });
//   return irys;
// };

// export default getIrys;























// import { WebIrys } from "@irys/sdk";
// // import { providers } from "ethers";
// import { JsonRpcProvider } from "@ethersproject/providers";

// // import BigNumber from "bignumber.js";
// // import getRpcUrl from "./getRpcUrl";

// //@ts-ignore
// interface WindowWithEthereum extends Window {
// 	ethereum?: any;
// }

// /**
//  * Creates a new Irys object with the specified configuration.
//  *
//  * @param {string} url - The Irys network URL.
//  * @param {string} currency - The currency to use (e.g., "matic").
//  * @param {string} providerUrl - The provider URL for the Ethereum network.
//  * @returns {Promise<WebIrys>} - A reference to the initialized Irys object.
//  */
// const getIrys = async (
// 	network: string = process.env.NEXT_PUBLIC_NETWORK || "devnet",
// 	token: string = process.env.NEXT_PUBLIC_TOKEN || "",
// 	providerUrl: string = process.env.PROVIDER_URL || "https://ethereum-sepolia-rpc.publicnode.com",
// ): Promise<WebIrys> => {
// 	await (window as WindowWithEthereum).ethereum.enable();
// 	// const provider = new providers.Web3Provider((window as WindowWithEthereum).ethereum);
// 	const provider = new JsonRpcProvider(providerUrl);
// 	const wallet = { name: "ethersv5", provider: provider };
// 	const webIrys = new WebIrys({ network, token, wallet });
// 	await webIrys.ready();

// 	console.log(`Connected to webIrys from ${webIrys.address}`);
// 	return webIrys;
// };

// export default getIrys;










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