import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { user } from '@/../../declarations/user'; // Adjust path as necessary
import { Principal } from '@dfinity/principal';

interface UserDisplayInfo {
  username: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string;
}

interface UserDisplayState {
  users: { [principal: string]: UserDisplayInfo };
}

const initialState: UserDisplayState = {
  users: {},
};

// Async thunk to fetch username
export const fetchUsername = createAsyncThunk<
  { principal: string; username: string | null }, // Return type
  string, // Argument type (principal string)
  { rejectValue: { principal: string; error: string } } // ThunkApi config for rejectValue
>(
  'userDisplay/fetchUsername',
  async (principalString, { rejectWithValue }) => {
    try {
      const principal = Principal.fromText(principalString);
      const userResult = await user.get_user(principal);
      if ('Ok' in userResult) {
        return { principal: principalString, username: userResult.Ok.username };
      } else {
        // Handle cases where user is not found or other errors defined in userResult.Err
        const errorMsg = Object.keys(userResult.Err)[0] || 'User not found';
        console.warn(`Failed to fetch username for ${principalString}: ${errorMsg}`);
        return { principal: principalString, username: null }; // Still resolve to update status
      }
    } catch (error: any) {
      console.error('Error fetching username:', error);
      return rejectWithValue({ principal: principalString, error: error.message || 'Failed to fetch username' });
    }
  }
);

const userDisplaySlice = createSlice({
  name: 'userDisplay',
  initialState,
  reducers: {
    // Optionally, add a reducer to manually set a username if needed elsewhere
    setUsername(state, action: PayloadAction<{ principal: string; username: string }>) {
      state.users[action.payload.principal] = {
        username: action.payload.username,
        status: 'succeeded',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsername.pending, (state, action) => {
        const principal = action.meta.arg;
        state.users[principal] = { 
          ...state.users[principal], // Keep existing username if any
          username: state.users[principal]?.username || null,
          status: 'loading',
        };
      })
      .addCase(fetchUsername.fulfilled, (state, action) => {
        const { principal, username } = action.payload;
        state.users[principal] = {
          username: username,
          status: 'succeeded',
        };
      })
      .addCase(fetchUsername.rejected, (state, action) => {
        if (action.payload) {
          const { principal, error } = action.payload;
          state.users[principal] = {
            ...state.users[principal], // Keep existing username
            username: state.users[principal]?.username || null,
            status: 'failed',
            error: error,
          };
        } else {
          // Fallback for unexpected rejection without payload
          const principal = action.meta.arg;
          state.users[principal] = {
            ...state.users[principal],
             username: state.users[principal]?.username || null,
            status: 'failed',
            error: action.error.message || 'Unknown error',
          };
        }
      });
  },
});

export const { setUsername } = userDisplaySlice.actions;
export default userDisplaySlice.reducer; 