import { caller, IDL, init, postUpgrade, Principal, query, toHexString, update, call } from 'azle';
import { TypedEthereumSigner } from "arbundles";
import { Canister, ic, Result, Void } from 'azle/experimental';
import { Node as TypeNode } from '../../../src/declarations/alex_librarian/alex_librarian.did';

const librarianPrincipal = Principal.fromText('aax3a-h4aaa-aaaaa-qaahq-cai');
const vetkdPrincipal = Principal.fromText('a4tbr-q4aaa-aaaaa-qaafq-cai');

// Define the Node struct
const CandidNode = IDL.Record({
    id: IDL.Text,
    status: IDL.Variant({
      Active: IDL.Null,
      InActive: IDL.Null
    }),
    owner: IDL.Text,
    pvt_key: IDL.Text
});


// Ensure given variable is a valid string
function ensureString($variable:any){
    if (typeof $variable !== 'string' || $variable.length === 0) {
        throw new Error(`${$variable} must be a valid string`);
    }
}



async function getNode(node_id: string): Promise<TypeNode> {
    ensureString(node_id);

    // Call the get_node_by_id function of alex_librarian
    const node = await call(
        librarianPrincipal,
        'get_node_by_id',
        {
            paramIdlTypes: [IDL.Text],
            returnIdlType: IDL.Opt(CandidNode),
            args: [node_id],
        },
    );
    console.log(node,'node');

    // Handle the response
    if (!node || !Array.isArray(node) || node.length === 0 ) throw new Error('Node not Found');

    return node[0];
}


async function decryptKey(encodedKey: string): Promise<string> {
    ensureString(encodedKey);

    // Call the decrypt_ibe_message function
    const result = await call(
        vetkdPrincipal,
        'wbe_decrypt',
        {
            paramIdlTypes: [IDL.Text],
            returnIdlType: IDL.Variant({
                Ok: IDL.Text,
                Err: IDL.Text
            }),
            args: [encodedKey],
        },
    );

    console.log('Result from wbe_decrypt:', result);

    // Type guard to check the shape of the result
    if (typeof result === 'object' && 'Err' in result ) throw new Error("Unable to decrypt wallet");

    if (typeof result === 'object' && 'Ok' in result ) return result.Ok;

    // If the result doesn't match expected shape, throw an error
    throw new Error('Unexpected decryption result');
}


async function getSigner(node_id: string){
    const node:TypeNode = await getNode(node_id);

    const key = await decryptKey(node.pvt_key);

    ensureString(key)

    return new TypedEthereumSigner(key)
}

export default class {
    message: string = 'Hello world!';


    @query([], IDL.Text)
    getMessage(): string {
        return this.message
    }

    @update([IDL.Text])
    setMessage(message: string): void {
        this.message = message;
    }

    @query([], IDL.Bool)
    isUserAnonymous(): boolean {
        if (caller().toText() === '2vxsx-fae') {
            return true;
        } else {
            return false;
        }
    }

    @update([IDL.Text], IDL.Variant({
        Ok: IDL.Text,
        Err: IDL.Text
    }))
    async pubKey(node_id: string): Promise<Result<string, string>> {
        try {

            const signer = await getSigner(node_id);

            const public_key = signer.publicKey.toString();

            // Return the public key in the expected format
            return { Ok: public_key };
        } catch (error) {
            // Handle the error and return it
            console.log('Error getting public key: ', error);
            return { Err: `Error getting public key: ${error instanceof Error ? error.message : String(error)}` };
        }
     }


    // @update([IDL.Text], IDL.Variant({
    //     Ok: IDL.Text,
    //     Err: IDL.Text
    // }))
    // async signData(txHash: string, node_id: string ): Promise<Result<string, string>> {
    //     try {
    //         ensureString(txHash)
    //         const signer = await getSigner(node_id);

    //         const convertedMsg = Buffer.from(txHash);
    //         const signature = await signer.sign(convertedMsg);
    //         const bSig = Buffer.from(signature);
    //         const pad = Buffer.concat([Buffer.from([0]), Buffer.from(bSig)]).toString("hex");

    //         // Return the signature with no error
    //         return { Ok: pad };
    //     } catch (error) {
    //         // Handle the error and return it
    //         console.log('Error Signing: ', error);
    //         return { Err: `Error Signing: ${error instanceof Error ? error.message : String(error)}` };
    //     }
    // }
}