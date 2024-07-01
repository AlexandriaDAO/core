import { combineReducers } from "@reduxjs/toolkit";
import portalReducer from "@/features/portal/portalSlice";
import homeReducer from "@/features/home/homeSlice";
import authReducer from "@/features/auth/authSlice";
import searchReducer from "@/features/search/searchSlice";
import filterReducer from "@/features/filter/filterSlice";

import myEnginesReducer from "@/features/my-engines/myEnginesSlice";
import publicEnginesReducer from "@/features/public-engines/publicEnginesSlice";
import engineOverviewReducer from "@/features/engine-overview/engineOverviewSlice";
import portalCategoryReducer from "@/features/portal-category/portalCategorySlice";
import portalLanguageReducer from "@/features/portal-language/portalLanguageSlice";
import portalTypeReducer from "@/features/portal-type/portalTypeSlice";
import portalPublicationYearReducer from "@/features/portal-publication-year/portalPublicationYearSlice";
import portalFilterReducer from "@/features/portal-filter/portalFilterSlice";
import librarianReducer from "@/features/librarian/librarianSlice";
import librarianProfileReducer from "@/features/librarian-profile/librarianProfileSlice";
import myNodesReducer from "@/features/my-nodes/myNodesSlice";
import nodesReducer from "@/features/nodes/nodesSlice";
import mintReducer from "@/features/mint/mintSlice";

const rootReducer = combineReducers({
	portal: portalReducer,
	home: homeReducer,
	auth: authReducer,
	search: searchReducer,
	filter: filterReducer,

	myEngines: myEnginesReducer,
	publicEngines: publicEnginesReducer,
	engineOverview: engineOverviewReducer,

	portalCategory: portalCategoryReducer,
	portalLanguage: portalLanguageReducer,
	portalType: portalTypeReducer,
	portalPublicationYear: portalPublicationYearReducer,

	portalFilter: portalFilterReducer,

	librarian: librarianReducer,
	librarianProfile: librarianProfileReducer,

	myNodes: myNodesReducer,

	mint: mintReducer,

	nodes: nodesReducer,
});

export default rootReducer;
