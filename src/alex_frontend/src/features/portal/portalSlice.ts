import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit";
import fetchBooks from "./thunks/fetchBooks";

export interface Book {
    owner: string;
    manifest: string;
    title: string;
    fiction: boolean;
    language: string;
    author_first: string;
    author_last: string;
    type: number;
    categories: number[];
    era: number;
}


interface PortalState {
    selectedBook: Book | null;
    books: Book[];

    searchTerm: string,
    cursor: string,
    load: boolean,

    limit: number,

    loading: boolean;
	error: string | null;
}

const initialState: PortalState = {
    selectedBook: null,
    books: [],

    searchTerm: '',
    cursor: '',

    // hide/show load more button
    load: true,
    limit: 10,

    loading: false,
	error: null,
};

const portalSlice = createSlice({
    name: "portal",
    initialState,
    reducers: {
        setSelectedBook: (state, action: PayloadAction<Book | null>) => {
            state.selectedBook = action.payload;
        },
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;
        },
        setBooks: (state, action: PayloadAction<Book[]>) => {
            state.books = action.payload;
        },
        setCursor: (state, action:PayloadAction<string>)=>{
            state.cursor = action.payload
        },
        setLoad: (state, action:PayloadAction<boolean>)=>{
            state.load = action.payload
        },
        setLimit: (state, action:PayloadAction<number>)=>{
            state.books = [];
            state.cursor = '';
            state.limit = action.payload
        }
    },
    extraReducers: (builder: ActionReducerMapBuilder<PortalState>) => {
		builder
			.addCase(fetchBooks.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchBooks.fulfilled, (state, {payload: {books, cursor, load}}) => {
				state.loading = false;
				state.error = null;
                state.books = books;
				state.cursor = cursor;
                state.load = load
			})
			.addCase(fetchBooks.rejected, (state, action) => {
				state.loading = false;
				state.books = [];
                state.cursor = '';
				state.error = action.payload as string;
                state.load = false;
			})
		}
});

export const { setSelectedBook, setBooks, setSearchTerm, setCursor, setLoad, setLimit } = portalSlice.actions;

export default portalSlice.reducer;
