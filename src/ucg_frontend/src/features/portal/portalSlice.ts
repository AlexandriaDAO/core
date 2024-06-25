import { RootState } from "src/ucg_frontend/src/store";
import { listDocs } from "@junobuild/core";
import {
	createSlice,
	createAsyncThunk,
	PayloadAction,
} from "@reduxjs/toolkit";

function convertBigInts(obj:any) {
    for (const key in obj) {
        if (typeof obj[key] === 'bigint') {
            // Converting BigInt to number may result in precision loss if the data is too big
			// In our case we don't have a very huge data
            obj[key] = Number(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            convertBigInts(obj[key]); // Recursively process nested objects
        }
    }
}

// Define the structure of a book document
interface Book {
	title?: string;
	author?: string;
	fiction?: string;
	types?: string;
	subtypes?: string;
	pubyear?: string;

	// Advanced Options (usually preset but the user can change)
	description?: string;
	language?: string; // defaults to en
	publisher?: string;
	rights?: string;
	isbn?: string;

	// Preset (user cannot set)
	asset?: string;
	ugbn?: string;
	minted?: string;
	modified?: string;
}

// Define the interface for your portal state
interface PortalState {
	limit: number;
	view: "grid" | "list";
	data?: any;
	currentPage: number;
	loading: boolean;
	error: string | undefined;
}

// Define the initial state using the PortalState interface
const initialState: PortalState = {
	limit: 10,
	view: "grid",
	data: undefined,
	currentPage: 0,
	loading: false,
	error: undefined,
};

// Define the async thunk
export const fetchBooks = createAsyncThunk<
	any, // This is the return type of the thunk's payload
	string | undefined, //Argument that we pass to fetchBooks
	{ rejectValue: string; state: RootState }
>("books/fetchBooks", async (from, { rejectWithValue, fulfillWithValue, getState }) => {
	try {
		// Get the current state
		const state = getState();

		// Access the limit from the portal state
		const limit = state.portal.limit;

		let paginate: any = { limit };
		if (from) paginate.startAfter = from;

		const collection = await listDocs<Book>({
			// Specify the generic type <Book>
			collection: "books",
			filter: { paginate },
		});
		convertBigInts(collection)
		return fulfillWithValue(collection)
	} catch (error) {
		return rejectWithValue("Failed to fetch documents");
	}
});

const portalSlice = createSlice({
	name: "portal",
	initialState,
	reducers: {
		// You can add reducers here for other actions, such as updating the view or limit
		setView: (state, action: PayloadAction<'grid' | 'list'>) => {
			state.view = action.payload;
		},
		setLimit: (state, action: PayloadAction<number>) => {
			state.limit = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchBooks.pending, (state) => {
				state.loading = true;
				state.data = undefined;
				state.error = undefined;
			})
			.addCase(fetchBooks.fulfilled, (state, action) => {
				state.loading = false;

				state.data = action.payload;

				state.currentPage = Number(action.payload.items_page) + 1;
			})
			.addCase(fetchBooks.rejected, (state, action) => {
				state.loading = false;
				state.data = undefined;
				state.error = action.payload;
			});
	},
});

export const { setLimit, setView}  =  portalSlice.actions;

export default portalSlice.reducer;
