import { createSlice } from "@reduxjs/toolkit";

// Define the interface for our search state
interface SearchState {
	types: Array<number>;
	subTypes: Array<number>;
}

// Define the initial state using the SearchState interface
const initialState: SearchState = {
	types: [],
	subTypes: [],
};



const filterSlice = createSlice({
	name: "filter",
	initialState,
	reducers: {
        toggleType(state, action){
            const index = state.types.indexOf(action.payload);
            if (index === -1) {
                // The type is not currently in the array, so add it directly using push
                state.types.push(action.payload);
            } else {
                // The type is already in the array, so remove it using splice
                state.types.splice(index, 1);
            }
        },
        setTypes(state, action){
            state.types = action.payload
        },
        toggleSubType(state, action){
            const index = state.subTypes.indexOf(action.payload);
            if (index === -1) {
                state.subTypes.push(action.payload);
            } else {
                state.subTypes.splice(index, 1);
            }
        },
        setSubTypes(state, action){
            state.subTypes = action.payload
        },
    },
});

export const {toggleType, setTypes, toggleSubType, setSubTypes} = filterSlice.actions;

export default filterSlice.reducer;
