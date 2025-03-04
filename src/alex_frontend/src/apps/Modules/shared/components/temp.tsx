// import React, { useEffect, useRef, useState } from "react";
// import { toast } from "sonner";
// import { getAssetCanister } from "@/features/auth/utils/authUtils";

// // Type definitions for IC responses
// interface CreateBatchResponse {
//   batch_id: bigint;
// }

// interface CreateChunksResponse {
//   chunk_ids: bigint[];
// }

// type HeaderField = [string, string][];

// interface AssetCanister {
//   create_batch: (args: {}) => Promise<CreateBatchResponse>;
//   create_chunks: (args: {
//     batch_id: bigint;
//     content: Uint8Array[];
//   }) => Promise<CreateChunksResponse>;
//   create_asset: (args: {
//     key: string;
//     content_type: string;
//     headers: [] | [HeaderField[]];
//     allow_raw_access: boolean[];
//     max_age: bigint[];
//     enable_aliasing: boolean[];
//   }) => Promise<void>;
//   commit_batch: (args: {
//     batch_id: bigint;
//     operations: Array<{
//       SetAssetContent: {
//         key: string;
//         sha256: Uint8Array[];
//         chunk_ids: bigint[];
//         content_encoding: string;
//       };
//     }>;
//   }) => Promise<void>;
//   delete_batch: (args: { batch_id: bigint }) => Promise<void>;
//   delete_asset: (args: { key: string }) => Promise<void>;
// }

// interface MediaState {
//   blob: Blob | null;
//   contentType: string | null;
// }

// // Constants for upload configuration
// const UPLOAD_CONSTANTS = {
//   MAX_CHUNKS_PER_BATCH: 5, // Reduced from 10 to 5
//   CHUNK_SIZE: 512 * 1024, // Reduced to 512KB per chunk
//   MAX_RETRIES: 3,
//   RETRY_DELAY: 2000,
//   BACKOFF_FACTOR: 1.5,
// };

// // Add retry logic helper
// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// async function retryOperation<T>(
//   operation: () => Promise<T>,
//   retryCount: number = 0
// ): Promise<T> {
//   try {
//     return await operation();
//   } catch (error: any) {
//     if (retryCount >= UPLOAD_CONSTANTS.MAX_RETRIES) {
//       throw error;
//     }
//     const delay = UPLOAD_CONSTANTS.RETRY_DELAY *
//       Math.pow(UPLOAD_CONSTANTS.BACKOFF_FACTOR, retryCount);
//     console.log(`Retry attempt ${retryCount + 1} after ${delay}ms`);
//     await sleep(delay);
//     return retryOperation(operation, retryCount + 1);
//   }
// }
// function Alexandrian() {
//   const [uploadProgress, setUploadProgress] = useState<{
//     phase: string;
//     progress: number;
//     attempt?: number;
//   } | null>(null);

//   // Helper function to convert hash to hex for debugging
//   const toHexString = (bytes: Uint8Array): string =>
//     Array.from(bytes)
//       .map((b) => b.toString(16).padStart(2, "0"))
//       .join("");

//   // const calculateSHA256 = async (data: Uint8Array): Promise<Uint8Array> => {
//   //   try {
//   //     // Create a copy of the data to ensure we're not working with a view
//   //     const dataCopy = new Uint8Array(data);
//   //     const hashBuffer = await crypto.subtle.digest("SHA-256", dataCopy);
//   //     const hash = new Uint8Array(hashBuffer);
//   //     console.log("Calculated hash:", toHexString(hash));
//   //     return hash;
//   //   } catch (error) {
//   //     console.error("Hash calculation error:", error);
//   //     throw error;
//   //   }
//   // };

//   const verifyChunks = (chunks: Uint8Array[], originalData: Uint8Array): boolean => {
//     let offset = 0;
//     for (const chunk of chunks) {
//       for (let i = 0; i < chunk.length; i++) {
//         if (chunk[i] !== originalData[offset + i]) {
//           console.error(`Chunk mismatch at offset ${offset + i}`);
//           return false;
//         }
//       }
//       offset += chunk.length;
//     }
//     return true;
//   };



//   const calculateSHA256 = async (data: Uint8Array): Promise<Uint8Array> => {
//     const hashBuffer = await crypto.subtle.digest("SHA-256", data);
//     return new Uint8Array(hashBuffer);
//   };

