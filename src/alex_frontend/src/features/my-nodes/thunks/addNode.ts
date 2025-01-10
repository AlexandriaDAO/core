import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../declarations/user/user.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ibe_encrypt } from "@/services/vetkdService";
import { SerializedNode } from "../myNodesSlice";
import { serializeNode } from "../utils";


// Define an interface for the node parameters based on the Yup validation schema
interface NodeInput {
	key: string;
	active: boolean; // Optional since it's not enforced by 'required' in Yup
}

// Define the async thunk
const addNode = createAsyncThunk<
	SerializedNode, // This is the return type of the thunk's payload
	{
		actor: ActorSubclass<_SERVICE>,
		input: NodeInput,
	},
	{ rejectValue: string }
>(
	"myNodes/addNode",
	async (
		{ actor, input: {key, active = true} },
		{ rejectWithValue }
	) => {
		try {
			const encrypted_key = await ibe_encrypt(key);

			const result = await actor.create_node({key: encrypted_key, active});

            if('Ok' in result) return serializeNode(result.Ok);

            if('Err' in result) throw new Error(result.Err)
		} catch (error) {
			console.error("Failed to Add Node:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue(
			"An unknown error occurred while adding Node"
		);
	}
);

export default addNode;