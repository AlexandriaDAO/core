import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import browseReducer from "./browse/browseSlice";
import libraryReducer from "./librarySlice";
import shelfReducer from "./shelfSlice";
import marketReducer from "./marketSlice";
import { Book } from "./types";

// Minimal state for upload preview functionality
const initialState = {
    uploadPreview: null as Book | null,
};

const bibliothecaSlice = createSlice({
    name: "bibliotheca",
    initialState,
    reducers: {
        setUploadPreview: (state, action: PayloadAction<Book>) => {
            state.uploadPreview = action.payload;
        },
        clearUploadPreview: (state) => {
            state.uploadPreview = null;
        },
    },
});

export const {
    setUploadPreview,
    clearUploadPreview,
} = bibliothecaSlice.actions;

// Create a custom root reducer that combines the main slice with sub-feature slices
const bibliothecaReducer = (state: any = {}, action: any) => {
    // Check if this is the initial empty state
    const isInitialState = Object.keys(state).length === 0;
    
    // Extract the main state properties (excluding nested reducers)
    const { browse, library, shelf, market, ...mainStateProps } = state;
    
    // For initial state, pass undefined to get proper initial values
    // Otherwise, pass the current main state props
    const mainState = bibliothecaSlice.reducer(
        isInitialState ? undefined : mainStateProps, 
        action
    );

    // Then get state from the sub-slices
    const browseState = browseReducer(state?.browse, action);
    const libraryState = libraryReducer(state?.library, action);
    const shelfState = shelfReducer(state?.shelf, action);
    const marketState = marketReducer(state?.market, action);

    // Return combined state with main properties at root level
    return {
        ...mainState,
        browse: browseState,
        library: libraryState,
        shelf: shelfState,
        market: marketState,
    };
};

export default bibliothecaReducer;