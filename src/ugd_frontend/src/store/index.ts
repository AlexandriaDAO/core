import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

export const store = configureStore({reducer: rootReducer});

// Type for the state of the app, using direct store reference
export type RootState = ReturnType<typeof store.getState>;

// Type for the dispatch function from the store
export type AppDispatch = typeof store.dispatch;