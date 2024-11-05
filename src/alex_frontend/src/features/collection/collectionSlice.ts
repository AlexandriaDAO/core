import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit";
import fetchMyBooks from "./thunks/fetchMyBooks";
import { Book } from "../portal/portalSlice";

interface CollectionState {
    selectedBook: Book | null;
    books: Book[];

    loading: boolean;
	error: string | null;
}

const initialState: CollectionState = {
    selectedBook: null,
    books: [],

    loading: false,
	error: null,
};

const collectionSlice = createSlice({
    name: "collection",
    initialState,
    reducers: {
        setSelectedBook: (state, action: PayloadAction<Book | null>) => {
            state.selectedBook = action.payload;
        },
        setBooks: (state, action: PayloadAction<Book[]>) => {
            state.books = action.payload;
        },
    },
    extraReducers: (builder: ActionReducerMapBuilder<CollectionState>) => {
		builder
			.addCase(fetchMyBooks.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchMyBooks.fulfilled, (state, action) => {
				state.loading = false;
				state.error = null;
                state.books = action.payload;
			})
			.addCase(fetchMyBooks.rejected, (state, action) => {
				state.loading = false;
				state.books = [];
				state.error = action.payload as string;
			})
		}
});

export const { setSelectedBook, setBooks } = collectionSlice.actions;

export default collectionSlice.reducer;
