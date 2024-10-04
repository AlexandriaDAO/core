import { ActorSubclass } from "@dfinity/agent";
import {
	Node,
	_SERVICE as LibrarianService,
} from "../../../../../declarations/alex_librarian/alex_librarian.did";
import {
	_SERVICE as VetkdService,
} from "../../../../../declarations/vetkd/vetkd.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ibe_encrypt } from "@/services/vetkdService";
import { getActorAlexLibrarian } from "@/features/auth/utils/authUtils";

export enum NodeStatus {
    InActive = 0,
    Active = 1,
}

// Define an interface for the node parameters based on the Yup validation schema
interface NodeInput {
	pvt_key: string;
	status?: NodeStatus; // Optional since it's not enforced by 'required' in Yup
}

// Define the async thunk
const addNode = createAsyncThunk<
	Node, // This is the return type of the thunk's payload
	NodeInput,
	{ rejectValue: string }
>(
	"myNodes/addNode",
	async (
		{ pvt_key, status = NodeStatus.Active  },
		{ rejectWithValue }
	) => {
		try {
			const encrypted_key = await ibe_encrypt(pvt_key);

			const librarianActor = await getActorAlexLibrarian();
			const result = await librarianActor.add_my_node(encrypted_key, [Number(status)]);

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