import { combineReducers } from "@reduxjs/toolkit";
import portalReducer from "@/features/portal/portalSlice";
import homeReducer from "@/features/home/homeSlice";
import authReducer from "@/features/auth/authSlice";
import searchReducer from "@/features/search/searchSlice";
import filterReducer from "@/features/filter/filterSlice";

import myEnginesReducer from "@/features/my-engines/myEnginesSlice";
import publicEnginesReducer from "@/features/public-engines/publicEnginesSlice";
import engineOverviewReducer from "@/features/engine-overview/engineOverviewSlice";

const rootReducer = combineReducers({
	portal: portalReducer,
	home: homeReducer,
	auth: authReducer,
	search: searchReducer,
	filter: filterReducer,

	myEngines: myEnginesReducer,
	publicEngines: publicEnginesReducer,
	engineOverview: engineOverviewReducer,
});

export default rootReducer;
