import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface PublicationYear {
    start: string;
    end: string;
}


// Define the interface for our engine state
export interface PortalPublicationYearState {
	visible: boolean,
	selected: PublicationYear[],

	loading: boolean;
	error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: PortalPublicationYearState = {
    visible: false,
    selected: [],

	loading: false,
	error: null,
};


const portalPublicationYearSlice = createSlice({
	name: "portalPublicationYear",
	initialState,
	reducers: {
		setVisible: (state, action: PayloadAction<boolean>) => {
			state.visible = action.payload;
		},
		setSelected: (state, action: PayloadAction<PublicationYear[]>) => {
			state.selected = action.payload;
		},
	},
});

export const {setVisible, setSelected} = portalPublicationYearSlice.actions;

export default portalPublicationYearSlice.reducer;