//   const upload = async () => {
//     const fileUrl = "https://t7tzg-eqaaa-aaaah-qcy7q-cai.raw.ic0.app/assets/low.mp4";
//     let currentBatchId: bigint | null = null;
//     const fileName = "h88";
//     const assetActor = await getAssetCanister();

//     try {
//       // Step 1: Fetch the file
//       setUploadProgress({ phase: "Fetching file", progress: 0 });
//       const response = await fetch(fileUrl);
//       if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

//       const contentType = response.headers.get("content-type") || "image/jpeg";
//       const blob = await response.blob();
//       const fileData = new Uint8Array(await blob.arrayBuffer());
//       const totalChunks = Math.ceil(fileData.length / UPLOAD_CONSTANTS.CHUNK_SIZE);

//       // Step 2: Create the asset first
//       setUploadProgress({ phase: "Creating asset", progress: 10 });
//       const headers: [string, string][] = [
//         ["Content-Type", contentType],
//         ["Accept-Ranges", "bytes"],
//         ["Cache-Control", "public, max-age=3600"],
//       ];

//       await retryOperation(async () => {
//         await assetActor.create_asset({
//           key: fileName,
//           content_type: contentType,
//           headers: [headers],
//           allow_raw_access: [true],
//           max_age: [BigInt(3600)],
//           enable_aliasing: [true],
//         });
//       });

//       // Step 3: Create batch
//       setUploadProgress({ phase: "Creating batch", progress: 15 });
//       const createBatchResponse = await retryOperation(async () =>
//         await assetActor.create_batch({})
//       );
//       currentBatchId = createBatchResponse.batch_id;

//       // Step 4: Upload chunks
//       let allChunkIds: bigint[] = [];
//       for (let batchStart = 0; batchStart < totalChunks; batchStart += UPLOAD_CONSTANTS.MAX_CHUNKS_PER_BATCH) {
//         const batchEnd = Math.min(batchStart + UPLOAD_CONSTANTS.MAX_CHUNKS_PER_BATCH, totalChunks);
//         const currentBatchChunks = Array.from(
//           { length: batchEnd - batchStart },
//           (_, i) => {
//             const start = (batchStart + i) * UPLOAD_CONSTANTS.CHUNK_SIZE;
//             const end = Math.min(start + UPLOAD_CONSTANTS.CHUNK_SIZE, fileData.length);
//             return fileData.slice(start, end);
//           }
//         );

//         setUploadProgress({
//           phase: `Uploading chunks ${batchStart + 1}-${batchEnd} of ${totalChunks}`,
//           progress: Math.round((batchStart / totalChunks) * 70) + 20,
//         });

//         const createChunksResponse = await retryOperation(async () =>
//           await assetActor.create_chunks({
//             batch_id: currentBatchId!,
//             content: currentBatchChunks,
//           })
//         );

//         allChunkIds = [...allChunkIds, ...createChunksResponse.chunk_ids];
//         await sleep(500);
//       }

//       // Step 5: Calculate hash and commit
//       setUploadProgress({ phase: "Committing batch", progress: 90 });
//       const sha256 = await calculateSHA256(fileData);

//       await retryOperation(async () => {
//         if (!currentBatchId) throw new Error("Batch ID is null");

//         await assetActor.commit_batch({
//           batch_id: currentBatchId,
//           operations: [
//             {
//               SetAssetContent: {
//                 key: fileName,
//                 sha256: [sha256],
//                 chunk_ids: allChunkIds,
//                 content_encoding: "identity",
//               },
//             },
//           ],
//         });
//       });

//       setUploadProgress({ phase: "Complete", progress: 100 });
//       toast.success(`Upload of "${fileName}" completed successfully.`);
//     } catch (error: any) {
//       console.error("Upload failed:", error);

//       // Enhanced error message handling
//       let errorMessage = "Upload failed: ";
//       if (error.message.includes("IC0503")) {
//         errorMessage += "Asset creation failed. Please try again.";
//       } else if (error.message.includes("asset not found")) {
//         errorMessage += "Asset not found. Please ensure the asset is created before uploading.";
//       } else {
//         errorMessage += error.message;
//       }

//       toast.error(errorMessage);

