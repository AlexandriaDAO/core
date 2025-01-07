import { getIcpSwapFactoryCanister } from "@/features/auth/utils/authUtils";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getAlexPrice = createAsyncThunk<string, void, { rejectValue: string }>(
  "alex/getAlexPrice",
  async (_, { rejectWithValue }) => {
    try {
      const factorySwapCanister = await getIcpSwapFactoryCanister();
      const poolData = await factorySwapCanister.getPoolsForToken(
        "ysy5f-2qaaa-aaaap-qkmmq-cai"
      );
      return poolData[0].token0Price.toString();
    } catch (error) {
      if (error instanceof Error) {
        console.log("error is", error);
        return rejectWithValue(error.message);
      }
      return rejectWithValue(
        "An unknown error occurred while fetching ALEX price"
      );
    }
  }
);

export default getAlexPrice;
