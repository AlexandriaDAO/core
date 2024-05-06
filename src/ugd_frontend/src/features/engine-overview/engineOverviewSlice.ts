import { ActionReducerMapBuilder, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Engine } from '../../../../declarations/ugd_backend/ugd_backend.did';
import updateEngineStatus from "./thunks/updateEngineStatus";
import { message } from "antd";

export enum EngineOverviewTab {
	Books = "Books",
	Filters = "Filters",
	Tasks = "Recent Tasks",
	Stats = "Cluster Stats",
}

// Define the interface for our engine state
export interface EngineOverviewState {
	activeEngine: Engine|null;			//holds currently selected engine
	activeTab: EngineOverviewTab;			//holds a selected tabs within engine overview page

	loading: boolean;
	error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: EngineOverviewState = {
    activeEngine: null,
    activeTab: EngineOverviewTab.Books,

	loading: false,
	error: null,
};


const engineOverviewSlice = createSlice({
	name: "engineOverview",
	initialState,
	reducers: {
		setActiveEngine: (state, action: PayloadAction<Engine|null>) => {
			state.activeEngine = action.payload;
		},
		setActiveTab: (state, action: PayloadAction<EngineOverviewTab>) => {
			state.activeTab = action.payload;
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<EngineOverviewState>) => {
		builder
			.addCase(updateEngineStatus.pending, (state) => {
				message.info('Updating Status')
				state.loading = true;
				state.error = null;
			})
			.addCase(updateEngineStatus.fulfilled, (state, action) => {
				message.success('Status Updated')

				state.loading = false;
				state.error = null;
				state.activeEngine = action.payload
			})
			.addCase(updateEngineStatus.rejected, (state, action) => {
				message.error('Status Could not be updated '+ action.payload)

				state.loading = false;
				state.error = action.payload as string;
			})
		}
});

export const {setActiveEngine, setActiveTab} = engineOverviewSlice.actions;

export default engineOverviewSlice.reducer;
