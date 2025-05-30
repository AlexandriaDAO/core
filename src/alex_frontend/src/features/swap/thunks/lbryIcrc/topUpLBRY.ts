import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import transferLBRY from "./transferLBRY";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICELBRY } from "../../../../../../declarations/LBRY/LBRY.did";
import { _SERVICE as _SERVICENFTMANAGER } from "../../../../../../declarations/nft_manager/nft_manager.did";

const topUpLBRY = createAsyncThunk<
  string,
  {
    nftManagerActor: ActorSubclass<_SERVICENFTMANAGER>,
    lbryActor: ActorSubclass<_SERVICELBRY>,
    amount: string;
    userPrincipal: string;
  },
  { rejectValue: string }
>(
  "icp_swap/topUpLBRY",
  async ({ nftManagerActor, lbryActor, amount, userPrincipal }, { dispatch, rejectWithValue }) => {
    try {
      console.log("topUpLBRY thunk started", { amount, userPrincipal });
      
      const nftManagerId = process.env.CANISTER_ID_NFT_MANAGER!;
      
      if (!nftManagerId) {
        throw new Error("NFT Manager canister ID not found in environment variables");
      }

      console.log("Getting nftManagerActor");
      
      console.log("Converting principal and getting subaccount");
      const subaccount = await nftManagerActor.principal_to_subaccount(
        Principal.fromText(userPrincipal)
      );

      console.log("Dispatching transferLBRY", { amount, nftManagerId, subaccount });
      const result = await dispatch(
        transferLBRY({
          actor: lbryActor,
          amount,
          destination: nftManagerId,
          subaccount: Array.from(subaccount),
        })
      ).unwrap();

      console.log("transferLBRY result:", result);
      return result;
    } catch (error) {
      console.error("TopUpLBRY error:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred while topping up LBRY");
    }
  }
);

export default topUpLBRY; 