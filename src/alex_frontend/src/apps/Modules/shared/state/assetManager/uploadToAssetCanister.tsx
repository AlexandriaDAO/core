import { getActorUserAssetCanister } from "@/features/auth/utils/authUtils";

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
  interface uploadProps{
    assetCanisterId:string,
    itemUrl:string, 

  }
  // Constants for upload configuration
  const UPLOAD_CONSTANTS = {
    MAX_CHUNKS_PER_BATCH: 5, // Reduced from 10 to 5
    CHUNK_SIZE: 512 * 1024, // Reduced to 512KB per chunk
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    BACKOFF_FACTOR: 1.5,
  };
  


const uploadToAssetCanister=()=>{
    
}

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

export const upload = async ({ assetCanisterId, itemUrl }: uploadProps): Promise<void> => {
    const fileUrl = "https://t7tzg-eqaaa-aaaah-qcy7q-cai.raw.ic0.app/assets/low.mp4";
    let currentBatchId: bigint | null = null;
    const fileName = "TokenId";
    const assetActor = await getActorUserAssetCanister();

    try {
      // Step 1: Fetch the file
      setUploadProgress({ phase: "Fetching file", progress: 0 });
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

      const contentType = response.headers.get("content-type") || "image/jpeg";
      const blob = await response.blob();
      const fileData = new Uint8Array(await blob.arrayBuffer());
      const totalChunks = Math.ceil(fileData.length / UPLOAD_CONSTANTS.CHUNK_SIZE);

      // Step 2: Create the asset first
      setUploadProgress({ phase: "Creating asset", progress: 10 });
      const headers: [string, string][] = [
        ["Content-Type", contentType],
        ["Accept-Ranges", "bytes"],
        ["Cache-Control", "public, max-age=3600"],
      ];

      await retryOperation(async () => {
        await assetActor.create_asset({
          key: fileName,
          content_type: contentType,
          headers: [headers],
          allow_raw_access: [true],
          max_age: [BigInt(3600)],
          enable_aliasing: [true],
        });
      });

      // Step 3: Create batch
      setUploadProgress({ phase: "Creating batch", progress: 15 });
      const createBatchResponse = await retryOperation(async () =>
        await assetActor.create_batch({})
      );
      currentBatchId = createBatchResponse.batch_id;

      // Step 4: Upload chunks
      let allChunkIds: bigint[] = [];
      for (let batchStart = 0; batchStart < totalChunks; batchStart += UPLOAD_CONSTANTS.MAX_CHUNKS_PER_BATCH) {
        const batchEnd = Math.min(batchStart + UPLOAD_CONSTANTS.MAX_CHUNKS_PER_BATCH, totalChunks);
        const currentBatchChunks = Array.from(
          { length: batchEnd - batchStart },
          (_, i) => {
            const start = (batchStart + i) * UPLOAD_CONSTANTS.CHUNK_SIZE;
            const end = Math.min(start + UPLOAD_CONSTANTS.CHUNK_SIZE, fileData.length);
            return fileData.slice(start, end);
          }
        );

        setUploadProgress({
          phase: `Uploading chunks ${batchStart + 1}-${batchEnd} of ${totalChunks}`,
          progress: Math.round((batchStart / totalChunks) * 70) + 20,
        });

        const createChunksResponse = await retryOperation(async () =>
          await assetActor.create_chunks({
            batch_id: currentBatchId!,
            content: currentBatchChunks,
          })
        );

        allChunkIds = [...allChunkIds, ...createChunksResponse.chunk_ids];
        await sleep(500);
      }

      // Step 5: Calculate hash and commit
      setUploadProgress({ phase: "Committing batch", progress: 90 });
      const sha256 = await calculateSHA256(fileData);

      await retryOperation(async () => {
        if (!currentBatchId) throw new Error("Batch ID is null");

        await assetActor.commit_batch({
          batch_id: currentBatchId,
          operations: [
            {
              SetAssetContent: {
                key: fileName,
                sha256: [sha256],
                chunk_ids: allChunkIds,
                content_encoding: "identity",
              },
            },
          ],
        });
      });

      setUploadProgress({ phase: "Complete", progress: 100 });
      toast.success(`Upload of "${fileName}" completed successfully.`);
    } catch (error: any) {
      console.error("Upload failed:", error);

      // Enhanced error message handling
      let errorMessage = "Upload failed: ";
      if (error.message.includes("IC0503")) {
        errorMessage += "Asset creation failed. Please try again.";
      } else if (error.message.includes("asset not found")) {
        errorMessage += "Asset not found. Please ensure the asset is created before uploading.";
      } else {
        errorMessage += error.message;
      }

      toast.error(errorMessage);

      // Cleanup on failure
      if (currentBatchId && assetActor) {
        try {
          await assetActor.delete_batch({ batch_id: currentBatchId });
          await assetActor.delete_asset({ key: fileName });
        } catch (cleanupError) {
          console.error("Cleanup failed:", cleanupError);
        }
      }
    } finally {
      setUploadProgress(null);
    }
  };
export default uploadToAssetCanister;