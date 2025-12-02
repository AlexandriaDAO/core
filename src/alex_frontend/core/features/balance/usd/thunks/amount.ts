import { ActorSubclass } from '@dfinity/agent';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { _SERVICE } from '../../../../../../declarations/stripe/stripe.did';
import { RootState } from '@/store';

const amount = createAsyncThunk<
	number,
	ActorSubclass<_SERVICE>,
	{ rejectValue: string, state: RootState }
>('balance/usd/amount', async (stripe, { rejectWithValue, getState }) => {
		try {
			const {user} = getState().auth;

			// Validate user is logged in
			if (!user?.principal) {
				return rejectWithValue("User is not authenticated");
			}

			const balance = await stripe.get_balance();
			if('Err' in balance) {
				return rejectWithValue(balance.Err);
			}
			if(!('Ok' in balance)) {
				return rejectWithValue('Unexpected response format');
			}
			return Math.max(Number(balance.Ok.balance)/100, 0);
		} catch (error: any) {

			return rejectWithValue(error?.message || 'Failed to fetch USD balance');
		}
	}
);

export default amount;