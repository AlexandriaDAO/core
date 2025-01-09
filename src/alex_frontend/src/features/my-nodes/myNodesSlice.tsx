import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit";
import fetchMyNodes from "./thunks/fetchMyNodes";
import { toast } from "sonner";
import addNode from "./thunks/addNode";
import deleteNode from "./thunks/deleteNode";
import updateNodeStatus from "./thunks/updateNodeStatus";

export interface SerializedNode {
	'id' : string,
	'key' : string,
	'active' : boolean,
	'owner' : string,
	'created_at' : string,
	'updated_at' : string,
}

// Define the interface for our node state
export interface MyNodesState {
	nodes: SerializedNode[];			//holds currently selected node
	newNode: SerializedNode|null;			//holds recently added node

	deleting: string;
	updating: string;

	loading: boolean;
	error: string | null;

	newNodeLoading: boolean;
	newNodeError: string|null;
}

// Define the initial state using the ManagerState interface
const initialState: MyNodesState = {
    nodes: [],
	newNode: null,

	deleting: '',
	updating: '',

	loading: false,
	error: null,

	newNodeLoading: false,
	newNodeError: '',
};

const myNodesSlice = createSlice({
	name: "myNodes",
	initialState,
	reducers: {
		setDeleting: (state, action)=>{
			state.deleting = action.payload;
		},

		setUpdating: (state, action)=>{
			state.updating = action.payload;
		},

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
			.addCase(fetchMyNodes.fulfilled, (state, action:PayloadAction<SerializedNode[]>) => {
				state.loading = false;
				state.error = null;
				state.nodes = action.payload;
			})
			.addCase(fetchMyNodes.rejected, (state, action) => {
				state.loading = false;
				state.nodes = [];
				state.error = action.payload as string;
			})

			.addCase(deleteNode.pending, (state) => {
				toast.info('Deleting Node')
				state.error = null;
			})
			.addCase(deleteNode.fulfilled, (state, action:PayloadAction<boolean>) => {
				toast.success('Node Deleted')

				if (action.payload) {
					state.nodes = state.nodes.filter((node) => node.id !== state.deleting);
				}

				state.deleting = '';
				state.error = null;
			})
			.addCase(deleteNode.rejected, (state, action) => {
				toast.error('Node Could not be deleted '+ action.payload)

				state.deleting = '';
				state.error = action.payload as string;
			})

			.addCase(updateNodeStatus.pending, (state) => {
				toast.info('Updating Status')
				state.error = null;
			})
			.addCase(updateNodeStatus.fulfilled, (state, action) => {
				toast.success('Status Updated')

				state.nodes = state.nodes.map((node)=>{
					if(node.id === action.payload.id){
						return action.payload;
					}
					return node;
				})

				state.updating = '';
				state.error = null;
			})
			.addCase(updateNodeStatus.rejected, (state, action) => {
				toast.error('Status Could not be updated '+ action.payload)

				state.updating = '';
				state.error = action.payload as string;
			})


			.addCase(addNode.pending, (state) => {
				toast.info('Adding Node')

				state.newNodeLoading = true;
				state.newNodeError = null;
			})
			.addCase(addNode.fulfilled, (state, action:PayloadAction<SerializedNode>) => {
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

export const {setUpdating, setDeleting, setNewNode, setNewNodeLoading, setNewNodeError} = myNodesSlice.actions;

export default myNodesSlice.reducer;