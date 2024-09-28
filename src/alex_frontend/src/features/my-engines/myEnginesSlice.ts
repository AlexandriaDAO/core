import { ActionReducerMapBuilder, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Engine } from '../../../../declarations/alex_backend/alex_backend.did';
import fetchMyEngines from "./thunks/fetchMyEngines";
import { message } from "antd";
import addEngine from "./thunks/addEngine";

// Define the interface for our engine state
export interface MyEnginesState {
	engines: Engine[];			//holds currently selected engine
	newEngine: Engine|null;			//holds recently added engine

	loading: boolean;
	error: string | null;

	newEngineLoading: boolean;
	newEngineError: string|null;
}

// Define the initial state using the ManagerState interface
const initialState: MyEnginesState = {
    engines: [],
	newEngine: null,

	loading: false,
	error: null,

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
		}

	},
	extraReducers: (builder: ActionReducerMapBuilder<MyEnginesState>) => {
		builder
			.addCase(fetchMyEngines.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchMyEngines.fulfilled, (state, action) => {
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
				message.info('Adding Engine')

				state.newEngineLoading = true;
				state.newEngineError = null;
			})
			.addCase(addEngine.fulfilled, (state, action) => {
				message.success('Engine Added')

				state.newEngineLoading = false;
				state.newEngineError = null;

				state.newEngine = action.payload;
				state.engines.push(action.payload);
			})
			.addCase(addEngine.rejected, (state, action) => {
				message.error('Engine Could not be added')

				state.newEngineLoading = false;
				state.newEngineError = action.payload as string;
			})
		}
});

export const {setNewEngine, setNewEngineLoading, setNewEngineError, setEngines} = myEnginesSlice.actions;

export default myEnginesSlice.reducer;
