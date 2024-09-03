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



  export const getTypedIrys = async (actor: ActorSubclass<_SERVICE>, node: string|null = null): Promise<WebIrys> => {
    // node id of the selected node while uploading
    if (!node) {
      console.error("Please provide node");
      throw new Error('Node not provided');
    }

    // await actor.setMessage('msss')
    // console.log(await actor.getMessage(), await actor.isUserAnonymous());

    const pubKeyResponse = await actor.pubKey(node);
    if ('Err' in pubKeyResponse) {
      throw new Error(`Error fetching public key: ${pubKeyResponse.Err}`);
    }
    const public_key = pubKeyResponse.Ok;

    const provider = {
      getPublicKey: async (): Promise<Buffer> => {
        return Buffer.from(public_key, "hex");
      },
      getSigner: () => {
        return {
          getAddress: (): string => public_key,
          _signTypedData: async (
            _domain: never,
            _types: never,
            message: { address: string; "Transaction hash": Uint8Array },
          ): Promise<string> => {
              const convertedMsg = Buffer.from(message["Transaction hash"]).toString('hex')

              console.log('message',message, convertedMsg);

              // Call the signTransaction method
              const result = await actor.signData(convertedMsg, node);

              console.log('result',result);

              if ('Err' in result) {
                console.log('Error Occured', result.Err);
                throw new Error('Error while signing');
              }
              if('Ok' in result){
                console.log('Result Ok', result.Ok);
                return result.Ok
              }

              throw new Error('Unknown Error while signing'); // Handle the error appropriately
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