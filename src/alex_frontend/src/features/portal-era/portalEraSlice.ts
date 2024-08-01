import { Era } from "@/data/eras";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";


// Define the interface for our engine state
export interface PortalEraState {
	visible: boolean,
	selected: Era[],

	loading: boolean;
	error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: PortalEraState = {
    visible: false,
    selected: [],

	loading: false,
	error: null,
};


const portalEraSlice = createSlice({
	name: "portalEra",
	initialState,
	reducers: {
		setVisible: (state, action: PayloadAction<boolean>) => {
			state.visible = action.payload;
		},
		setSelected: (state, action: PayloadAction<Era[]>) => {
			state.selected = action.payload;
		},
	},
});

export const {setVisible, setSelected} = portalEraSlice.actions;

export default portalEraSlice.reducer;
