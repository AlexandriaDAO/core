import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAudios as fetchAudiosAPI } from "../../api/arweave";
import { setLoading, setError, setAudiosData } from "../browseSlice";
import type { RootState } from "@/store";

interface FetchAudiosParams {
    reset?: boolean;
    signal?: AbortSignal;
}

export const fetchAudios = createAsyncThunk(
    "sonora/browse/fetchAudios",
    async ({ reset = false, signal }: FetchAudiosParams = {}, { dispatch, getState }) => {
        dispatch(setLoading(true));
        
        try {
            const state = getState() as RootState;
            const currentCursor = reset ? null : state.sonora.browse.cursor;
            
            const result = await fetchAudiosAPI({ 
                cursor: currentCursor,
                signal 
            });
            
            dispatch(setAudiosData({ 
                ...result, 
                reset 
            }));
            
            return result;
            
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw error;
            }
            
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch audios";
            dispatch(setError(errorMessage));
            throw error;
        }
    }
);

export default fetchAudios;