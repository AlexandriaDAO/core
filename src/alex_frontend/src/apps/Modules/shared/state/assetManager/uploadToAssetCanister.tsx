import { getActorUserAssetCanister } from "@/features/auth/utils/authUtils";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'sonner';
import { syncProgressInterface } from "./assetManagerThunks";
import { RootState } from "@/store";

interface CreateBatchResponse {
  batch_id: bigint;
}

interface CreateChunksResponse {
  chunk_ids: bigint[];
}

type HeaderField = [string, string][];

interface AssetCanister {
  create_batch: (args: {}) => Promise<CreateBatchResponse>;
  create_chunks: (args: {
    batch_id: bigint;
    content: Uint8Array[];
  }) => Promise<CreateChunksResponse>;
  create_asset: (args: {
    key: string;
    content_type: string;
    headers: [] | [HeaderField[]];
    allow_raw_access: boolean[];
    max_age: bigint[];
    enable_aliasing: boolean[];
  }) => Promise<void>;
  commit_batch: (args: {
    batch_id: bigint;
    operations: Array<{
      SetAssetContent: {
        key: string;
        sha256: Uint8Array[];
        chunk_ids: bigint[];
        content_encoding: string;
      };
    }>;
  }) => Promise<void>;
  delete_batch: (args: { batch_id: bigint }) => Promise<void>;
  delete_asset: (args: { key: string }) => Promise<void>;
}

interface MediaState {
  blob: Blob | null;
  contentType: string | null;
}
interface uploadProps {
  assetCanisterId: string,
  itemUrl?: string,
  contentData?: string;
  id: string,
  syncProgress: syncProgressInterface,
  setSyncProgress: React.Dispatch<React.SetStateAction<syncProgressInterface>>,
  assetList: Array<{ key: string; content_type: string }>;

  // setUploadProgress: React.Dispatch<React.SetStateAction<{
  //   phase: string;
  //   progress: number;
  //   attempt?: number;
  // } | null>>


}
// Constants for upload configuration
const UPLOAD_CONSTANTS = {
  MAX_CHUNKS_PER_BATCH: 5, // Reduced from 10 to 5
  CHUNK_SIZE: 512 * 1024, // Reduced to 512KB per chunk
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  BACKOFF_FACTOR: 1.5,
};



// Add retry logic helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
async function retryOperation<T>(
  operation: () => Promise<T>,
  retryCount: number = 0
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retryCount >= UPLOAD_CONSTANTS.MAX_RETRIES) {
      throw error;
    }
    const delay = UPLOAD_CONSTANTS.RETRY_DELAY *
      Math.pow(UPLOAD_CONSTANTS.BACKOFF_FACTOR, retryCount);
    console.log(`Retry attempt ${retryCount + 1} after ${delay}ms`);
    await sleep(delay);
    return retryOperation(operation, retryCount + 1);
  }
}
const calculateSHA256 = async (data: Uint8Array): Promise<Uint8Array> => {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuffer);
};

