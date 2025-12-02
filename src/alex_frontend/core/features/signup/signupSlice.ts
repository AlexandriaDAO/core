import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import signup from "./thunks/signup";


// Define the interface for our signup state
export interface SignupState {
	loading: boolean;
	error: string | null;
}

// Define the initial state using the SignupState interface
const initialState: SignupState = {
	loading: false,
	error: null,
};


const signupSlice = createSlice({
	name: "signup",
	initialState,
	reducers: {
		setError: (state, action) => {
			state.error = action.payload;
		},
		setLoading: (state, action) => {
			state.loading = action.payload;
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<SignupState>) => {
		builder
			// signup.ts
			.addCase(signup.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(signup.fulfilled, (state) => {
				state.loading = false;
				state.error = null;
			})
			.addCase(signup.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
		}
});

export const {setError, setLoading} = signupSlice.actions;

export default signupSlice.reducer;
