import { WebIrys } from "@irys/sdk";
import { TypedEthereumSigner } from "arbundles";
import { ethers } from "ethers";

const getIrys = async () => {
  const network = "mainnet";
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