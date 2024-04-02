import { combineReducers } from "@reduxjs/toolkit";
import portalReducer from "@/features/portal/portalSlice";
import homeReducer from "@/features/home/homeSlice";
import authReducer from "@/features/auth/authSlice";

const rootReducer = combineReducers({
	portal: portalReducer,
	home: homeReducer,
	auth: authReducer
});

export default rootReducer;
