import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { _SERVICE } from "src/declarations/ugd_backend/ugd_backend.did";
import AuthService from "./AuthService";

// Define the interface for our auth state
interface AuthState {
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

// Define the async thunk
export const initialize = createAsyncThunk<
	string | null, // This is the return type of the thunk's payload
	void, //Argument that we pass to initialize
	{ rejectValue: string }
>("auth/initialize", async (_, { rejectWithValue, fulfillWithValue }) => {
	try {
		return fulfillWithValue(await AuthService.getPrincipal());
	} catch (error) {
		if (error instanceof Error) {
			return rejectWithValue(error.message);
		}
	}
	return rejectWithValue(
		"An unknown error occurred while initializing Authentication"
	);
});

export const login = createAsyncThunk<
	string | null,
	void,
	{ rejectValue: string }
>("auth/login", async (_, { rejectWithValue }) => {
	try {
		return await AuthService.login();
	} catch (error) {
		if (error instanceof Error) {
			return rejectWithValue(error.message);
		}
	}
	return rejectWithValue("An unknown error occured while logging in");
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
	"auth/logout",
	async (_, { rejectWithValue }) => {
		try {
			await AuthService.logout();
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
            return rejectWithValue("An unknown error occured while logging out");
		}
	}
);

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder

            // Handle different states of initialization
			.addCase(initialize.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(initialize.fulfilled, (state, action) => {
				state.loading = false;
				state.error = null;
				state.user = action.payload;
			})
			.addCase(initialize.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})


            // Handle different states of login process
			.addCase(login.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(login.fulfilled, (state, action) => {
				state.loading = false;
				state.error = null;
				state.user = action.payload;
			})
			.addCase(login.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})

            // Handle different states of logout process
			.addCase(logout.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(logout.fulfilled, (state, action) => {
				state.loading = false;
				state.error = null;
				state.user = null;
			})
			.addCase(logout.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export const {} = authSlice.actions;

export default authSlice.reducer;
