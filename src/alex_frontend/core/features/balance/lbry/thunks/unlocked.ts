import { createAsyncThunk } from '@reduxjs/toolkit';
import { Principal } from '@dfinity/principal';

import { LBRY } from '../../../../../../declarations/LBRY';
import { RootState } from '@/store';

// LBRY uses 8 decimal places (e8s)
const LBRY_DECIMALS = 100000000;

const unlocked = createAsyncThunk<
	number,
	void,
	{ rejectValue: string, state: RootState }
>('balance/lbry/unlocked', async (_, { rejectWithValue, getState }) => {
	try {
		const {user} = getState().auth;
		const account = user?.principal;

		// Validate account parameter
		if (!account) {
			return rejectWithValue("User is not authenticated");
		}

		if (typeof account !== 'string') {
			return rejectWithValue('Invalid account format');
		}

		// Validate principal format
		let principal: Principal;
		try {
			principal = Principal.fromText(account);
		} catch (principalError) {
			return rejectWithValue('Invalid principal format');
		}

		// Check if LBRY actor is available
		if (!LBRY) {
			return rejectWithValue('LBRY canister not available');
		}

		const balance = await LBRY.icrc1_balance_of({
			owner: principal,
			subaccount: [],
		});

		// Validate balance response
		if (balance === undefined || balance === null) {
			return rejectWithValue('Invalid balance response: No balance data received');
		}

		const numericBalance = Number(balance);
		if (isNaN(numericBalance) || numericBalance < 0) {
			return rejectWithValue(`Invalid balance value: ${balance}`);
		}

		// Convert from e8s to LBRY
		return numericBalance / LBRY_DECIMALS;
	} catch (error: any) {
		// Handle different types of errors
		if (error?.message?.includes('network')) {
			return rejectWithValue('Network error: Unable to connect to LBRY canister');
		}
		if (error?.message?.includes('principal')) {
			return rejectWithValue('Invalid principal or account not found');
		}
		if (error?.message?.includes('canister')) {
			return rejectWithValue('Canister error: Unable to communicate with LBRY canister');
		}
		if (error?.message?.includes('timeout')) {
			return rejectWithValue('Request timeout: LBRY canister did not respond in time');
		}

		return rejectWithValue(error?.message || 'Failed to fetch LBRY balance');
	}
});

export default unlocked;