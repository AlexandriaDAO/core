import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SerializedNode } from "../my-nodes/myNodesSlice";

export interface BookMetadata {
	title: string;
	creator: string;
	fiction: boolean;
	type: number;
	categories: number[];
	era: number;
	language: string;
}

export interface UploadBookState {
	screen: number;
	cover: string;

	metadata: BookMetadata;
	isMetaDataValid: boolean;

	selectedNode: SerializedNode | null;

	status: number;

	loading: boolean;
	error: string | null;
}

const initialState: UploadBookState = {
	screen: 0,
	cover: '',
	metadata: {
		title: "",
		creator: "",
		fiction: false,
		type: 0,
		categories: [],
		era: 10,
		language: "en",
	},

	isMetaDataValid: false,

	selectedNode: null,

	status: 0,

	loading: false,
	error: null,
};

const uploadBookSlice = createSlice({
	name: "uploadBook",
	initialState,
	reducers: {
		next: (state)=>{
			if(state.screen < 4) state.screen = state.screen + 1
		},
		previous: (state)=>{
			if(state.screen == 2 ) state.selectedNode = null
			if(state.screen == 1 ) state.metadata = initialState.metadata
			if(state.screen > 0) state.screen = state.screen - 1
		},
		setCover: (state, action)=>{
			state.cover = action.payload
		},
		updateMetadata: (
			state,
			action: PayloadAction<Partial<BookMetadata>>
		) => {
			state.metadata = { ...state.metadata, ...action.payload };
		},
		resetMetadata: (state) => {
			state.metadata = initialState.metadata;
		},
		setIsMetaDataValid: (state, action)=>{
			state.isMetaDataValid = action.payload
		},
		setSelectedNode: (state, action)=>{
			state.selectedNode = action.payload
		},

		setStatus: (state, action)=>{
			state.status = action.payload
		},
	},
});

export const { next, previous, setCover, updateMetadata, resetMetadata, setIsMetaDataValid, setSelectedNode, setStatus } = uploadBookSlice.actions;

export default uploadBookSlice.reducer;
