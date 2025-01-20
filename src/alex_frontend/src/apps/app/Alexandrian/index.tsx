import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { getAssetCanister } from "@/features/auth/utils/authUtils";

// Constants for upload configuration
const UPLOAD_CONSTANTS = {
  MAX_CHUNKS_PER_BATCH: 10,
  CHUNK_SIZE: 1024 * 1024, // 1MB
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000, // 2 seconds
};

// Custom error type for upload failures
class UploadError extends Error {
  constructor(message: string, public phase: string, public retryable: boolean) {
    super(message);
    this.name = "UploadError";
  }
}

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry wrapper for IC calls
const retryICCall = async (fn: any, retries = UPLOAD_CONSTANTS.MAX_RETRIES, delayMs = UPLOAD_CONSTANTS.RETRY_DELAY) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) throw error;
      console.error(`Attempt ${attempt} failed. Retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }
};

function Alexandrian() {
  const [uploadProgress, setUploadProgress] = useState<{
    phase: string;
    progress: number;
  } | null>(null);

  const upload = async () => {
    const fileUrl = "https://t7tzg-eqaaa-aaaah-qcy7q-cai.raw.ic0.app/assets/low.mp4";
    let currentBatchId: bigint | null = null;
    let assetActor: any = null; // Type should be replaced with your actual AssetCanister type
    const fileName = "t7";

    try {
      // Step 1: Initialize the asset canister
      assetActor = await getAssetCanister();

      // Step 2: Fetch the file
      setUploadProgress({ phase: "Fetching file", progress: 0 });
      const response = await retryICCall(async () => {
        const resp = await fetch(fileUrl);
        if (!resp.ok) throw new Error(`Failed to fetch file: ${resp.statusText}`);
        return resp;
      });

      const contentType = response.headers.get("content-type") || "video/mp4";
      const fileBlob = await response.blob();
      const fileData = new Uint8Array(await fileBlob.arrayBuffer());

      // Step 3: Calculate SHA-256 hash
      setUploadProgress({ phase: "Calculating hash", progress: 10 });
      const hashBuffer = await crypto.subtle.digest("SHA-256", fileData);
      const sha256 = new Uint8Array(hashBuffer);

      // Step 4: Create a batch
      setUploadProgress({ phase: "Creating batch", progress: 15 });
      const createBatchResponse = await retryICCall(() => assetActor.create_batch({}));
      currentBatchId = createBatchResponse.batch_id;

      // Step 5: Upload chunks
      const totalChunks = Math.ceil(fileData.length / UPLOAD_CONSTANTS.CHUNK_SIZE);
      let allChunkIds: bigint[] = [];

      for (
        let batchStart = 0;
        batchStart < totalChunks;
        batchStart += UPLOAD_CONSTANTS.MAX_CHUNKS_PER_BATCH
      ) {
        const batchEnd = Math.min(batchStart + UPLOAD_CONSTANTS.MAX_CHUNKS_PER_BATCH, totalChunks);
        const currentBatchChunks = Array.from({ length: batchEnd - batchStart }, (_, i) => {
          const start = (batchStart + i) * UPLOAD_CONSTANTS.CHUNK_SIZE;
          const end = Math.min(start + UPLOAD_CONSTANTS.CHUNK_SIZE, fileData.length);
          return fileData.slice(start, end);
        });

        setUploadProgress({
          phase: `Uploading chunks ${batchStart + 1}-${batchEnd} of ${totalChunks}`,
          progress: Math.round((batchStart / totalChunks) * 70) + 20,
        });

        const createChunksResponse = await retryICCall(() =>
          assetActor.create_chunks({
            batch_id: currentBatchId!,
            content: currentBatchChunks,
          })
        );
        allChunkIds = [...allChunkIds, ...createChunksResponse.chunk_ids];
      }

      // Step 6: Create the asset
      setUploadProgress({ phase: "Creating asset", progress: 90 });
      await retryICCall(() =>
        assetActor.create_asset({
          key: fileName,
          content_type: contentType,
          headers: [],
          allow_raw_access: [true],
          max_age: [BigInt(3600)],
          enable_aliasing: [true],
        })
      );

      // Step 7: Commit the batch
      setUploadProgress({ phase: "Committing batch", progress: 95 });
      await retryICCall(() =>
        assetActor.commit_batch({
          batch_id: currentBatchId!,
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
        })
      );

      setUploadProgress({ phase: "Complete", progress: 100 });
      toast.success(`Upload of "${fileName}" completed successfully.`);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(`Upload failed: `);

      // Cleanup on failure
      if (currentBatchId && assetActor) {
        await retryICCall(() => assetActor.delete_batch({ batch_id: currentBatchId! }));
        await retryICCall(() => assetActor.delete_asset({ key: fileName }));
      }
    } finally {
      setUploadProgress(null);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={upload}
        disabled={!!uploadProgress}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {uploadProgress ? "Uploading..." : "Upload"}
      </button>

      {uploadProgress && (
        <div className="w-full max-w-md">
          <div className="text-sm text-gray-600 mb-1">{uploadProgress.phase}</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
        </div>
      )}
	  		{/* <SearchContainer
			title="Alexandrian"
			description="Search the NFT Library of others, and manage your own."
			hint="Liking costs 20 LBRY (this will decrease over time)."
			onSearch={handleSearch}
			onShowMore={handleShowMore}
			isLoading={isLoading}
			topComponent={<TopupBalanceWarning />}
			filterComponent={<Library />}
			showMoreEnabled={true}
		/> */}
    </div>
  );
}

export default React.memo(Alexandrian);
