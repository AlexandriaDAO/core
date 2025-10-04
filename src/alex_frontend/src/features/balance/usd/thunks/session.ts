import { ActorSubclass } from '@dfinity/agent';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { _SERVICE } from '../../../../../../declarations/stripe/stripe.did';
import { RootState } from '@/store';

const session = createAsyncThunk<
	string,
	{ actor: ActorSubclass<_SERVICE>; amount: number },
	{ rejectValue: string, state: RootState }
>('balance/usd/session', async ({ actor, amount }, { rejectWithValue, getState }) => {
		try {
			const { user } = getState().auth;

			// Validate user is logged in
			if (!user?.principal) {
				return rejectWithValue("User is not authenticated");
			}

			const result = await actor.create_session(BigInt(amount));
			
			// Check if result is a string (success) or contains an error
			if (typeof result === 'string') {
				// Check if it's an error message
				if (result.startsWith('Error:') || result.startsWith('First request failed:') || result.startsWith('Second request failed:')) {
					return rejectWithValue(result);
				}
				// Should be a Stripe checkout URL
				return result;
			} else {
				return rejectWithValue('Unexpected response format from create_session');
			}
		} catch (error: any) {
			return rejectWithValue(error?.message || 'Failed to create payment session');
		}
	}
);

export default session;