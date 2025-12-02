import { ActionReducerMapBuilder, PayloadAction, createSlice } from "@reduxjs/toolkit";
import fetchMyEngines from "./thunks/fetchMyEngines";
import { toast } from "sonner";
import addEngine from "./thunks/addEngine";
import updateEngineStatus from "./thunks/updateEngineStatus";


export interface SerializedEngine {
	'id' : string,
	'title' : string,
	'host' : string,
	'key' : string,
	'index' : string,
	'active' : boolean,
	'owner' : string,
	'created_at' : string,
	'updated_at' : string,
}

// Define the interface for our engine state
export interface MyEnginesState {
	engines: SerializedEngine[];			//holds currently selected engine
	newEngine: SerializedEngine|null;			//holds recently added engine

	loading: boolean;
	updating: string;
	error: string | null;

	newEngineLoading: boolean;
	newEngineError: string|null;
}

// Define the initial state using the ManagerState interface
const initialState: MyEnginesState = {
    engines: [],
	newEngine: null,

	loading: true,
	error: null,

	updating: '',

	newEngineLoading: false,
	newEngineError: '',
};

const myEnginesSlice = createSlice({
	name: "myEngines",
	initialState,
	reducers: {
		setNewEngine: (state, action)=>{
			state.newEngine = action.payload;
		},

		setNewEngineLoading: (state, action)=>{
			state.newEngine = action.payload;
		},

		setNewEngineError: (state, action)=>{
			state.newEngine = action.payload;
		},
		setEngines: (state, action)=>{
			state.engines = action.payload;
		},
		setUpdating: (state, action)=>{
			state.updating = action.payload;
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<MyEnginesState>) => {
		builder
			.addCase(fetchMyEngines.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchMyEngines.fulfilled, (state, action:PayloadAction<SerializedEngine[]>) => {
				state.loading = false;
				state.error = null;
				state.engines = action.payload;
			})
			.addCase(fetchMyEngines.rejected, (state, action) => {
				state.loading = false;
				state.engines = [];
				state.error = action.payload as string;
			})

			.addCase(addEngine.pending, (state) => {
				toast.info('Adding Engine')

				state.newEngineLoading = true;
				state.newEngineError = null;
			})
			.addCase(addEngine.fulfilled, (state, action:PayloadAction<SerializedEngine>) => {
				toast.success('Engine Added')

				state.newEngineLoading = false;
				state.newEngineError = null;

				state.newEngine = action.payload;
				state.engines.push(action.payload);
			})
			.addCase(addEngine.rejected, (state, action) => {
				toast.error('Engine Could not be added')

				state.newEngineLoading = false;
				state.newEngineError = action.payload as string;
			})

			.addCase(updateEngineStatus.pending, (state) => {
				toast.info('Updating Status')
				state.error = null;
			})
			.addCase(updateEngineStatus.fulfilled, (state, action) => {
				toast.success('Status Updated')

				state.engines = state.engines.map((engine)=>{
					if(engine.id === action.payload.id){
						return action.payload;
					}
					return engine;
				})

				state.updating = '';
				state.error = null;
			})
			.addCase(updateEngineStatus.rejected, (state, action) => {
				toast.error('Status Could not be updated '+ action.payload)

				state.updating = '';
				state.error = action.payload as string;
			})

		}
});

export const {setNewEngine, setNewEngineLoading, setNewEngineError, setEngines, setUpdating} = myEnginesSlice.actions;

export default myEnginesSlice.reducer;
