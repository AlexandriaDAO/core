import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define the async thunk
const getIcpPrice = createAsyncThunk<
  number, // This is the return type of the thunk's payload
  void,
  { rejectValue: string }
>("icp_swap/getIcpPrice", async (_, { rejectWithValue }) => {
  try {
    const options = {
      method: "GET",
      url: "https://api.coingecko.com/api/v3/coins/markets",
      params: {
        vs_currency: "usd",
        ids: "internet-computer",
      },
      headers: {
        accept: "application/json",
        "x-cg-demo-api-key": process.env.REACT_APP_COIN_GECKO_ID,
      },
    };
    
    const response = await axios.request(options);
    console.log("ICP Price:", response.data[0].current_price);
    return response.data[0].current_price;
  } catch (error) {
    console.error("Failed to get ICP price:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("An unknown error occurred while fetching ICP price");
  }
});

export default getIcpPrice;
