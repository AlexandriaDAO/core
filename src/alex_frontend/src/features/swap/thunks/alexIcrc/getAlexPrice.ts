import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getAlexPrice = createAsyncThunk<string, void, { rejectValue: string }>(
  "alex/getAlexPrice",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://api.dexscreener.com/latest/dex/pairs/icp/kb4fz-oiaaa-aaaag-qnema-cai"
      );
      return response.data.pair.priceUsd; // Ensure the resolved value is returned.
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred while fetching logs");
    }
  }
);
export default getAlexPrice;
