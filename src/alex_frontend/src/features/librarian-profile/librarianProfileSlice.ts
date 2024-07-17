import { ActionReducerMapBuilder, PayloadAction, createSlice } from "@reduxjs/toolkit";
// import { Engine } from '../../../../declarations/alex_backend/alex_backend.did';
// import updateEngineStatus from "./thunks/updateEngineStatus";
// import { message } from "antd";

// Define the interface for our engine state
export interface EngineOverviewState {
	showProfile: boolean;

	loading: boolean;
	error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: EngineOverviewState = {
	showProfile: false,

	loading: false,
	error: null,
};


const engineOverviewSlice = createSlice({
	name: "engineOverview",
	initialState,
	reducers: {
		setShowProfile: (state, action)=>{
			state.showProfile = action.payload;
		},
	},
	// extraReducers: (builder: ActionReducerMapBuilder<EngineOverviewState>) => {
	// 	builder
	// 		.addCase(updateEngineStatus.pending, (state) => {
	// 			message.info('Updating Status')
	// 			state.loading = true;
	// 			state.error = null;
	// 		})
	// 		.addCase(updateEngineStatus.fulfilled, (state, action) => {
	// 			message.success('Status Updated')

	// 			state.loading = false;
	// 			state.error = null;
	// 			state.activeEngine = action.payload
	// 		})
	// 		.addCase(updateEngineStatus.rejected, (state, action) => {
	// 			message.error('Status Could not be updated '+ action.payload)

	// 			state.loading = false;
	// 			state.error = action.payload as string;
	// 		})
	// 	}
});

export const {setShowProfile} = engineOverviewSlice.actions;

export default engineOverviewSlice.reducer;
