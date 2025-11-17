import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBooks as fetchBooksAPI } from "../../api/arweave";
import { setLoading, setError, setBooksData } from "../browseSlice";
import type { RootState } from "@/store";

interface FetchBooksParams {
    reset?: boolean;
    signal?: AbortSignal;
}

export const fetchBooks = createAsyncThunk(
    "bibliotheca/browse/fetchBooks",
    async ({ reset = false, signal }: FetchBooksParams = {}, { dispatch, getState }) => {
        dispatch(setLoading(true));
        
        try {
            const state = getState() as RootState;
            const currentCursor = reset ? null : state.bibliotheca.browse.cursor;
            
            const result = await fetchBooksAPI({ 
                cursor: currentCursor,
                signal 
            });
            
            dispatch(setBooksData({ 
                ...result, 
                reset 
            }));
            
            return result;
            
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw error;
            }
            
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch books";
            dispatch(setError(errorMessage));
            throw error;
        }
    }
);

export default fetchBooks;