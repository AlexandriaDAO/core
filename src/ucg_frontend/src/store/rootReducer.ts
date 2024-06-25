import { combineReducers } from "@reduxjs/toolkit";
import portalReducer from "src/ucg_frontend/src/features/portal/portalSlice";
import homeReducer from "src/ucg_frontend/src/features/home/homeSlice";
import authReducer from "src/ucg_frontend/src/features/auth/authSlice";
import searchReducer from "src/ucg_frontend/src/features/search/searchSlice";
import filterReducer from "src/ucg_frontend/src/features/filter/filterSlice";

import myEnginesReducer from "src/ucg_frontend/src/features/my-engines/myEnginesSlice";
import publicEnginesReducer from "src/ucg_frontend/src/features/public-engines/publicEnginesSlice";
import engineOverviewReducer from "src/ucg_frontend/src/features/engine-overview/engineOverviewSlice";
import portalCategoryReducer from "src/ucg_frontend/src/features/portal-category/portalCategorySlice";
import portalLanguageReducer from "src/ucg_frontend/src/features/portal-language/portalLanguageSlice";
import portalTypeReducer from "src/ucg_frontend/src/features/portal-type/portalTypeSlice";
import portalPublicationYearReducer from "src/ucg_frontend/src/features/portal-publication-year/portalPublicationYearSlice";
import portalFilterReducer from "src/ucg_frontend/src/features/portal-filter/portalFilterSlice";

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
});

export default rootReducer;
