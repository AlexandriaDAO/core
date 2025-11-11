import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BrowseState, ArweaveAudio, FetchAudiosResponse } from "../types";

const initialState: BrowseState = {
    audios: [],
    loading: false,
    error: null,
    cursor: null,
    hasNext: false,
};

const browseSlice = createSlice({
    name: "sonora/browse",
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
        setAudiosData: (state, action: PayloadAction<FetchAudiosResponse & { reset: boolean }>) => {
            const { audios, cursor, hasNext, reset } = action.payload;
            
            if (reset) {
                state.audios = audios;
            } else {
                state.audios.push(...audios);
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
    setAudiosData,
    reset,
} = browseSlice.actions;

export default browseSlice.reducer;