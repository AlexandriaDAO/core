  import { WebIrys } from "@irys/sdk";
  import { TypedEthereumSigner } from "arbundles";
  import { Buffer } from "buffer";
  import { ActorSubclass } from '@dfinity/agent';
  import { _SERVICE } from '../../../../../declarations/alex_wallet/alex_wallet.did';
  
  
  const network = process.env.DFX_NETWORK === "ic" ? "mainnet":"devnet";
  const token = "ethereum";

  const getIrys = async (): Promise<WebIrys> => {
    const cleanEnvVar = (envVar: string | undefined) => 
      envVar?.replace(/^'|';$/g, '') || '';

    const pubKey = cleanEnvVar(process.env.ETH_PUBLIC_KEY);
    const privateKey = cleanEnvVar(process.env.ETH_PRIVATE_KEY);

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
            //@ts-ignore
            const signature = await signer.sign(convertedMsg);
            const bSig = Buffer.from(signature);
            //@ts-ignore
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
