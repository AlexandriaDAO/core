import { ActionReducerMapBuilder, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import addBook from "./thunks/addBook";


export enum MintScreen {
	Upload = "upload",
	MetaData = "metadata",
	Finished = "finished",
}
export interface NewBook {
	id : string,

	// add book
	engine_id : string,
	asset_id : string,
	asset_node_id : string,

	// add cover
	cover_id : string,
	cover_node_id : string,

	// add metadata
	book_type : number,
	categories : number[],
	title : string,
	author : string,
	description : string,
	fiction : boolean,
	pubyear : number,
	language : string,
	publisher : string,
	rights : string,
	isbn : string,
}


export const defaultNewBook = {
	id: '',

	engine_id: '',
	asset_id: '',
	asset_node_id: '',

	cover_id: '',
	cover_node_id: '',

	book_type: -1,
	categories: [],
	title: '',
	author:'',
	description: '',
	fiction: false,
	pubyear: 0,
	language: '',
	publisher: '',
	rights: '',
	isbn: '',
}

// Define the interface for our engine state
export interface MintState {
	newBook: NewBook

	showModal: boolean;

	screen: MintScreen,

	loading: boolean;
	error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: MintState = {
	showModal: false,
	newBook: defaultNewBook,
	screen: MintScreen.Upload,

	loading: false,
	error: null,
};


const mintSlice = createSlice({
	name: "mint",
	initialState,
	reducers: {
		setShowModal: (state, action: PayloadAction<boolean>) => {
			state.showModal = action.payload;
		},

		setNewBook: (state, action: PayloadAction<NewBook>) => {
			state.newBook = action.payload;
		},
		setScreen: (state, action: PayloadAction<MintScreen>) => {
			state.screen = action.payload;
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setError: (state, action: PayloadAction<string|null>) => {
			state.error = action.payload;
		}

	},
	extraReducers: (builder: ActionReducerMapBuilder<MintState>) => {
		builder
			.addCase(addBook.pending, (state) => {
				message.info('Adding New Book')
				state.loading = true;
				state.error = null;
			})
			.addCase(addBook.fulfilled, (state, action) => {
				message.success('Book Added')

				state.loading = false;
				state.error = null;

				state.newBook = {
					...state.newBook,
					id: action.payload.id,
					asset_id: action.payload.asset_id
				}
				state.screen = MintScreen.MetaData
			})
			.addCase(addBook.rejected, (state, action) => {
				message.error('Book Could not be added '+ action.payload)

				state.loading = false;
				state.error = action.payload as string;
			})
		}
});

export const {setShowModal, setNewBook, setScreen, setLoading, setError} = mintSlice.actions;

export default mintSlice.reducer;
