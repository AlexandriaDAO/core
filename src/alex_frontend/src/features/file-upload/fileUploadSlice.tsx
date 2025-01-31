import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SerializedNode } from "@/features/my-nodes/myNodesSlice";
import fetchNodes from "./thunks/fetchNodes";
import uploadFile from "./thunks/uploadFile";
import mintNFT from "./thunks/mintNFT";
import estimateCost from "./thunks/estimateCost";

export interface FileUploadState {
	nodes: SerializedNode[];
	node: SerializedNode | null;

	transaction: string | null;
	details: boolean;

	progress: number;

	fetching: boolean;
	uploading: boolean;

	cost: number | null;
	estimating: boolean;
	estimateError: string | null;

	minting: boolean;
	minted: string | null;

	uploadError: string | null;
	fetchError: string | null;
	mintError: string | null;
}

const initialState: FileUploadState = {
	nodes: [],
	node: null,

	transaction: null,
	details: true,
	progress: 0,

	fetching: false,
	uploading: false,
	minting: false,
	minted: null,

	cost: null,
	estimating:false,
	estimateError:null,

	uploadError: null,
	fetchError: null,
	mintError: null,
};

const fileUploadSlice = createSlice({
	name: "fileUpload",
	initialState,
	reducers: {
		reset: ()=> initialState,

		setTransaction: (state, action)=>{
			state.transaction = action.payload
		},
		setNode: (state, action)=>{
			state.node = action.payload
		},
		setProgress: (state, action)=>{
			state.progress = action.payload
		},
		setDetails: (state, action)=>{
			state.details = action.payload
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<FileUploadState>) => {
		builder
			.addCase(fetchNodes.pending, (state) => {
				state.fetching = true;
				state.nodes = [];
				state.node = null;
				state.fetchError = null;
			})
			.addCase(fetchNodes.fulfilled, (state, action:PayloadAction<SerializedNode[]>) => {
				state.fetching = false;
				state.nodes = action.payload;
			})
			.addCase(fetchNodes.rejected, (state, action) => {
				state.fetching = false;
				state.nodes = [];
				state.fetchError = action.payload as string;
			})

			.addCase(uploadFile.pending, (state) => {
				state.uploading = true;
				state.transaction = null;
				state.uploadError = null;
				state.progress = 0;
			})
			.addCase(uploadFile.fulfilled, (state, action:PayloadAction<string>) => {
				state.uploading = false;
				state.transaction = action.payload;
				state.progress = 0;
				state.node = null
			})
			.addCase(uploadFile.rejected, (state, action) => {
				state.uploading = false;
				state.transaction = null;
				state.uploadError = action.payload as string;
				state.progress = 0;
			})

			.addCase(mintNFT.pending, (state) => {
				state.minting = true;
				state.minted = null;
				state.mintError = null;
			})
			.addCase(mintNFT.fulfilled, (state, action:PayloadAction<string>) => {
				state.minting = false;
				// state.minted = action.payload;
				state.minted = state.transaction;
			})
			.addCase(mintNFT.rejected, (state, action) => {
				state.minting = false;
				state.minted = null;
				state.mintError = action.payload as string;
			})


			.addCase(estimateCost.pending, (state) => {
				state.estimating = true;
				state.estimateError = null;
				state.cost = null;
			})
			.addCase(estimateCost.fulfilled, (state, action:PayloadAction<number>) => {
				state.estimating = false;
				state.estimateError = null;
				state.cost = action.payload;
			})
			.addCase(estimateCost.rejected, (state, action) => {
				state.estimating = false;
				state.estimateError = action.payload as string;
				state.cost = null;
			})

	}
});

export const { reset, setNode, setProgress, setDetails, setTransaction } = fileUploadSlice.actions;

export default fileUploadSlice.reducer;

