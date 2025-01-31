import {
  getActorEmporium,
  getActorAssetManager,
  getIcpLedgerActor,
  getLbryActor,
  getIcrc7Actor,
  getActorUserAssetCanister,
} from "@/features/auth/utils/authUtils";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { natToArweaveId } from "@/utils/id_convert";
import { upload } from "./uploadToAssetCanister";
import { loadContentForTransactions } from "../content/contentDisplayThunks";
import { fetchTransactionsForAlexandrian } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";

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
    { dispatch, rejectWithValue }
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

      const fetchedTransactions = JSON.stringify(
        await fetchTransactionsForAlexandrian(tokens)
      );
      
// Step 1: Upload fetchedTransactions JSON first
const transactionUploadResult = await upload({
  assetCanisterId: userAssetCanister,
  id: "ContentData",
  setSyncProgress,
  syncProgress,
  contentData: fetchedTransactions, // Only sending JSON data first
});

if (!transactionUploadResult) {
  throw new Error("Failed to upload transaction data.");
}

console.log("Transaction data uploaded successfully!");

// Step 2: Upload NFTs one by one

      console.log("tokens are ", tokens);
      tokens.reduce(async (prevPromise, token) => {
        await prevPromise; //  before starting the next one
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

export const fetchUserNfts = createAsyncThunk<
  string[],
  {
    userPrincipal: string;
    userAssetCanister: string;
  },
  { rejectValue: string }
>(
  "assetManager/fetchNfts",
  async ({ userPrincipal, userAssetCanister }, { rejectWithValue }) => {
    try {
      const actorIcrc7 = await getIcrc7Actor();
      const assetActor = await getActorUserAssetCanister(userAssetCanister);

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

      const urls = await Promise.all(
        tokens.map(async (id) => {
          const result = await fetchAssetFromUserCanister(id, assetActor);
          return result?.blob ? URL.createObjectURL(result.blob) : "";
        })
      );
      console.log("urls", urls);

      return urls;
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
);

export const fetchAssetFromUserCanister = async (key: string, actor: any) => {
  try {
    // Query to get the file by key
    const fileRecord = await actor.get({
      key: key,
      accept_encodings: ["identity"],
    });

    if (fileRecord) {
      const { content, content_type } = fileRecord;

      // Ensure content is properly handled as Uint8Array
      const contentArray = Array.isArray(content)
        ? new Uint8Array(content)
        : content;

      // Create blob with proper content type and streaming support
      const blob = new Blob([contentArray], {
        type: content_type,
      });

      return { blob, contentType: content_type };
    } else {
      console.log("File not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching file:", error);
    return null;
  }
};
