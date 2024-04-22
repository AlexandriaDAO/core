import useMeiliSearchClient from "@/utils/MeiliSearchClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

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
});

export const {setSearchText, setSearchResults, setLoading, setError} = searchSlice.actions;

export default searchSlice.reducer;
