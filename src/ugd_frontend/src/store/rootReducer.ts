import { combineReducers } from "@reduxjs/toolkit";
import portalReducer from "@/features/portal/portalSlice";
import homeReducer from "@/features/home/homeSlice";
import authReducer from "@/features/auth/authSlice";
import searchReducer from "@/features/search/searchSlice";
import filterReducer from "@/features/filter/filterSlice";

const rootReducer = combineReducers({
	portal: portalReducer,
	home: homeReducer,
	auth: authReducer,
	search: searchReducer,
	filter: filterReducer,
});

export default rootReducer;
