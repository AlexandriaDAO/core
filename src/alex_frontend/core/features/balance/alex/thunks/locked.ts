import { createAsyncThunk } from '@reduxjs/toolkit';
import { Principal } from '@dfinity/principal';

import { ALEX } from '../../../../../../declarations/ALEX';
import { nft_manager } from '../../../../../../declarations/nft_manager';
import { RootState } from '@/store';

// ALEX uses 8 decimal places (e8s)
const ALEX_DECIMALS = 100000000;

const locked = createAsyncThunk<
	number,
	void,
	{ rejectValue: string, state: RootState }
>('balance/alex/locked', async (_, { rejectWithValue, getState }) => {
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

		// Check if actors are available
		if (!ALEX) {
			return rejectWithValue('ALEX canister not available');
		}
		if (!nft_manager) {
			return rejectWithValue('NFT Manager canister not available');
		}

		// Get NFT Manager canister ID from environment
		const nftManagerId = process.env.CANISTER_ID_NFT_MANAGER;
		if (!nftManagerId) {
			return rejectWithValue('NFT Manager canister ID not found in environment variables');
		}

		// Get subaccount for the user
		const subaccount = await nft_manager.principal_to_subaccount(principal);

		// Get balance from ALEX canister
		const balance = await ALEX.icrc1_balance_of({
			owner: Principal.fromText(nftManagerId),
			subaccount: [subaccount],
		});

		// Validate balance response
		if (balance === undefined || balance === null) {
			return rejectWithValue('Invalid balance response: No balance data received');
		}

		const numericBalance = Number(balance);
		if (isNaN(numericBalance) || numericBalance < 0) {
			return rejectWithValue(`Invalid balance value: ${balance}`);
		}
		// Convert from e8s to ALEX
		return numericBalance / ALEX_DECIMALS;
	} catch (error: any) {
		// Handle different types of errors
		if (error?.message?.includes('network')) {
			return rejectWithValue('Network error: Unable to connect to canisters');
		}
		if (error?.message?.includes('principal')) {
			return rejectWithValue('Invalid principal or account not found');
		}
		if (error?.message?.includes('canister')) {
			return rejectWithValue('Canister error: Unable to communicate with canisters');
		}
		if (error?.message?.includes('timeout')) {
			return rejectWithValue('Request timeout: Canisters did not respond in time');
		}
		if (error?.message?.includes('subaccount')) {
			return rejectWithValue('Error getting user subaccount from NFT Manager');
		}

		return rejectWithValue(error?.message || 'Failed to fetch ALEX spending balance');
	}
});

export default locked;