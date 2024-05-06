import { createSlice } from "@reduxjs/toolkit";
import { buildAuthExtraReducers } from "./authExtraReducers";

// Define the interface for our auth state
export interface AuthState {
	user: string;

	loading: boolean;
	error: string | null;
}

// Define the initial state using the AuthState interface
const initialState: AuthState = {
	user: '',

	loading: false,
	error: null,
};


const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setUser: (state, action)=>{
			state.user = action.payload;
		}
	},
	extraReducers: buildAuthExtraReducers
});

export const {setUser} = authSlice.actions;

export default authSlice.reducer;
