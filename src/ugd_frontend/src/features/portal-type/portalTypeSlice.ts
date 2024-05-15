import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TypeInterface } from "./utils/type";



// Define the interface for our engine state
export interface PoralTypeState {
	visible: boolean,
	selected: TypeInterface[],

	loading: boolean;
	error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: PoralTypeState = {
    visible: false,
    selected: [],

	loading: false,
	error: null,
};


const portalTypeSlice = createSlice({
	name: "portalType",
	initialState,
	reducers: {
		setVisible: (state, action: PayloadAction<boolean>) => {
			state.visible = action.payload;
		},
		setSelected: (state, action: PayloadAction<TypeInterface[]>) => {
			state.selected = action.payload;
		},
	},
});

export const {setVisible, setSelected} = portalTypeSlice.actions;

export default portalTypeSlice.reducer;
