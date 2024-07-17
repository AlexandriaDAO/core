import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TypeInterface } from "../portal-type/utils/type";
import { CategoryInterface } from "../portal-category/utils/category";
import { Language } from "../portal-language/portalLanguageSlice";
import { PublicationYear } from "../portal-publication-year/portalPublicationYearSlice";

// Define the interface for our engine state
export interface PortalFilterSlice {
	visible: boolean,
	types: TypeInterface[],
	categories: CategoryInterface[],
	languages: Language[],
	years: PublicationYear[],

	loading: boolean;
	error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: PortalFilterSlice = {
    visible: false,
    types: [],
	categories: [],
	languages: [],
	years: [],

	loading: false,
	error: null,
};


const portalFilterSlice = createSlice({
	name: "portalFilter",
	initialState,
	reducers: {
		setVisible: (state, action: PayloadAction<boolean>) => {
			state.visible = action.payload;
		},
		setTypes: (state, action: PayloadAction<TypeInterface[]>) => {
			state.types = action.payload;
		},
		setLanguages: (state, action: PayloadAction<Language[]>) => {
			state.languages = action.payload;
		},
		setCategories: (state, action: PayloadAction<CategoryInterface[]>) => {
			state.categories = action.payload;
		},
		setYears: (state, action: PayloadAction<PublicationYear[]>) => {
			state.years = action.payload;
		},
	},
});

export const {setVisible, setTypes, setLanguages, setCategories, setYears } = portalFilterSlice.actions;

export default portalFilterSlice.reducer;