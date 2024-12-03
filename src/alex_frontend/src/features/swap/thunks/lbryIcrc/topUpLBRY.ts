import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { getNftManagerActor } from "@/features/auth/utils/authUtils";
import transferLBRY from "./transferLBRY";

const topUpLBRY = createAsyncThunk<
  string,
  {
    amount: string;
    userPrincipal: string;
  },
  { rejectValue: string }
>(
  "icp_swap/topUpLBRY",
  async ({ amount, userPrincipal }, { dispatch, rejectWithValue }) => {
    try {
      console.log("user principal",userPrincipal);
      const nftManagerId = process.env.CANISTER_ID_NFT_MANAGER!;
      
      if (!nftManagerId) {
        throw new Error("NFT Manager canister ID not found in environment variables");
      }

      const nftManagerActor = await getNftManagerActor();
      const subaccount = await nftManagerActor.principal_to_subaccount(
        Principal.fromText(userPrincipal)
      );

      const result = await dispatch(
        transferLBRY({
          amount,
          destination: nftManagerId,
          subaccount: Array.from(subaccount),
        })
      ).unwrap();

      return result;
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred while topping up LBRY");
    }
  }
);

export default topUpLBRY; 