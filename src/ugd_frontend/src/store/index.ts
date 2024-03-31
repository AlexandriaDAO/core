import { configureStore } from "@reduxjs/toolkit";
import portalReducer from "@/features/portal/portalSlice";
import homeReducer from "@/features/home/homeSlice";

export const makeStore = () => {
	return configureStore({
		reducer: {
			portal: portalReducer,
			home: homeReducer,
		}
	});
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
