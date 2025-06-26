import { createAsyncThunk } from '@reduxjs/toolkit';
import { Principal } from '@dfinity/principal';

import { icp_ledger_canister } from '../../../../../../declarations/icp_ledger_canister'
import { RootState } from '@/store';

// Debug import
console.log('[ICP Balance Import] icp_ledger_canister at import time:', icp_ledger_canister);

// ICP uses 8 decimal places (e8s)
const ICP_DECIMALS = 100000000;

const amount = createAsyncThunk<
	number,
	void,
	{ rejectValue: string, state: RootState }
>('balance/icp/amount', async (_, { rejectWithValue, getState }) => {
		try {
			// Debug logging
			console.log('[ICP Balance] icp_ledger_canister:', icp_ledger_canister);
			console.log('[ICP Balance] icp_ledger_canister methods:', icp_ledger_canister ? Object.keys(icp_ledger_canister) : 'undefined');
			
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

			console.log('[ICP Balance] About to call icrc1_balance_of with principal:', principal.toText());
			
			const balance = await icp_ledger_canister.icrc1_balance_of({
				owner: principal,
				subaccount: [],
			});
			
			console.log('[ICP Balance] Balance response:', balance);

			// Convert from e8s to ICP
			return Number(balance) / ICP_DECIMALS;
		} catch (error: any) {
			console.error('[ICP Balance] Full error:', error);
			console.error('[ICP Balance] Error stack:', error?.stack);
			console.error('[ICP Balance] Error type:', typeof error);
			console.error('[ICP Balance] Error constructor:', error?.constructor?.name);
			
			// Handle different types of errors
			if (error?.message?.includes('network')) {
				return rejectWithValue('Network error: Unable to connect to ICP ledger');
			}
			if (error?.message?.includes('principal')) {
				return rejectWithValue('Invalid principal or account not found');
			}

			return rejectWithValue(error?.message || 'Failed to fetch ICP balance');
		}
	}
);

export default amount;