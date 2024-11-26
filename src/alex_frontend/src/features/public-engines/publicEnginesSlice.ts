import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import fetchPublicEngines from "./thunks/fetchPublicEngines";
import { SerializedEngine } from "../my-engines/myEnginesSlice";

// Define the interface for our engine state
export interface PublicEnginesState {
	engines: SerializedEngine[],		//holds all public engines

	loading: boolean;
	error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: PublicEnginesState = {
	engines: [],

	loading: false,
	error: null,
};


const publicEnginesSlice = createSlice({
	name: "publicEngines",
	initialState,
	reducers: {	},
	extraReducers: (builder: ActionReducerMapBuilder<PublicEnginesState>) => {
		builder
			.addCase(fetchPublicEngines.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchPublicEngines.fulfilled, (state, action) => {
				state.loading = false;
				state.error = null;
				state.engines = action.payload;
			})
			.addCase(fetchPublicEngines.rejected, (state, action) => {
				state.loading = false;
				state.engines = [];
				state.error = action.payload as string;
			})
		}
});

export const {} = publicEnginesSlice.actions;

export default publicEnginesSlice.reducer;
