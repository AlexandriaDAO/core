import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import login from "./thunks/login";


// Define the interface for our auth state
export interface LoginState {
	open: boolean;
	loading: boolean;
	error: string | null;
}

// Define the initial state using the LoginState interface
const initialState: LoginState = {
	open: false,
	loading: false,
	error: null,
};


const loginSlice = createSlice({
	name: "login",
	initialState,
	reducers: {
		setError: (state, action) => {
			state.error = action.payload;
		},
		setLoading: (state, action) => {
			state.loading = action.payload;
		},
		setOpen: (state, action) => {
			state.open = action.payload;
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<LoginState>) => {
		builder
			// login.ts
			.addCase(login.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(login.fulfilled, (state) => {
				state.loading = false;
				state.error = null;
			})
			.addCase(login.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
		}
});

export const {setError, setLoading, setOpen} = loginSlice.actions;

export default loginSlice.reducer;
