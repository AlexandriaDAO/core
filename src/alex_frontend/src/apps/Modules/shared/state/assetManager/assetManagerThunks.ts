import {
  getActorEmporium,
  getActorAssetManager,
  getIcpLedgerActor,
  getLbryActor,
} from "@/features/auth/utils/authUtils";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";

export const createAssetCanister = createAsyncThunk<
  string, // Success type
  {userPrincipal:string},
  { rejectValue: string }
>("assetManager/createAssetCanister", async ({userPrincipal}, { rejectWithValue }) => {
  try {
    const actor = await getActorAssetManager();
    const assetManagerCanisterId=process.env.CANISTER_ID_ASSET_MANAGER!;
    const actorLbryLedger = await getLbryActor();
    let amountFormatApprove: bigint = BigInt(
      Number((Number(1) + 0.04) * 10 ** 8).toFixed(0)
    );
    const checkApproval = await actorLbryLedger.icrc2_allowance({
      account: {
        owner: Principal.fromText(userPrincipal),
        subaccount: [],
      },
      spender: {
        owner: Principal.fromText(assetManagerCanisterId),
        subaccount: [],
      },
    });

    if (checkApproval.allowance < amountFormatApprove) {
      const resultIcpApprove = await actorLbryLedger.icrc2_approve({
        spender: {
          owner: Principal.fromText(assetManagerCanisterId),
          subaccount: [],
        },
        amount: amountFormatApprove,
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        expected_allowance: [],
        expires_at: [],
      });
      if ("Err" in resultIcpApprove) {
        const error = resultIcpApprove.Err;
        let errorMessage = "Unknown error"; // Default error message
        if ("TemporarilyUnavailable" in error) {
          errorMessage = "Service is temporarily unavailable";
        }
        throw new Error(errorMessage);
      }
    }
 
    const result = await actor.create_asset_canister([]);

    if ("Ok" in result) {
      return result.Ok.toString();
    }
    if ("Err" in result) {
      return rejectWithValue(result.Err.toString());
    }

    return rejectWithValue("Unexpected response format");
  } catch (error) {
    console.error("Error creating asset canister:", error);
    return rejectWithValue(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
});

export const getAssetCanister = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>("assetManager/getAssetCanister", async (_, { rejectWithValue }) => {
  try {
    const actor = await getActorAssetManager();
    const result = await actor.get_caller_asset_canister();
    console.log("result isss",result);
    if (result[0]) {
      console.log("result is ",result);
      const canisterId = result[0]?.assigned_canister_id;
      if (!canisterId) {
        return rejectWithValue("No canister ID found");
      }
      return canisterId.toString();
    }
    else{
     return  rejectWithValue("No canister ID found");
    }
  } catch (error) {
    console.error("Error fetching asset canister:", error);
    return rejectWithValue(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
});



export const syncNfts = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>("assetManager/syncNfts", async (_, { rejectWithValue }) => {
  try {
    const actor = await getActorAssetManager();
    return ""
  
  } catch (error) {
    console.error("Error fetching asset canister:", error);
    return rejectWithValue(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
});



