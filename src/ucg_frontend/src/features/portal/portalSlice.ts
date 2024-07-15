import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit";
import fetchBooks from "./thunks/fetchBooks";

export interface Book {
    key: number;
    title: string;
    author: string;
    cover: string;
    transactionId: string;
    tags: {
        name: string;
        value: string;
    }[];
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
        updateBookCover: (state, action: PayloadAction<{ key: number; cover: string }>) => {
            const book = state.books.find(b => b.key === action.payload.key);
            if (book) {
                book.cover = action.payload.cover;
            }
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

export const { setSelectedBook, setBooks, updateBookCover, setCurrentPage, setSearchTerm } = portalSlice.actions;

export default portalSlice.reducer;
