import { ActionReducerMapBuilder, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import checkLibrarian from "./thunks/checkLibrarian";
import becomeLibrarian from "./thunks/becomeLibrarian";

// Define the interface for our node state
export interface LibrarianState {
	isLibrarian: boolean;

	loading: boolean;
	error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: LibrarianState = {
	isLibrarian: false,

	loading: false,
	error: null,
};

const librarianSlice = createSlice({
	name: "librarian",
	initialState,
	reducers: {
		setIsLibrarian: (state, action)=>{
			state.isLibrarian = action.payload;
		},
		
	},
	extraReducers: (builder: ActionReducerMapBuilder<LibrarianState>) => {
		builder
			.addCase(checkLibrarian.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(checkLibrarian.fulfilled, (state, action) => {
				state.loading = false;
				state.error = null;
				state.isLibrarian = action.payload;
			})
			.addCase(checkLibrarian.rejected, (state, action) => {
				state.loading = false;
				state.isLibrarian = false;
				state.error = action.payload as string;
			})

			.addCase(becomeLibrarian.pending, (state) => {
				toast.info('Adding Librarian')

				state.loading = true;
				state.error = null;
			})
			.addCase(becomeLibrarian.fulfilled, (state, action) => {
				toast.success('You are a Librarian Now.')

				state.isLibrarian = action.payload;
				state.loading = false;
				state.error = null;
			})
			.addCase(becomeLibrarian.rejected, (state, action) => {
				toast.error('Librarian Could not be added')

				state.loading = false;
				state.error = action.payload as string;
			})
		}
});

export const {setIsLibrarian} = librarianSlice.actions;

export default librarianSlice.reducer;