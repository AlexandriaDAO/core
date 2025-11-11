import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import browseReducer from "./browse/browseSlice";
import { Audio } from "./types";

// Keep minimal state for AudioPlayer component compatibility
const initialState = {
    selected: null as Audio | null,
};

const sonoraSlice = createSlice({
    name: "sonora",
    initialState,
    reducers: {
        setSelected: (state, action: PayloadAction<Audio>) => {
            state.selected = action.payload;
        },
        clearSelected: (state) => {
            state.selected = null;
        },
    },
});

export const {
    setSelected,
    clearSelected,
} = sonoraSlice.actions;

// Create a custom root reducer that combines the main slice with sub-feature slices
const sonoraReducer = (state: any = {}, action: any) => {
    // Check if this is the initial empty state
    const isInitialState = Object.keys(state).length === 0;
    
    // Extract the main state properties (excluding nested reducers)
    const { browse, ...mainStateProps } = state;
    
    // For initial state, pass undefined to get proper initial values
    // Otherwise, pass the current main state props
    const mainState = sonoraSlice.reducer(
        isInitialState ? undefined : mainStateProps, 
        action
    );

    // Then get state from the browse sub-slice
    const browseState = browseReducer(state?.browse, action);

    // Return combined state with main properties at root level
    return {
        ...mainState,
        browse: browseState,
    };
};

export default sonoraReducer;