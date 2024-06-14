import gaslessIrys from "./gaslessIrys";

type Tag = {
  name: string;
  value: string;
};

const gaslessFundAndUploadEVM = async (selectedFile: File, tags: Tag[]): Promise<string> => {
  const irys = await gaslessIrys();

  console.log("Uploading...");
  const tx = await irys.uploadFile(selectedFile, {
    tags,
  });
  console.log(`Uploaded successfully. https://gateway.irys.xyz/${tx.id}`);

  return tx.id;
};

const gaslessFundAndUpload = async (selectedFile: File, tags: Tag[], blockchain: "EVM" | "SOL"): Promise<string> => {
  let txId = "";
  switch (blockchain) {
    case "EVM":
      txId = await gaslessFundAndUploadEVM(selectedFile, tags);
      break;
    default:
      throw new Error("Unsupported blockchain");
  }
  return txId;
};

export default gaslessFundAndUpload;





// import { WebIrys } from "@irys/sdk";
// import getIrys from "./getIrys";
// import { TypedEthereumSigner } from "arbundles";

// // import { useAuth } from "../../../../contexts/AuthContext";
// // import { decryptKey } from './keyEncryption';

// type Tag = {
// 	name: string;
// 	value: string;
// };

// const gaslessFundAndUploadEVM = async (selectedFile: File, tags: Tag[]): Promise<string> => {
// 	const pubKey = "0xeDa20F6d64944Ad132dE51927Ae1A32cFCDD8998";
// 	const privateKey = "1bda3c9bf8b1170093b4339835c01273766f30ec64077c07a7e174b0f67c5636";
// 	const test_irys = await getIrys();
// 	console.log("Testing IRYS: ", test_irys);
//   //@ts-ignore
//   const signer = new TypedEthereumSigner(privateKey);

//   // Create a provider - this mimics the behaviour of the injected provider, i.e metamask
//   const provider = {
//     // For EVM wallets
//     getPublicKey: async () => {
//       return Buffer.from(pubKey, "hex");
//     },
//     getSigner: () => {
//       return {
//         getAddress: () => pubKey,
//         _signTypedData: async (
//           _domain: never,
//           _types: never,
//           message: { address: string; "Transaction hash": Uint8Array },
//         ) => {
//           const convertedMsg = Buffer.from(message["Transaction hash"]);
//           console.log("convertedMsg: ", convertedMsg.toString("hex"));

//           // Sign the data directly using the signer instance
//           const signature = await signer.sign(convertedMsg);
//           const bSig = Buffer.from(signature);

//           // Pad & convert so it's in the format the signer expects to have to convert from.
//           const pad = Buffer.concat([Buffer.from([0]), Buffer.from(bSig)]).toString("hex");
//           return pad;
//         },
//       };
//     },

// 		_ready: () => {},
// 	};

// 	console.log("Got provider=", provider);

//   // Create a new WebIrys object using the provider created with server info.
//   const network = "mainnet";
//   const token = "ethereum";

//   const wallet = { name: "ethersv5", provider: provider };
//   const irys = new WebIrys({ network, token, wallet });
	
//   const w3signer = await provider.getSigner();
//   const address = (await w3signer.getAddress()).toLowerCase();
//   await irys.ready();
	
//   console.log("Uploading...");
//   const tx = await irys.uploadFile(selectedFile, {
// 		tags,
//   });
//   console.log(`Uploaded successfully. https://gateway.irys.xyz/${tx.id}`);
	
//   return tx.id;
// };



// /**
//  * Uploads the selected file and tags after funding if necessary.
//  *
//  * @param {File} selectedFile - The file to be uploaded.
//  * @param {Tag[]} tags - An array of tags associated with the file.
//  * @returns {Promise<string>} - The transaction ID of the upload.
//  */
// const gaslessFundAndUpload = async (selectedFile: File, tags: Tag[], blockchain: "EVM" | "SOL"): Promise<string> => {
// 	let txId = "";
// 	switch (blockchain) {
// 		case "EVM":
// 			txId = await gaslessFundAndUploadEVM(selectedFile, tags);
// 			break;
// 		default:
// 			throw new Error("Unsupported blockchain");
// 	}
// 	return txId;
// };

// export default gaslessFundAndUpload;








































// import { WebIrys } from "@irys/sdk";
// // import getIrys from "./getIrys";
// import { TypedEthereumSigner } from "arbundles";

// // import { useAuth } from "../../../../contexts/AuthContext";
// // import { decryptKey } from './keyEncryption';

// type Tag = {
// 	name: string;
// 	value: string;
// };

// const gaslessFundAndUploadEVM = async (selectedFile: File, tags: Tag[]): Promise<string> => {
// 	const pubKey = "0xeDa20F6d64944Ad132dE51927Ae1A32cFCDD8998";
// 	const privateKey = "1bda3c9bf8b1170093b4339835c01273766f30ec64077c07a7e174b0f67c5636";

//   //@ts-ignore
//   const signer = new TypedEthereumSigner(privateKey);

//   // Create a provider - this mimics the behaviour of the injected provider, i.e metamask
//   const provider = {
//     // For EVM wallets
//     getPublicKey: async () => {
//       return Buffer.from(pubKey, "hex");
//     },
//     getSigner: () => {
//       return {
//         getAddress: () => pubKey,
//         _signTypedData: async (
//           _domain: never,
//           _types: never,
//           message: { address: string; "Transaction hash": Uint8Array },
//         ) => {
//           const convertedMsg = Buffer.from(message["Transaction hash"]);
//           console.log("convertedMsg: ", convertedMsg.toString("hex"));

//           // Sign the data directly using the signer instance
//           const signature = await signer.sign(convertedMsg);
//           const bSig = Buffer.from(signature);

//           // Pad & convert so it's in the format the signer expects to have to convert from.
//           const pad = Buffer.concat([Buffer.from([0]), Buffer.from(bSig)]).toString("hex");
//           return pad;
//         },
//       };
//     },

// 		_ready: () => {},
// 	};

// 	console.log("Got provider=", provider);

//   // Create a new WebIrys object using the provider created with server info.
//   const network = "mainnet";
//   const token = "ethereum";

//   const wallet = { name: "ethersv5", provider: provider };
//   const irys = new WebIrys({ network, token, wallet });

//   const w3signer = await provider.getSigner();
//   const address = (await w3signer.getAddress()).toLowerCase();
//   await irys.ready();

//   console.log("Uploading...");
//   const tx = await irys.uploadFile(selectedFile, {
//     tags,
//   });
//   console.log(`Uploaded successfully. https://gateway.irys.xyz/${tx.id}`);

//   return tx.id;
// };

// /**
//  * Uploads the selected file and tags after funding if necessary.
//  *
//  * @param {File} selectedFile - The file to be uploaded.
//  * @param {Tag[]} tags - An array of tags associated with the file.
//  * @returns {Promise<string>} - The transaction ID of the upload.
//  */
// const gaslessFundAndUpload = async (selectedFile: File, tags: Tag[], blockchain: "EVM" | "SOL"): Promise<string> => {
// 	let txId = "";
// 	switch (blockchain) {
// 		case "EVM":
// 			txId = await gaslessFundAndUploadEVM(selectedFile, tags);
// 			break;
// 		default:
// 			throw new Error("Unsupported blockchain");
// 	}
// 	return txId;
// };

// export default gaslessFundAndUpload;
