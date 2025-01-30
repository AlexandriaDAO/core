import { WebIrys } from "@irys/sdk";
import { ethers } from "ethers";
import { _SERVICE } from '../../../declarations/alex_wallet/alex_wallet.did';
import { getActorAlexWallet } from "@/features/auth/utils/authUtils";
import { SerializedNode } from "@/features/my-nodes/myNodesSlice";
import { ActorSubclass } from "@dfinity/agent";

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

export const getPublicKey = async (actor: ActorSubclass<_SERVICE>, node: SerializedNode) => {
    const pubKeyResponse = await actor.pubKey(BigInt(node.id));
    if ('Err' in pubKeyResponse) {
      throw new Error(`Error fetching public key: ${pubKeyResponse.Err}`);
    }
    return pubKeyResponse.Ok;
}

export const getServerIrys = async (node: SerializedNode, actor: ActorSubclass<_SERVICE>): Promise<WebIrys> => {
    // await actor.setMessage('msss')
    // console.log(await actor.getMessage(), await actor.isUserAnonymous());

    const public_key = await getPublicKey(actor, node);

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

              // Call the signTransaction method
              const result = await actor.signData(convertedMsg, BigInt(node.id));

              if ('Err' in result) {
                console.log('Error Occured', result.Err);
                throw new Error('Error while signing');
              }
              if('Ok' in result){
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

