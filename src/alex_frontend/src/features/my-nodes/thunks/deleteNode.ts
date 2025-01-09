import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../declarations/user/user.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SerializedNode } from "../myNodesSlice";

// Define the async thunk
const deleteNode = createAsyncThunk<
	boolean, // This is the return type of the thunk's payload
	{
		actor: ActorSubclass<_SERVICE>,
		node: SerializedNode,
	},
	{ rejectValue: string }
>( "myNodes/deleteNode", async ({ actor, node }, { rejectWithValue }) => {
		try {
			const result = await actor.delete_node(BigInt(node.id));

            if('Ok' in result) return true;

            if('Err' in result) throw new Error(result.Err)

            return false;
		} catch (error) {
			console.error("Failed to Delete Node:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue(
			"An unknown error occurred while deleting Node"
		);
	}
);

export default deleteNode;
