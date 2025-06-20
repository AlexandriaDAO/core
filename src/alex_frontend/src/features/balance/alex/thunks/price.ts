import { createAsyncThunk } from '@reduxjs/toolkit';

import { icp_swap_factory } from '../../../../../../declarations/icp_swap_factory';

// ALEX token canister ID
const ALEX_TOKEN_ID = 'ysy5f-2qaaa-aaaap-qkmmq-cai';

const price = createAsyncThunk<
	number,
	void,
	{ rejectValue: string }
>('balance/alex/price', async (_, { rejectWithValue }) => {
	try {
		return 0.3;
		// Check if ICP Swap Factory actor is available
		if (!icp_swap_factory) {
			return rejectWithValue('ICP Swap Factory canister not available');
		}

		// Validate icpSwapFactory has required method
		if (typeof icp_swap_factory.getPoolsForToken !== 'function') {
			return rejectWithValue('Invalid icpSwapFactory: getPoolsForToken method not found');
		}

		const poolData = await icp_swap_factory.getPoolsForToken(ALEX_TOKEN_ID);

		// Validate pool data response
		if (!poolData || !Array.isArray(poolData) || poolData.length === 0) {
			return rejectWithValue('No pool data found for ALEX token');
		}

		const firstPool = poolData[0];
		if (!firstPool || !firstPool.token0Price) {
			return rejectWithValue('Invalid pool data: missing token0Price');
		}

		const priceString = firstPool.token0Price.toString();
		const price = parseFloat(priceString);

		// Validate price
		if (isNaN(price) || price <= 0) {
			return rejectWithValue(`Invalid price value: ${priceString}`);
		}

		// Basic sanity check for price range
		if (price > 1000000) {
			return rejectWithValue(`Price out of reasonable range: ${price}`);
		}

		return price;
	} catch (error: any) {
		// Handle different types of errors
		if (error?.message?.includes('network')) {
			return rejectWithValue('Network error: Unable to connect to ICP Swap Factory');
		}
		if (error?.message?.includes('canister')) {
			return rejectWithValue('Canister error: Unable to communicate with ICP Swap Factory');
		}
		if (error?.message?.includes('timeout')) {
			return rejectWithValue('Request timeout: ICP Swap Factory did not respond in time');
		}
		if (error?.message?.includes('token')) {
			return rejectWithValue('Token not found or not supported by ICP Swap Factory');
		}

		return rejectWithValue(error?.message || 'Failed to fetch ALEX price');
	}
});

export default price;