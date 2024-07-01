import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import { Node } from '../../../../declarations/ucg_backend/ucg_backend.did';
import fetchNodes from "./thunks/fetchNodes";

// Define the interface for our node state
export interface MyNodesState {
	nodes: Node[];			//holds currently active node
	activeNode: Node|null,

	loading: boolean;
	error: string | null;

}

// Define the initial state using the ManagerState interface
const initialState: MyNodesState = {
    nodes: [],
	activeNode: null,

	loading: false,
	error: null,
};

const nodesSlice = createSlice({
	name: "nodes",
	initialState,
	reducers: {
		setActiveNode: (state, action)=>{
			state.activeNode = action.payload;
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<MyNodesState>) => {
		builder
			.addCase(fetchNodes.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchNodes.fulfilled, (state, action) => {
				state.loading = false;
				state.error = null;
				state.nodes = action.payload;
			})
			.addCase(fetchNodes.rejected, (state, action) => {
				state.loading = false;
				state.nodes = [];
				state.error = action.payload as string;
			})
		}
});

export const {setActiveNode} = nodesSlice.actions;

export default nodesSlice.reducer;
