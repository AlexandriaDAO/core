import { createSlice } from "@reduxjs/toolkit";
import { buildAuthExtraReducers } from "./authExtraReducers";

// Define the interface for our auth state
export interface AuthState {
	user: string | null;

	loading: boolean;
	error: string | null;
}

// Define the initial state using the AuthState interface
const initialState: AuthState = {
	user: null,

	loading: false,
	error: null,
};


const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {},
	extraReducers: buildAuthExtraReducers
});

export const {} = authSlice.actions;

export default authSlice.reducer;
