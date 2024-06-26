import { ActorSubclass } from "@dfinity/agent";
import {
	Node,
	_SERVICE,
} from "../../../../../declarations/ucg_backend/ucg_backend.did";
import { createAsyncThunk } from "@reduxjs/toolkit";

export enum NodeStatus {
    InActive = 0,
    Active = 1,
}

// Define an interface for the node parameters based on the Yup validation schema
interface NodeInput {
	pvt_key: string;
	pub_key: string;
	status?: NodeStatus; // Optional since it's not enforced by 'required' in Yup
}

// Define the async thunk
const addNode = createAsyncThunk<
	Node, // This is the return type of the thunk's payload
	{
		actor: ActorSubclass<_SERVICE>;
		node: NodeInput;
	}, //Argument that we pass to initialize
	{ rejectValue: string }
>(
	"myNodes/addNode",
	async (
		{
			actor,
			node: { pvt_key, pub_key, status = NodeStatus.Active  },
		},
		{ rejectWithValue }
	) => {
		try {
			const result = await actor.add_my_node(pvt_key, pub_key, [status]);

            if('Ok' in result) return result.Ok;

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
