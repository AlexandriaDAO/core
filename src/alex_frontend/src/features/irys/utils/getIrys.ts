 /*
  // The Plan.

  When a user clicks on a named librarian, that queries their principal with this hash specifically to a helper function that populates these keys.
  */




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

    // const pubKey = cleanEnvVar("0xeDa20F6d64944Ad1s32dE51927Ae1A32cFCDD8998");
    // const privateKey = cleanEnvVar("1bda3c9bf8b1170093b4339835c01273766f30ec64077c07a7e174b0f67c5636");
  
    // const pubKey = cleanEnvVar("0x738b58fe508189A237427e69163bB7E2cd91C38c");
    // const privateKey = cleanEnvVar("0x54d8a539123e15c56028557bff8b0704728138fdc04c04363374ca80efa16084");

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