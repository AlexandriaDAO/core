import { RootState } from "@/store";
import { Doc, ListResults, listDocs } from "@junobuild/core";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the interface for your portal state
interface HomeState {
	search: string;
	filter: boolean;
	view: "home" | "search" | "loading";

    selectedCategory: any;
    selectedBook: any;
}

// Define the initial state using the PortalState interface
const initialState: HomeState = {
	search: "",
	filter: false,
	view: "loading",

    selectedCategory : null,
    selectedBook : null,
};

const homeSlice = createSlice({
	name: "portal",
	initialState,
	reducers: {
		// You can add reducers here for other actions, such as updating the view or limit
		setView: (
			state,
			action: PayloadAction<"home" | "search" | "loading">
		) => {
			state.view = action.payload;
		},

		setSearch: (state, action: PayloadAction<string>) => {
			state.search = action.payload;
		},

		setFilter: (state, action: PayloadAction<boolean>) => {
			state.filter = action.payload;
		},

        setselectedCategory: (state, action: PayloadAction<any>) => {
			state.selectedCategory = action.payload;
		},

        setSelectedBook: (state, action: PayloadAction<any>) => {
			state.selectedBook = action.payload;
		},
	},
});

export const { setView, setSearch, setFilter, setselectedCategory, setSelectedBook } = homeSlice.actions;

export default homeSlice.reducer;
