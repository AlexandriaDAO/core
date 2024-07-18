import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import performSearch from "./thunks/performSearch";
import { message } from "antd";

// Define the interface for our search state
interface SearchState {
	searchResults: Array<any>;
	searchText: string;

	loading: boolean;
	error: string | null;
}

// Define the initial state using the SearchState interface
const initialState: SearchState = {
	searchResults: [],
	searchText: "",

	loading: false,
	error: null,
};

const searchSlice = createSlice({
	name: "search",
	initialState,
	reducers: {
        setSearchText(state, action){
            state.searchText = action.payload
        },
        setSearchResults(state, action){
            state.searchResults = action.payload
        },

        setLoading(state, action){
            state.loading = action.payload
        },
        setError(state, action){
            state.error = action.payload
        }
    },
    extraReducers: (builder: ActionReducerMapBuilder<SearchState>) => {
		builder
			.addCase(performSearch.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(performSearch.fulfilled, (state, action) => {
				state.loading = false;
				state.error = null;
				state.searchResults = action.payload;
			})
			.addCase(performSearch.rejected, (state, action) => {
				message.error(action.payload)

				state.loading = false;
				state.searchResults = [];
				state.error = action.payload as string;
			})
		}
});

export const {setSearchText, setSearchResults, setLoading, setError} = searchSlice.actions;

export default searchSlice.reducer;
