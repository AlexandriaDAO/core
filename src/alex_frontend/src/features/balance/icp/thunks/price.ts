import { createAsyncThunk } from "@reduxjs/toolkit";
import { PRICE_SERVICES } from "../service";
import { fetchWithTimeout } from "../utils";

const price = createAsyncThunk<
	number,
	void,
	{ rejectValue: string }
>("balance/icp/price", async (_, { rejectWithValue }) => {
		const errors: string[] = [];

		for (const service of PRICE_SERVICES) {
			try {
				const response = await fetchWithTimeout( service.url, service.timeout);

				if (!response.ok)
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);

				const data = await response.json();

				// Check for API-specific error responses
				if (data.error && Array.isArray(data.error) && data.error.length > 0)
					throw new Error(`API Error: ${data.error.join(", ")}`);

				if (data.code && data.code !== "200000")
					throw new Error(`API Error: ${data.msg || "Unknown API error"}`);

				const price = service.parseResponse(data);

				if (typeof price === "number" && !isNaN(price) && price > 0 && price < 1000000)
					return price;

				throw new Error(`Invalid price data: ${price}`);
			} catch (error: any) {
				const errorMsg =
					error.name === "AbortError"
						? `${service.name}: Request timeout`
						: `${service.name}: ${error?.message || "Unknown error"}`;

				errors.push(errorMsg);

				console.warn(`Failed to fetch ICP price from ${service.name}:`, error);
			}
		}

		// All services failed
		return rejectWithValue(
			`Failed to fetch ICP price from all sources. Errors: ${errors.join("; ")}`
		);
	}
);

export default price;
