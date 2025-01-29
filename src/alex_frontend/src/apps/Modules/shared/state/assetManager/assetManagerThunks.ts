import {
  getActorEmporium,
  getActorAssetManager,
  getIcpLedgerActor,
  getLbryActor,
  getIcrc7Actor,
} from "@/features/auth/utils/authUtils";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { natToArweaveId } from "@/utils/id_convert";
import { upload } from "./uploadToAssetCanister";

export const createAssetCanister = createAsyncThunk<
  string, // Success type
  { userPrincipal: string },
  { rejectValue: string }
>(
  "assetManager/createAssetCanister",
  async ({ userPrincipal }, { rejectWithValue }) => {
    try {
      const actor = await getActorAssetManager();
      const assetManagerCanisterId = process.env.CANISTER_ID_ASSET_MANAGER!;
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
  }
);

export const getAssetCanister = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>("assetManager/getAssetCanister", async (_, { rejectWithValue }) => {
  try {
    const actor = await getActorAssetManager();
    const result = await actor.get_caller_asset_canister();
    console.log("result isss", result);
    if (result[0]) {
      const canisterId = result[0]?.assigned_canister_id;
      if (!canisterId) {
        return rejectWithValue("No canister ID found");
      }
      return canisterId.toString();
    } else {
      return rejectWithValue("No canister ID found");
    }
  } catch (error) {
    console.error("Error fetching asset canister:", error);
    return rejectWithValue(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
});
export interface syncProgressInterface {
  currentItem: string;
  progress: number;
  totalSynced: number;
  currentProgress: number;
  // attempt?: number;
}
export const syncNfts = createAsyncThunk<
  string,
  {
    userPrincipal: string;
    userAssetCanister: string;
    setSyncProgress: React.Dispatch<
      React.SetStateAction<syncProgressInterface>
    >;
    syncProgress: syncProgressInterface;
  },
  { rejectValue: string }
>(
  "assetManager/syncNfts",
  async (
    { userPrincipal, userAssetCanister, setSyncProgress, syncProgress },
    { rejectWithValue }
  ) => {
    try {
      const actorIcrc7 = await getIcrc7Actor();
      const countLimit = [BigInt(10000)] as [bigint];

      // Fetch user's NFTs
      const result = await actorIcrc7.icrc7_tokens_of(
        {
          owner: Principal.fromText(userPrincipal),
          subaccount: [],
        },
        [],
        countLimit
      );

      if (!Array.isArray(result) || result.length === 0) {
        console.warn("No tokens found for the specified user.");
      }
      const tokens = result.map((value) => natToArweaveId(value));
      console.log("tokens are ", tokens);
      tokens.reduce(async (prevPromise, token) => {
        await prevPromise; //  before starting the next one

        console.log("https://arweave.net/" + token);

        const result = await upload({
          assetCanisterId: userAssetCanister,
          itemUrl: "https://arweave.net/" + token,
          id: token,
          setSyncProgress,
          syncProgress,
        });

        // if (result === true) {
        //   setSyncedCount((prevCount) => prevCount + 1);
        // }
      }, Promise.resolve()); // Initial value to start the chain

      //  upload({ assetCanisterId: assetManager.userAssetCanister, setUploadProgress })
      return "";
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
);
