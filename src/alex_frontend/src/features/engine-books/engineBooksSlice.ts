import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import fetchEngineBooks from "./thunks/fetchEngineBooks";
import { Book } from "../portal/portalSlice";


// Define the interface for our engine state
export interface EngineBooksState {
	books: Book[];			//holds currently selected engine

	expanded: boolean;
	loading: boolean;
	error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: EngineBooksState = {
    books: [],

	expanded: false,
	loading: false,
	error: null,
};

const engineBooksSlice = createSlice({
	name: "engineBooks",
	initialState,
	reducers: {
		setExpanded: (state, action)=>{
			state.expanded = action.payload;
		},
		setBooks: (state, action)=>{
			state.books = action.payload;
		}
	},
	extraReducers: (builder: ActionReducerMapBuilder<EngineBooksState>) => {
		builder
			.addCase(fetchEngineBooks.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchEngineBooks.fulfilled, (state, action) => {
				state.loading = false;
				state.error = null;
				state.books = action.payload;
			})
			.addCase(fetchEngineBooks.rejected, (state, action) => {
				state.loading = false;
				state.books = [];
				state.error = action.payload as string;
			})
		}
});

export const {setExpanded, setBooks} = engineBooksSlice.actions;

export default engineBooksSlice.reducer;
