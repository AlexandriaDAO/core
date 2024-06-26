import { ActorSubclass } from "@dfinity/agent";
import {
	Librarian,
	_SERVICE,
} from "../../../../../declarations/ucg_backend/ucg_backend.did";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Define an interface for the librarian parameters based on the Yup validation schema
interface LibrarianInput {
	name: string;
}

// Define the async thunk
const becomeLibrarian = createAsyncThunk<
	boolean, // This is the return type of the thunk's payload
	{
		actor: ActorSubclass<_SERVICE>;
		librarian: LibrarianInput;
	}, //Argument that we pass to initialize
	{ rejectValue: string }
>(
	"librarian/becomeLibrarian",
	async (
		{
			actor,
			librarian: { name  },
		},
		{ rejectWithValue }
	) => {
		try {
			const result = await actor.save_librarian(name);

            if('Ok' in result) return true;

            if('Err' in result) throw new Error(result.Err)
		} catch (error) {
			console.error("Failed to Save Librarian:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue(
			"An unknown error occurred while saving Librarian"
		);
	}
);

export default becomeLibrarian;