export const uploadAsset = async ({
  assetCanisterId,
  id,
  syncProgress,
  setSyncProgress,
  itemUrl,
  contentData,
  assetList
}: uploadProps): Promise<boolean> => {
  let currentBatchId: bigint | null = null;
  const assetActor = await getActorUserAssetCanister(assetCanisterId);

  try {
    setSyncProgress((prev) => ({ ...prev, currentItem: id, currentProgress: 5 }));

    let fileData: Uint8Array;
    let contentType = "application/json"; // Default to JSON if uploading content data

    if (itemUrl) {
      // NFT Upload Case

      if (assetList.some(asset => asset.key === id)) {
        setSyncProgress((prev) => ({
          ...prev,
          totalSynced: (prev.totalSynced || 0) + 1,
          currentProgress: 100
        }));
        return true; // no need to upload again
      }

      const response = await fetch(itemUrl);
      if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

      contentType = response.headers.get("content-type") || "image/jpeg";
      const blob = await response.blob();
      fileData = new Uint8Array(await blob.arrayBuffer());
    } else if (contentData) {
      // Check if ContentData exists in the asset list
      const assetList = await assetActor.list({});
      const contentDataExists = assetList.some(asset => asset.key === "ContentData");

      // If ContentData exists, delete it first
      if (contentDataExists) {
        await assetActor.delete_asset({ key: "ContentData" });
        console.log("Existing ContentData deleted successfully");
      }

      // Transaction JSON Upload Case
      fileData = new TextEncoder().encode(contentData);
    } else {
      throw new Error("Either `itemUrl` or `contentData` must be provided.");
    }

    const totalChunks = Math.ceil(fileData.length / UPLOAD_CONSTANTS.CHUNK_SIZE);

    setSyncProgress((prev) => ({ ...prev, currentProgress: 10 }));

    // Step 2: Create the asset
    const headers: [string, string][] = [
      ["Content-Type", contentType],
      ["Accept-Ranges", "bytes"],
      ["Cache-Control", "public, max-age=3600"],
    ];

    await retryOperation(async () => {
      await assetActor.create_asset({
        key: id,
        content_type: contentType,
        headers: [headers],
        allow_raw_access: [true],
        max_age: [BigInt(3600)],
        enable_aliasing: [true],
      });
    });

    setSyncProgress((prev) => ({ ...prev, currentProgress: 15 }));

    // Step 3: Create batch
    const createBatchResponse = await retryOperation(async () =>
      assetActor.create_batch({})
    );
    currentBatchId = createBatchResponse.batch_id;

    // Step 4: Upload chunks
    let allChunkIds: bigint[] = [];
    for (let batchStart = 0; batchStart < totalChunks; batchStart += UPLOAD_CONSTANTS.MAX_CHUNKS_PER_BATCH) {
      const batchEnd = Math.min(batchStart + UPLOAD_CONSTANTS.MAX_CHUNKS_PER_BATCH, totalChunks);
      const currentBatchChunks = Array.from({ length: batchEnd - batchStart }, (_, i) => {
        const start = (batchStart + i) * UPLOAD_CONSTANTS.CHUNK_SIZE;
        const end = Math.min(start + UPLOAD_CONSTANTS.CHUNK_SIZE, fileData.length);
        return fileData.slice(start, end);
      });

      setSyncProgress((prev) => ({
        ...prev,
        currentProgress: Math.round((batchStart / totalChunks) * 70) + 20
      }));

      const createChunksResponse = await retryOperation(async () =>
        assetActor.create_chunks({
          batch_id: currentBatchId!,
          content: currentBatchChunks,
        })
      );

      allChunkIds = [...allChunkIds, ...createChunksResponse.chunk_ids];
      await sleep(500);
    }

    // Step 5: Calculate hash and commit
    setSyncProgress((prev) => ({ ...prev, currentProgress: 90 }));

    const sha256 = await calculateSHA256(fileData);

    await retryOperation(async () => {
      if (!currentBatchId) throw new Error("Batch ID is null");

      await assetActor.commit_batch({
        batch_id: currentBatchId,
        operations: [
          {
            SetAssetContent: {
              key: id,
              sha256: [sha256],
              chunk_ids: allChunkIds,
              content_encoding: "gzip",
            },
          },
        ],
      });
    });

    setSyncProgress((prev) => ({
      ...prev,
      totalSynced: (prev.totalSynced || 0) + 1,
      currentProgress: 100
    }));
    console.log(`Upload of "${id}" completed successfully.`);

    // toast.success(`Upload of "${id}" completed successfully.`);
    return true;

  } catch (error: any) {
    console.error("Upload failed:", error);
    // toast.error("Upload failed: " + (error.message || "Unknown error"));

    // Cleanup on failure
    if (currentBatchId && assetActor) {
      try {
        await assetActor.delete_batch({ batch_id: currentBatchId });
        await assetActor.delete_asset({ key: id });
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
      }
    }

    return false;
  }
};
