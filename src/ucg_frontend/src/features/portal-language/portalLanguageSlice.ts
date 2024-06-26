import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface Language {
	code: string;
	name: string;
	flag: string; // ISO country code for the flag
}

// Define the interface for our engine state
export interface PoralLanguageState {
	visible: boolean,
	selected: Language[],

	loading: boolean;
	error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: PoralLanguageState = {
    visible: false,
    selected: [],

	loading: false,
	error: null,
};


const portalLanguageSlice = createSlice({
	name: "portalLanguage",
	initialState,
	reducers: {
		setVisible: (state, action: PayloadAction<boolean>) => {
			state.visible = action.payload;
		},
		setSelected: (state, action: PayloadAction<Language[]>) => {
			state.selected = action.payload;
		},
	},
});

export const {setVisible, setSelected} = portalLanguageSlice.actions;

export default portalLanguageSlice.reducer;