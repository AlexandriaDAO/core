// import { WebIrys } from "@irys/sdk";
// import { TypedEthereumSigner } from "arbundles";
// import { useKeys } from "../../../contexts/KeysContext";

// const getIrys = async () => {
//   const network = "mainnet";
//   const token = "ethereum";

//   const { Keys } = useKeys();

//   if (!Keys) {
//     throw new Error("No decrypted user keys available");
//   }
//   console.log("Some keys were detected and here they are: ", Keys)

//   const pubKey = Keys.publicKey;
//   const privateKey = Keys.privateKey;

//   const signer = new TypedEthereumSigner(privateKey);

//   const provider = {
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
//           const signature = await signer.sign(convertedMsg);
//           const bSig = Buffer.from(signature);
//           const pad = Buffer.concat([Buffer.from([0]), Buffer.from(bSig)]).toString("hex");
//           return pad;
//         },
//       };
//     },
//     _ready: () => {},
//   };

//   const wallet = { name: "ethersv5", provider: provider };
//   const irys = new WebIrys({ network, token, wallet });

//   await irys.ready();

//   return irys;
// };

// export default getIrys;






















import { WebIrys } from "@irys/sdk";
import { TypedEthereumSigner } from "arbundles";
// import { ethers } from "ethers";

const getIrys = async () => {
  const network = "devnet";
  const token = "ethereum";

  /*
  // The Plan.

  When a user clicks on a named librarian, that queries their principal with this hash specifically to a helper function that populates these keys.
  */
  // const pubKey = "0xeDa20F6d64944Ad132dE51927Ae1A32cFCDD8998";
  // const privateKey = "1bda3c9bf8b1170093b4339835c01273766f30ec64077c07a7e174b0f67c5636";

  const pubKey = "0x738b58fe508189A237427e69163bB7E2cd91C38c";
  const privateKey = "0x54d8a539123e15c56028557bff8b0704728138fdc04c04363374ca80efa16084";

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