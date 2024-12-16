import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SerializedNode } from "@/features/my-nodes/myNodesSlice";
import fetchNodes from "./thunks/fetchNodes";

export interface BookMetadata {
	title: string;
	creator: string;
	fiction: boolean;
	type: number;
	categories: number[];
	era: number;
	language: string;
}

export enum AssetType {
	Book = "Book",
	Audio = "Audio",
	Video = "Video",
	Image = "Image",
}

export interface UploadState {
	open: AssetType|false;

	screen: number;

	nodes: SerializedNode[];
	node: SerializedNode | null;

	metadata: BookMetadata;

	status: number;
	percent: number|undefined;

	loading: boolean;
	error: string | null;
}

const initialState: UploadState = {
	open: false,

	screen: 0,

	nodes: [],
	node: null,

	metadata: {
		title: "",
		creator: "",
		fiction: false,
		type: 0,
		categories: [],
		era: 10,
		language: "en",
	},

	status: 0,
	percent: undefined,

	loading: false,
	error: null,
};

const uploadSlice = createSlice({
	name: "uploadSlice",
	initialState,
	reducers: {
		reset: ()=> initialState,

		setOpen: (state, action) => {
			state.open = action.payload;
		},
		setScreen: (state, action) => {
			state.screen = action.payload;
		},
		nextScreen: (state) => {
			state.screen = state.screen + 1;
		},
		previousScreen: (state) => {
			state.screen = state.screen - 1;
		},
		setNode: (state, action)=>{
			state.node = action.payload
		},
		setMetadata: (
			state,
			action: PayloadAction<Partial<BookMetadata>>
		) => {
			state.metadata = { ...state.metadata, ...action.payload };
		},
		setStatus: (state, action)=>{
			state.status = action.payload
		},
		nextStatus: (state)=>{
			state.status = state.status + 1;
		},
		resetStatus: (state)=>{
			state.status = 0;
		},
		setPercent: (state, action)=>{
			state.percent = action.payload
		},
		setLoading: (state, action)=>{
			state.loading = action.payload
		},
		setError: (state, action)=>{
			state.error = action.payload
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<UploadState>) => {
		builder
			.addCase(fetchNodes.pending, (state) => {
				state.loading = true;
				state.nodes = [];
				state.node = null;
				state.error = null;
			})
			.addCase(fetchNodes.fulfilled, (state, action:PayloadAction<SerializedNode[]>) => {
				state.loading = false;
				state.nodes = action.payload;
			})
			.addCase(fetchNodes.rejected, (state, action) => {
				state.loading = false;
				state.nodes = [];
				state.error = action.payload as string;
			})
		}
});

export const { reset, setOpen, setScreen, nextScreen, previousScreen, setNode, setMetadata, setStatus, nextStatus, resetStatus, setPercent, setLoading, setError } = uploadSlice.actions;

export default uploadSlice.reducer;
