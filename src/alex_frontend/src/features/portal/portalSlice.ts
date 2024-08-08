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

    currentPage: number,
    searchTerm: string,

    loading: boolean;
	error: string | null;
}

const initialState: PortalState = {
    selectedBook: null,
    books: [],

    currentPage: 1,
    searchTerm: '',

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
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;
        },
        setBooks: (state, action: PayloadAction<Book[]>) => {
            state.books = action.payload;
        },
    },
    extraReducers: (builder: ActionReducerMapBuilder<PortalState>) => {
		builder
			.addCase(fetchBooks.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchBooks.fulfilled, (state, action) => {
				state.loading = false;
				state.error = null;
				state.books = action.payload;
			})
			.addCase(fetchBooks.rejected, (state, action) => {
				state.loading = false;
				state.books = [];
				state.error = action.payload as string;
			})
		}
});

export const { setSelectedBook, setBooks, setCurrentPage, setSearchTerm } = portalSlice.actions;

export default portalSlice.reducer;
