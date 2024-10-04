import { createAsyncThunk } from "@reduxjs/toolkit";
import { getActorAlexLibrarian } from "@/features/auth/utils/authUtils";

// Define an interface for the librarian parameters based on the Yup validation schema
interface LibrarianInput {
	name: string;
}

// Define the async thunk
const becomeLibrarian = createAsyncThunk<
	boolean, // This is the return type of the thunk's payload
	LibrarianInput, //Argument that we pass to initialize
	{ rejectValue: string }
>(
	"librarian/becomeLibrarian",
	async (
		{ name  },
		{ rejectWithValue }
	) => {
		try {
			const actor = await getActorAlexLibrarian();
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