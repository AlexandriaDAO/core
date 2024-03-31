import { combineReducers } from "@reduxjs/toolkit";
import portalReducer from "@/features/portal/portalSlice";
import homeReducer from "@/features/home/homeSlice";

const rootReducer = combineReducers({
	portal: portalReducer,
	home: homeReducer,
});

export default rootReducer;