//       // Cleanup on failure
//       if (currentBatchId && assetActor) {
//         try {
//           await assetActor.delete_batch({ batch_id: currentBatchId });
//           await assetActor.delete_asset({ key: fileName });
//         } catch (cleanupError) {
//           console.error("Cleanup failed:", cleanupError);
//         }
//       }
//     } finally {
//       setUploadProgress(null);
//     }
//   };

//   const [mediaState, setMediaState] = useState<MediaState>({
//     blob: null,
//     contentType: null
//   });
//   const [loading, setLoading] = useState(false);
//   const videoRef = useRef<HTMLVideoElement>(null);

//   // Cleanup URL when component unmounts or blob changes
//   useEffect(() => {
//     return () => {
//       if (mediaState.blob) {
//         URL.revokeObjectURL(URL.createObjectURL(mediaState.blob));
//       }
//     };
//   }, [mediaState.blob]);

//   const fetchMedia = async (key: string) => {
//     try {
//       const actor = await getAssetCanister();
      
//       // Query to get the file by key
//       const fileRecord = await actor.get({
//         key: key,
//         accept_encodings: ['identity'],
//       });

//       if (fileRecord) {
//         const { content, content_type } = fileRecord;
        
//         // Ensure content is properly handled as Uint8Array
//         const contentArray = Array.isArray(content) 
//           ? new Uint8Array(content)
//           : content;
        
//         // Create blob with proper content type and streaming support
//         const blob = new Blob([contentArray], { 
//           type: content_type 
//         });

//         return { blob, contentType: content_type };
//       } else {
//         console.log('File not found');
//         return null;
//       }
//     } catch (error) {
//       console.error('Error fetching file:', error);
//       return null;
//     }
//   };

//   const handleFetchMedia = async () => {
//     setLoading(true);
//     try {
//       const result = await fetchMedia('h88');
//       if (result) {
//         setMediaState({
//           blob: result.blob,
//           contentType: result.contentType
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching media:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVideoLoad = () => {
//     if (videoRef.current) {
//       videoRef.current.load();
//     }
//   };

//   const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
//     console.error('Video error:', e);
//     const video = e.target as HTMLVideoElement;
//     console.error('Video error details:', video.error);
//   };

//   const renderMedia = () => {
//     if (!mediaState.blob || !mediaState.contentType) {
//       return <div>No media to display</div>;
//     }

//     const url = URL.createObjectURL(mediaState.blob);

//     if (mediaState.contentType.startsWith('image/')) {
//       return (
//         <div className="max-w-2xl">
//           <img 
//             src={url} 
//             alt="Fetched image" 
//             className="w-full h-auto rounded-lg shadow-lg"
//           />
//         </div>
//       );
//     } else if (mediaState.contentType.startsWith('video/')) {
//       return (
//         <div className="max-w-2xl">
//           <video 
//             ref={videoRef}
//             controls 
//             autoPlay
//             preload="auto"
//             className="w-full h-auto rounded-lg shadow-lg"
//             onLoadedData={handleVideoLoad}
//             onError={handleVideoError}
//           >
//             <source src={url} type={mediaState.contentType} />
//             Your browser does not support the video tag.
//           </video>
//           <div className="mt-2 text-sm text-gray-600">
//             {mediaState.contentType} - {mediaState.blob.size} bytes
//           </div>
//         </div>
//       );
//     }

//     return <div>Unsupported media type: {mediaState.contentType}</div>;
//   };

//   return (
//     <div className="space-y-4">
//       <button
//         onClick={upload}
//         disabled={!!uploadProgress}
//         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
//       >
//         {uploadProgress ? "Uploading..." : "Upload"}
//       </button>

//       {uploadProgress && (
//         <div className="w-full max-w-md">
//           <div className="text-sm text-gray-600 mb-1">
//             {uploadProgress.phase}
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2.5">
//             <div
//               className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
//               style={{ width: `${uploadProgress.progress}%` }}
//             />
//           </div>
//         </div>
//       )}

//       <div className="space-y-4">
//         <button 
//           onClick={handleFetchMedia} 
//           disabled={loading}
//           className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
//         >
//           {loading ? 'Loading...' : 'Fetch Media'}
//         </button>

//         <div className="mt-4">
//           {loading ? (
//             <div className="text-gray-600">Loading media...</div>
//           ) : (
//             renderMedia()
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default React.memo(Alexandrian);
