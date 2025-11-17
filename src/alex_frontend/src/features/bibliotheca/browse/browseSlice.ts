import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BrowseState, ArweaveBook, FetchBooksResponse } from "../types";

const initialState: BrowseState = {
    books: [],
    loading: false,
    error: null,
    cursor: null,
    hasNext: false,
};

const browseSlice = createSlice({
    name: "bibliotheca/browse",
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
            if (action.payload) {
                state.error = null;
            }
        },
        setError: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        setBooksData: (state, action: PayloadAction<FetchBooksResponse & { reset: boolean }>) => {
            const { books, cursor, hasNext, reset } = action.payload;
            
            if (reset) {
                state.books = books;
            } else {
                state.books.push(...books);
            }
            
            state.cursor = cursor;
            state.hasNext = hasNext;
            state.loading = false;
            state.error = null;
        },
        reset: (state) => {
            Object.assign(state, initialState);
        }
    },
});

export const {
    setLoading,
    setError,
    clearError,
    setBooksData,
    reset,
} = browseSlice.actions;

export default browseSlice.reducer;