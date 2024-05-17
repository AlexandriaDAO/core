import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CategoryInterface } from "./utils/category";

// Define the interface for our engine state
export interface PortalCategoryState {
	visible: boolean,
	selected: CategoryInterface[],

	loading: boolean;
	error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: PortalCategoryState = {
    visible: false,
    selected: [],

	loading: false,
	error: null,
};

const portalCategorySlice = createSlice({
	name: "portalCategory",
	initialState,
	reducers: {
		setVisible: (state, action: PayloadAction<boolean>) => {
			state.visible = action.payload;
		},
		setSelected: (state, action: PayloadAction<CategoryInterface[]>) => {
			state.selected = action.payload;
		},
	},
});

export const {setVisible, setSelected} = portalCategorySlice.actions;

export default portalCategorySlice.reducer;
