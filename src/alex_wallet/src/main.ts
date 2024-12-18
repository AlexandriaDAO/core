import { caller, IDL, Principal, query,  update, call } from 'azle';
import { TypedEthereumSigner } from "arbundles";
import { Result} from 'azle/experimental';
import { Node as TypeNode } from '../../../declarations/user/user.did';

const userPrincipal = Principal.fromText('yo4hu-nqaaa-aaaap-qkmoq-cai');
const vetkdPrincipal = Principal.fromText('5ham4-hqaaa-aaaap-qkmsq-cai');

// Define the Node struct
const CandidNode = IDL.Record({
    id: IDL.Nat64,
    key: IDL.Text,
    owner: IDL.Principal,
    active: IDL.Bool,
    created_at: IDL.Nat64,
    updated_at: IDL.Nat64
});


// Ensure given variable is a valid string
function ensureString($variable:any){
    if (typeof $variable !== 'string' || $variable.length === 0) {
        throw new Error(`${$variable} must be a valid string`);
    }
}



async function getNode(node_id: BigInt): Promise<TypeNode> {

    // Call the get_node_by_id function of user
    const result = await call(
        userPrincipal,
        'get_nodes',
        {
            paramIdlTypes: [IDL.Vec(IDL.Nat64)],
            returnIdlType: IDL.Variant({
                Ok: IDL.Vec(CandidNode),
                Err: IDL.Text
            }),
            args: [[node_id]],
        },
    );
    console.log(result,'node');

    // Handle the response
    if ('Err' in result) {
        throw new Error(result.Err);
    }

    if (!('Ok' in result) || !Array.isArray(result.Ok) || result.Ok.length === 0) {
        throw new Error('Node not Found');
    }

    return result.Ok[0];
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


async function getSigner(node_id: BigInt){
    const node:TypeNode = await getNode(node_id);

    const key = await decryptKey(node.key);

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

    @update([IDL.Nat64], IDL.Variant({
        Ok: IDL.Text,
        Err: IDL.Text
    }))
    async pubKey(node_id: BigInt): Promise<Result<string, string>> {
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


    @update([IDL.Text, IDL.Nat64], IDL.Variant({
        Ok: IDL.Text,
        Err: IDL.Text
    }))
    async signData(txHash: string, node_id: BigInt ): Promise<Result<string, string>> {
        try {
            ensureString(txHash)
            const signer = await getSigner(node_id);

            console.log('signer', signer);
            const convertedMsg = Buffer.from(txHash, 'hex');
            const signature = await signer.sign(convertedMsg);
            const bSig = Buffer.from(signature);
            const pad = Buffer.concat([Buffer.from([0]), Buffer.from(bSig)]).toString("hex");
            console.log('Signature: ', pad);

            // Return the signature with no error
            return { Ok: pad };
        } catch (error) {
            // Handle the error and return it
            console.log('Error Signing: ', error);
            return { Err: `Error Signing: ${error instanceof Error ? error.message : String(error)}` };
        }
    }
}