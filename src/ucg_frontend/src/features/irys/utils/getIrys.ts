 /*
  // The Plan.

  When a user clicks on a named librarian, that queries their principal with this hash specifically to a helper function that populates these keys.
  */




  import { WebIrys } from "@irys/sdk";
  import { TypedEthereumSigner } from "arbundles";
  import { Buffer } from "buffer";
  
  const network = "mainnet";
  const token = "ethereum";
  
  const getIrys = async (): Promise<WebIrys> => {
    const cleanEnvVar = (envVar: string | undefined) => 
      envVar?.replace(/^'|';$/g, '') || '';

    const pubKey = cleanEnvVar(process.env.ETH_PUBLIC_KEY);
    const privateKey = cleanEnvVar(process.env.ETH_PRIVATE_KEY);
    // const pubKey = "0xeDa20F6d64944Ad132dE51927Ae1A32cFCDD8998";
    // const privateKey = "1bda3c9bf8b1170093b4339835c01273766f30ec64077c07a7e174b0f67c5636";
  
    // const pubKey = "0x738b58fe508189A237427e69163bB7E2cd91C38c";
    // const privateKey = "0x54d8a539123e15c56028557bff8b0704728138fdc04c04363374ca80efa16084";

    if (typeof pubKey !== 'string' || typeof privateKey !== 'string') {
      throw new Error('ETH_PUBLIC_KEY or ETH_PRIVATE_KEY is not defined or is not a string');
    }
  
    const signer = new TypedEthereumSigner(privateKey);
  
    const provider = {
      getPublicKey: async (): Promise<Buffer> => {
        return Buffer.from(pubKey, "hex");
      },
      getSigner: () => {
        return {
          getAddress: (): string => pubKey,
          _signTypedData: async (
            _domain: never,
            _types: never,
            message: { address: string; "Transaction hash": Uint8Array },
          ): Promise<string> => {
            const convertedMsg = Buffer.from(message["Transaction hash"]);
            const signature = await signer.sign(convertedMsg);
            const bSig = Buffer.from(signature);
            const pad = Buffer.concat([Buffer.from([0]), Buffer.from(bSig)]).toString("hex");
            return pad;
          },
        };
      },
      _ready: (): void => {},
    };
  
    const wallet = { name: "ethersv5", provider: provider };
    const irys = new WebIrys({ network, token, wallet });
  
    await irys.ready();
  
    return irys;
  };
  
  export default getIrys;