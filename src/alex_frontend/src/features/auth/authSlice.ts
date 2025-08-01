import { createSlice } from "@reduxjs/toolkit";
import { buildAuthExtraReducers } from "./authExtraReducers";

export interface SerializedUser {
    principal: string;
    username: string;
    name: string;
    avatar: string;
    librarian: boolean;
    created_at: string;
    updated_at: string;
}

// Define the interface for our auth state
export interface AuthState {
	user: SerializedUser | null,
	canister: string | undefined,
	canisters: Record<string, string>,

	loading: boolean;
	error: string | null;

	librarianLoading: boolean
	librarianError: string | null;

	canisterLoading: boolean
	canisterError: string | null;
}

// Define the initial state using the AuthState interface
const initialState: AuthState = {
	user: null,
	canister: undefined,
	canisters: {},

	loading: false,
	error: null,

	librarianLoading: false,
	librarianError: null,

	canisterLoading: false,
	canisterError: null,
};


const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setUser: (state, action)=>{
			state.user = action.payload;
		},
		setError: (state, action) => {
			state.error = action.payload;
		},
		setLoading: (state, action) => {
			state.loading = action.payload;
		},
	},
	extraReducers: buildAuthExtraReducers
});

export const {setUser, setError, setLoading} = authSlice.actions;

export default authSlice.reducer;
