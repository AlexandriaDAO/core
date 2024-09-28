import { WebIrys } from "@irys/sdk";
import { ethers } from "ethers";
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../declarations/alex_wallet/alex_wallet.did';

const network = process.env.DFX_NETWORK === "ic" ? "mainnet":"devnet";
const token = "ethereum";

export const getClientIrys = async () => {
	// Assuming metamask is installed, handle case otherwise
	// let provider = ethers.getDefaultProvider();
	let provider = null;

    //@ts-ignore
	if (window.ethereum) {
		//@ts-ignore
		provider = new ethers.BrowserProvider(window.ethereum);
	}else{
		throw new Error("MetaMask not installed")
	}

	try{
		const irys = new WebIrys({
			network,
			token,
			wallet: {
				name: "ethersv6",
				provider,
			},
		});

		await irys.ready();

		return irys;
	}catch(error){
		console.log(error);
	}

	throw new Error('Unable to connect to wallet')
};

export const getServerIrys = async (actor: ActorSubclass<_SERVICE>, node: string|null = null): Promise<WebIrys> => {
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

              console.log('convertedMsg',convertedMsg);

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

	// irys.tokenConfig.getFee = async (): Promise<any> => {
	// 	return 0;
	// };

	await irys.ready();

	return irys;
};


export const getNodeBalance = async (irys: WebIrys) => {
	if(!irys) throw new Error('irys not initialized');

	const atomicBalance = await irys.getLoadedBalance();

	const convertedBalance = parseFloat(
		irys.utils.fromAtomic(atomicBalance).toString()
	);

	return convertedBalance;
};

