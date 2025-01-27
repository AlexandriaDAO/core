import { getAssetManagerCanister } from "@/features/auth/utils/authUtils";
import { createAsyncThunk } from "@reduxjs/toolkit/dist";

interface CreateAssetCanisterParams {}

export const createAssetCanister = createAsyncThunk(
  "assetManager/createAssetCanister",
  async ({}, { rejectWithValue, dispatch }) => {
    try {
      const actor = await getAssetManagerCanister();
      const result = await actor.create_asset_canister([]);
      if ("Ok" in result) {
        return "success";
      } else if ("Err" in result) {
        return rejectWithValue(result?.Err); // Use rejectWithValue directly
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }
);
