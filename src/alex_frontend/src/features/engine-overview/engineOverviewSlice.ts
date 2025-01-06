import { ActionReducerMapBuilder, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { SerializedEngine } from "../my-engines/myEnginesSlice";
import fetchEngine from "./thunks/fetchEngine";

export enum EngineOverviewTab {
	Books = "Books",
	Filters = "Filters",
	Tasks = "Recent Tasks",
	Stats = "Cluster Stats",
}

// Define the interface for our engine state
export interface EngineOverviewState {
	activeEngine: SerializedEngine | null;			//holds currently selected engine
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
		setActiveEngine: (state, action: PayloadAction<SerializedEngine|null>) => {
			state.activeEngine = action.payload;
		},
		setActiveTab: (state, action: PayloadAction<EngineOverviewTab>) => {
			state.activeTab = action.payload;
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<EngineOverviewState>) => {
		builder
			// fetchEngine.ts
			.addCase(fetchEngine.pending, (state) => {
				toast.info('Fetching Engine')
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchEngine.fulfilled, (state, action) => {
				toast.success('Fetched')

				state.loading = false;
				state.error = null;
				state.activeEngine = action.payload
			})
			.addCase(fetchEngine.rejected, (state, action) => {
				toast.error('Engine could not be fetched '+ action.payload)

				state.loading = false;
				state.error = action.payload as string;
			})
		}
});

export const {setActiveEngine, setActiveTab} = engineOverviewSlice.actions;

export default engineOverviewSlice.reducer;
