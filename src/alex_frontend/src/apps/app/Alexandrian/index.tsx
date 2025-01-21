import React, { useState } from "react";
import { toast } from "sonner";
import { getAssetCanister } from "@/features/auth/utils/authUtils";

// Type definitions for IC responses
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

// Constants for upload configuration
const UPLOAD_CONSTANTS = {
  MAX_CHUNKS_PER_BATCH: 10,
  CHUNK_SIZE: 1024 * 1024, // 1MB per chunk
  MAX_RETRIES: 5,
  RETRY_DELAY: 2000,
  BACKOFF_FACTOR: 1.5,
};

function Alexandrian() {
  const [uploadProgress, setUploadProgress] = useState<{
    phase: string;
    progress: number;
    attempt?: number;
  } | null>(null);

  // Helper function to convert hash to hex for debugging
  const toHexString = (bytes: Uint8Array): string =>
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  const calculateSHA256 = async (data: Uint8Array): Promise<Uint8Array> => {
    try {
      // Create a copy of the data to ensure we're not working with a view
      const dataCopy = new Uint8Array(data);
      const hashBuffer = await crypto.subtle.digest("SHA-256", dataCopy);
      const hash = new Uint8Array(hashBuffer);
      console.log("Calculated hash:", toHexString(hash));
      return hash;
    } catch (error) {
      console.error("Hash calculation error:", error);
      throw error;
    }
  };

  const verifyChunks = (chunks: Uint8Array[], originalData: Uint8Array): boolean => {
    let offset = 0;
    for (const chunk of chunks) {
      for (let i = 0; i < chunk.length; i++) {
        if (chunk[i] !== originalData[offset + i]) {
          console.error(`Chunk mismatch at offset ${offset + i}`);
          return false;
        }
      }
      offset += chunk.length;
    }
    return true;
  };

  const upload = async () => {
    const fileUrl = "https://arweave.net/PUqyXBVNQencjfvy29vGBBq-PFoa-5h7mqh1t3bxQGA";
    let currentBatchId: bigint | null = null;
    const fileName = "h88";   // will replace with arweave id to make it unique 
    const assetActor = await getAssetCanister();

    try {
      setUploadProgress({ phase: "Fetching file", progress: 0 });
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "video/mp4";
      const contentLength = response.headers.get("content-length");
      console.log("Content-Type:", contentType);
      console.log("Content-Length:", contentLength);

      const fileBlob = await response.blob();
      const fileData = new Uint8Array(await fileBlob.arrayBuffer());
      console.log("File size:", fileData.length, "bytes");

      setUploadProgress({ phase: "Calculating hash", progress: 10 });
      const sha256 = await calculateSHA256(fileData);

      setUploadProgress({ phase: "Creating batch", progress: 15 });
      const createBatchResponse = await assetActor.create_batch({});
      currentBatchId = createBatchResponse.batch_id;

      const totalChunks = Math.ceil(fileData.length / UPLOAD_CONSTANTS.CHUNK_SIZE);
      console.log("Total chunks:", totalChunks);
      let allChunkIds: bigint[] = [];
      let allChunks: Uint8Array[] = [];

      // Chunking file and uploading
      for (let batchStart = 0; batchStart < totalChunks; batchStart += UPLOAD_CONSTANTS.MAX_CHUNKS_PER_BATCH) {
        const batchEnd = Math.min(batchStart + UPLOAD_CONSTANTS.MAX_CHUNKS_PER_BATCH, totalChunks);
        const currentBatchChunks = Array.from(
          { length: batchEnd - batchStart },
          (_, i) => {
            const start = (batchStart + i) * UPLOAD_CONSTANTS.CHUNK_SIZE;
            const end = Math.min(start + UPLOAD_CONSTANTS.CHUNK_SIZE, fileData.length);
            const chunk = fileData.slice(start, end);
            console.log(`Chunk ${batchStart + i} size:`, chunk.length);
            return chunk;
          }
        );

        allChunks.push(...currentBatchChunks);

        setUploadProgress({
          phase: `Uploading chunks ${batchStart + 1}-${batchEnd} of ${totalChunks}`,
          progress: Math.round((batchStart / totalChunks) * 70) + 20,
        });

        const createChunksResponse = await assetActor.create_chunks({
          batch_id: currentBatchId,
          content: currentBatchChunks,
        });

        allChunkIds = [...allChunkIds, ...createChunksResponse.chunk_ids];
      }

      // Verify chunks
      console.log("Verifying chunks...");
      const chunksValid = verifyChunks(allChunks, fileData);
      if (!chunksValid) {
        throw new Error("Chunk verification failed");
      }
      console.log("Chunks verified successfully");

      // Creating asset and committing batch
      setUploadProgress({ phase: "Creating asset", progress: 90 });
      const headers: HeaderField = [
        ["Content-Type", contentType],
        ["Accept-Ranges", "bytes"],
        ...(contentLength ? [["Content-Length", contentLength] as [string, string]] : []),
        ["Cache-Control", "public, max-age=3600"],
        ["X-Content-Type-Options", "nosniff"],
      ];

      await assetActor.create_asset({
        key: fileName,
        content_type: contentType,
        headers: [headers], // Wrap in a tuple to resolve header type issue
        allow_raw_access: [true],
        max_age: [BigInt(3600)],
        enable_aliasing: [true],
      });

      setUploadProgress({ phase: "Committing batch", progress: 95 });
      await assetActor.commit_batch({
        batch_id: currentBatchId,
        operations: [
          {
            SetAssetContent: {
              key: fileName,
              sha256: [sha256], // SHA256 is wrapped in an array
              chunk_ids: allChunkIds,
              content_encoding: "identity",
            },
          },
        ],
      });

      setUploadProgress({ phase: "Complete", progress: 100 });
      toast.success(`Upload of "${fileName}" completed successfully.`);
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(`Upload failed: ${error.message}`);
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
  async function fetchImage(key: string) {
    try {
      const actor = await getAssetCanister();

      // Query to get the file by key
      const fileRecord = await actor.get( {key: key,
        accept_encodings: ['identity'], }); // Assuming `get` method is used

        if (fileRecord) {
          const { content, content_type } = fileRecord;
          
          // Convert the content (a Uint8Array or array of numbers) to a Blob
          const blob = new Blob([new Uint8Array(content)], { type: content_type });
    
          return blob;
        } else {
          console.log('File not found');
        }
      } catch (error) {
        console.error('Error fetching file:', error);
      }
  }


  const [imageBlob, setImageBlob] = useState<Blob | null>(null); // Correctly typed state
  const [loading, setLoading] = useState(false);

  const handleFetchImage = async () => {
    setLoading(true);
    const blob = await fetchImage('h88'); // Querying the file using the key 'h88'
    if (blob) {
      setImageBlob(blob);
    }
    setLoading(false);
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
          <div className="text-sm text-gray-600 mb-1">
            {uploadProgress.phase}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
        </div>
      )}
      <button onClick={handleFetchImage} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Image'}
      </button>
      {imageBlob ? (
        <img src={URL.createObjectURL(imageBlob)} alt="Fetched File" />
      ) : (
        'Loading image...'
      )}
    </div>
  );
}

export default React.memo(Alexandrian);
