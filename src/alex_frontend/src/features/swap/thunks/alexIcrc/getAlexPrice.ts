import { ActorSubclass } from "@dfinity/agent";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { _SERVICE } from "../../../../../../declarations/icp_swap_factory/icp_swap_factory.did";

const getAlexPrice = createAsyncThunk<string, ActorSubclass<_SERVICE>, { rejectValue: string }>(
  "alex/getAlexPrice",
  async (actor, { rejectWithValue }) => {
    try {
      const poolData = await actor.getPoolsForToken(
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
