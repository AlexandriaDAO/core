import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import { Node } from '../../../../declarations/alex_librarian/alex_librarian.did';
import fetchMyNodes from "./thunks/fetchMyNodes";
import { toast } from "sonner";
import addNode from "./thunks/addNode";

// Define the interface for our node state
export interface MyNodesState {
	nodes: Node[];			//holds currently selected node
	newNode: Node|null;			//holds recently added node

	loading: boolean;
	error: string | null;

	newNodeLoading: boolean;
	newNodeError: string|null;
}

// Define the initial state using the ManagerState interface
const initialState: MyNodesState = {
    nodes: [],
	newNode: null,

	loading: false,
	error: null,

	newNodeLoading: false,
	newNodeError: '',
};

const myNodesSlice = createSlice({
	name: "myNodes",
	initialState,
	reducers: {
		setNewNode: (state, action)=>{
			state.newNode = action.payload;
		},

		setNewNodeLoading: (state, action)=>{
			state.newNode = action.payload;
		},

		setNewNodeError: (state, action)=>{
			state.newNode = action.payload;
		}

	},
	extraReducers: (builder: ActionReducerMapBuilder<MyNodesState>) => {
		builder
			.addCase(fetchMyNodes.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchMyNodes.fulfilled, (state, action) => {
				state.loading = false;
				state.error = null;
				state.nodes = action.payload;
			})
			.addCase(fetchMyNodes.rejected, (state, action) => {
				state.loading = false;
				state.nodes = [];
				state.error = action.payload as string;
			})

			.addCase(addNode.pending, (state) => {
				toast.info('Adding Node')

				state.newNodeLoading = true;
				state.newNodeError = null;
			})
			.addCase(addNode.fulfilled, (state, action) => {
				toast.success('Node Added')

				state.newNodeLoading = false;
				state.newNodeError = null;

				state.newNode = action.payload;
				state.nodes.push(action.payload);
			})
			.addCase(addNode.rejected, (state, action) => {
				toast.error('Node Could not be added')

				state.newNodeLoading = false;
				state.newNodeError = action.payload as string;
			})
		}
});

export const {setNewNode, setNewNodeLoading, setNewNodeError} = myNodesSlice.actions;

export default myNodesSlice.reducer;