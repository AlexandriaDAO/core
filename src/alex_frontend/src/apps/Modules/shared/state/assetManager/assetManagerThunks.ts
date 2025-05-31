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
import ContentTagsSelector from "@/apps/Modules/AppModules/search/selectors/ContentTagsSelector";

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
      // Create NFT token adapter
      const nftAdapter = createTokenAdapter("NFT");

      // Fetch user's NFTs using the adapter
      const result = await nftAdapter.getTokensOf(
        Principal.fromText(userPrincipal),
        undefined,
        BigInt(10000)
      );

      

      // Convert token IDs to arweave IDs using the adapter
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

      // Step 1: Upload fetchedTransactions JSON first
      const transactionUploadResult = await uploadAsset({
        assetCanisterId: assetCanisterId || "",
        id: "ContentData",
        setSyncProgress,
        syncProgress,
        contentData: fetchedTransactions, // Only sending JSON data first
        assetList: assetManager.assetList,
      });

      if (!transactionUploadResult) {
        throw new Error("Failed to upload transaction data.");
      }


      // Step 2: Upload NFTs one by one
      tokens.reduce(async (prevPromise, token) => {
        await prevPromise; //  before starting the next one
        const result = await uploadAsset({
          assetCanisterId: assetCanisterId || "",
          itemUrl: "https://arweave.net/" + token,
          id: token,
          setSyncProgress,
          syncProgress,
          assetList: assetManager.assetList,
        });
      }, Promise.resolve()); // Initial value to start the chain

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

    if (!result || typeof result.keys !== "function") {
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

export const fetchAssetFromUserCanister = async (key: string, actor: any): Promise<{ blob: Blob; contentType: string } | null> => {
  console.log(`[assetManagerThunks] fetchAssetFromUserCanister: Attempting to fetch key: "${key}" with encodings ["gzip", "identity"]`);
  try {
    const initialResponse = await actor.get({
      key: key,
      accept_encodings: ["gzip", "identity"], 
    });

    if (!initialResponse || !initialResponse.content) {
      console.warn(`[assetManagerThunks] fetchAssetFromUserCanister: Initial fetch for key "${key}" did not return content or was null. Response:`, initialResponse);
      return null; 
    }

    const { content, content_type, content_encoding, total_length, sha256 } = initialResponse;
    console.log(`[assetManagerThunks] fetchAssetFromUserCanister: Initial chunk for key "${key}". Content-Type: ${content_type}, Content-Encoding: ${content_encoding}, Total-Length: ${total_length}, SHA256: ${sha256 ? 'present' : 'absent'}`);

    const totalLengthNum = Number(total_length);
    
    let firstChunkArrayBuffer: ArrayBuffer;
    if (Array.isArray(content)) { // Assuming content is number[]
        firstChunkArrayBuffer = new Uint8Array(content).buffer;
    } else if (content instanceof Uint8Array) {
        // Ensure we get a new ArrayBuffer copy if it might be a view on a SharedArrayBuffer
        firstChunkArrayBuffer = content.slice().buffer;
    } else if (content instanceof ArrayBuffer) {
        firstChunkArrayBuffer = content;
    } else {
        console.warn(`[assetManagerThunks] fetchAssetFromUserCanister: Unhandled type for initial content for key "${key}".`);
        firstChunkArrayBuffer = new ArrayBuffer(0);
    }
    const firstChunk = new Uint8Array(firstChunkArrayBuffer);

    if (firstChunk.length === 0 && totalLengthNum > 0) {
        console.warn(`[assetManagerThunks] fetchAssetFromUserCanister: Initial chunk for key "${key}" is empty but total_length is ${totalLengthNum}.`);
    }
    console.log(`[assetManagerThunks] fetchAssetFromUserCanister: First chunk size for key "${key}": ${firstChunk.length} bytes. Total expected: ${totalLengthNum} bytes.`);

    if (firstChunk.length >= totalLengthNum) {
      console.log(`[assetManagerThunks] fetchAssetFromUserCanister: Key "${key}" fetched in a single chunk.`);
      const blob = new Blob([firstChunk], { type: content_type });
      console.log(`[assetManagerThunks] fetchAssetFromUserCanister: Created blob for key: "${key}". Blob Type: ${blob.type}, Blob Size: ${blob.size}`);
      return { blob, contentType: content_type };
    }

    if (!sha256) {
      console.warn(`[assetManagerThunks] fetchAssetFromUserCanister: SHA256 hash is missing for key "${key}". Assuming content was fully fetched or chunking not supported.`);
       const blob = new Blob([firstChunk], { type: content_type });
       console.log(`[assetManagerThunks] fetchAssetFromUserCanister: Created blob for key: "${key}" (possibly incomplete). Blob Type: ${blob.type}, Blob Size: ${blob.size}`);
       return { blob, contentType: content_type };
    }
    
    console.log(`[assetManagerThunks] fetchAssetFromUserCanister: Key "${key}" requires chunked fetching.`);
    const chunkSize = firstChunk.length; 
    const remainingLength = totalLengthNum - chunkSize;
    const numberOfAdditionalChunks = chunkSize > 0 ? Math.ceil(remainingLength / chunkSize) : 0;

    const chunks: Uint8Array[] = [firstChunk];
    console.log(`[assetManagerThunks] fetchAssetFromUserCanister: Fetching ${numberOfAdditionalChunks} additional chunks for key "${key}".`);

    if (chunkSize === 0 && totalLengthNum > 0) {
        console.error(`[assetManagerThunks] fetchAssetFromUserCanister: Initial chunk size is 0 for key "${key}", cannot proceed with chunking. Total length expected: ${totalLengthNum}.`);
        const blob = new Blob([firstChunk], { type: content_type });
        return { blob, contentType: content_type };
    }

    for (let i = 0; i < numberOfAdditionalChunks; i++) {
      const chunkIndexToRequest = BigInt(i + 1); 
      console.log(`[assetManagerThunks] fetchAssetFromUserCanister: Requesting chunk index ${chunkIndexToRequest} for key "${key}".`);

      const chunkResponse = await actor.get_chunk({
        key: key,
        content_encoding: content_encoding, 
        index: chunkIndexToRequest, 
        sha256: sha256, 
      });

      if (!chunkResponse || !chunkResponse.content) {
        const errorMsg = `[assetManagerThunks] fetchAssetFromUserCanister: Failed to fetch chunk ${chunkIndexToRequest} for key "${key}". Response: ${JSON.stringify(chunkResponse)}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      let currentChunkArrayBuffer: ArrayBuffer;
      if (Array.isArray(chunkResponse.content)) { // Assuming content is number[]
          currentChunkArrayBuffer = new Uint8Array(chunkResponse.content).buffer;
      } else if (chunkResponse.content instanceof Uint8Array) {
          // Ensure we get a new ArrayBuffer copy
          currentChunkArrayBuffer = chunkResponse.content.slice().buffer;
      } else if (chunkResponse.content instanceof ArrayBuffer) {
          currentChunkArrayBuffer = chunkResponse.content;
      } else {
          console.warn(`[assetManagerThunks] fetchAssetFromUserCanister: Unhandled type for chunk content for key "${key}".`);
          currentChunkArrayBuffer = new ArrayBuffer(0);
      }
      const currentChunk = new Uint8Array(currentChunkArrayBuffer);
      console.log(`[assetManagerThunks] fetchAssetFromUserCanister: Received chunk index ${chunkIndexToRequest} for key "${key}". Size: ${currentChunk.length}`);
      chunks.push(currentChunk);
    }

    const combinedArray = new Uint8Array(totalLengthNum);
    let offset = 0;
    for (const chunk of chunks) {
      combinedArray.set(chunk, offset);
      offset += chunk.length;
    }

    console.log(`[assetManagerThunks] fetchAssetFromUserCanister: All chunks combined for key "${key}". Total combined size: ${combinedArray.length}. Expected: ${totalLengthNum}`);
    if (combinedArray.length !== totalLengthNum) {
      const sizeMismatchError = `[assetManagerThunks] fetchAssetFromUserCanister: Size mismatch for key "${key}": expected ${totalLengthNum} bytes but got ${combinedArray.length} bytes`;
      console.error(sizeMismatchError);
    }

    const blob = new Blob([combinedArray], { type: content_type });
    console.log(`[assetManagerThunks] fetchAssetFromUserCanister: Created final blob for key: "${key}". Blob Type: ${blob.type}, Blob Size: ${blob.size}`);
    return { blob, contentType: content_type };

  } catch (error) {
    console.error(`[assetManagerThunks] fetchAssetFromUserCanister: Error fetching or processing chunks for key "${key}":`, error);
    return null; 
  }
};
