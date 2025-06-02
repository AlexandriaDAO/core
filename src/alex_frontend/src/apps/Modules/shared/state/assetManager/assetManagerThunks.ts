import {
  getActorAssetManager,
  getLbryActor,
  getIcrc7Actor,
  getActorUserAssetCanister,
} from "@/features/auth/utils/authUtils";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { natToArweaveId } from "@/utils/id_convert";
import { uploadAsset } from "./uploadToAssetCanister";
import { fetchTransactionsForAlexandrian } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";
import { RootState } from "@/store";
import { createTokenAdapter } from "@/apps/Modules/shared/adapters/TokenAdapter";

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
        Number((Number(10) + 0.04) * 10 ** 8).toFixed(0)
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

      const result = await actor.create_asset_canister();

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

export const getCallerAssetCanister = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>("assetManager/getCallerAssetCanister", async (_, { rejectWithValue }) => {
  try {
    const actor = await getActorAssetManager();
    const result = await actor.get_caller_asset_canister();
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
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      const nftAdapter = createTokenAdapter("NFT");

      const result = await nftAdapter.getTokensOf(
        Principal.fromText(userPrincipal),
        undefined,
        BigInt(10000)
      );

      const tokens: string[] = [];
      for (const tokenId of result) {
        const nftData = await nftAdapter.tokenToNFTData(tokenId, userPrincipal);
        tokens.push(nftData.arweaveId);
      }

      const fetchedTransactions = JSON.stringify(
        await fetchTransactionsForAlexandrian(tokens)
      );

      const state = getState() as RootState;
      const assetManager = state.assetManager;
      const assetCanisterId = assetManager.userAssetCanister;

      const transactionUploadResult = await uploadAsset({
        assetCanisterId: assetCanisterId || "",
        id: "ContentData",
        setSyncProgress,
        syncProgress,
        contentData: fetchedTransactions,
        assetList: assetManager.assetList,
      });

      if (!transactionUploadResult) {
        throw new Error("Failed to upload transaction data.");
      }

      tokens.reduce(async (prevPromise, token) => {
        await prevPromise;
        const result = await uploadAsset({
          assetCanisterId: assetCanisterId || "",
          itemUrl: "https://arweave.net/" + token,
          id: token,
          setSyncProgress,
          syncProgress,
          assetList: assetManager.assetList,
        });
      }, Promise.resolve());

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

      const countLimit = [BigInt(10000)] as [bigint];

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
          const assetResult = await fetchAssetFromUserCanister(id, userAssetCanister);
          return assetResult?.blob ? URL.createObjectURL(assetResult.blob) : "";
        })
      );

      return urls;
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
);

export const getAssetList = createAsyncThunk<
  Array<{ key: string; content_type: string }>,
  string,
  { rejectValue: string }
>("assetManager/getAssetList", async (canisterId, { rejectWithValue }) => {
  if (!canisterId) {
    return rejectWithValue("No canister ID found");
  }

  try {
    const assetActor = await getActorUserAssetCanister(canisterId);
    const result = await assetActor.list({});

    if (!result || !Array.isArray(result.entries)) {
      return rejectWithValue("Invalid response from asset canister");
    }

    const simplifiedList = Array.from(result.entries()).map(([key, value]) => ({
      key: value.key,
      content_type: value.content_type || "unknown",
    }));
    return simplifiedList;
  } catch (error) {
    console.error("Error fetching asset canister:", error);
    return rejectWithValue(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
});

export const getCanisterCycles = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("assetManager/getCanisterCycles", async (canisterId, { rejectWithValue }) => {
  if (!canisterId) {
    return rejectWithValue("No canister ID found");
  }

  try {
    const actor = await getActorAssetManager();

    const result = await actor.get_canister_cycles(Principal.fromText(canisterId));
    if ("Ok" in result) {
      return result.Ok.toString();
    }
    if ("Err" in result) {
      return rejectWithValue(result.Err.toString());
    }
    
    return rejectWithValue("Unexpected response format");
  }
  catch (error) {
    console.error("Error fetching asset canister:", error);
    return rejectWithValue(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
});

export const fetchAssetFromUserCanister = async (
  arweaveId: string,
  canisterId: string
): Promise<{ blob: Blob; contentType: string } | null> => {
  const url = `https://${canisterId}.raw.ic0.app/arweave/${arweaveId}`;
  console.log(`[assetManagerThunks] fetchAssetFromUserCanister: Attempting to fetch from URL: "${url}"`);

  const icpFetchStart = performance.now();
  let responseStatus = 0;

  try {
    const networkStart = performance.now();
    const response = await fetch(url);
    const networkEnd = performance.now();
    responseStatus = response.status;
    console.log(`[BENCH] ICP_NETWORK_FETCH: ID ${arweaveId} from Canister ${canisterId} - Status ${response.status} - ${(networkEnd - networkStart).toFixed(2)}ms`);

    if (response.ok) {
      const processStart = performance.now();
      const blob = await response.blob();
      const processEnd = performance.now();
      console.log(`[BENCH] ICP_BLOB_PROCESSING: ID ${arweaveId} from Canister ${canisterId} - ${(processEnd - processStart).toFixed(2)}ms`);
      const contentType = response.headers.get("Content-Type") || "application/octet-stream";
      console.log(`[assetManagerThunks] fetchAssetFromUserCanister: Successfully fetched. Blob Type: ${blob.type}, Size: ${blob.size}, Content-Type: ${contentType}`);
      const icpFetchEnd = performance.now();
      console.log(`[BENCH] ICP_FETCH_TOTAL: ID ${arweaveId} from Canister ${canisterId} - Status ${response.status} - Success - ${(icpFetchEnd - icpFetchStart).toFixed(2)}ms`);
      return { blob, contentType };
    } else {
      console.warn(`[assetManagerThunks] fetchAssetFromUserCanister: Failed to fetch. Status: ${response.status} ${response.statusText}`);
      const icpFetchEnd = performance.now();
      console.log(`[BENCH] ICP_FETCH_TOTAL: ID ${arweaveId} from Canister ${canisterId} - Status ${response.status} - Failed - ${(icpFetchEnd - icpFetchStart).toFixed(2)}ms`);
      return null;
    }
  } catch (error) {
    console.error(`[assetManagerThunks] fetchAssetFromUserCanister: Network or other error fetching from URL "${url}":`, error);
    const icpFetchEnd = performance.now();
    console.log(`[BENCH] ICP_FETCH_TOTAL: ID ${arweaveId} from Canister ${canisterId} - Status ${responseStatus === 0 ? 'network_error' : responseStatus} - Error - ${(icpFetchEnd - icpFetchStart).toFixed(2)}ms`);
    return null;
  }
};
