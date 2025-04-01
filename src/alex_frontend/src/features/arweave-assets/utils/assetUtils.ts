import { AssetManager } from "@dfinity/assets";
import { ArweaveAssetItem } from "../types";

/**
 * Fetches a file from Arweave or provided URL
 * @param asset The asset to fetch
 * @returns Promise resolving to a File object
 */
export async function fetchFile(asset: ArweaveAssetItem): Promise<File> {
	// Use asset URL or construct one from the asset ID
	const assetUrl = asset.url || `https://arweave.net/${asset.id}`;

	// Fetch the file
	const response = await fetch(assetUrl);

    // If the response is not ok, throw an error
	if (!response.ok) throw new Error(`Failed to fetch asset: ${response.statusText}`);

	// Get the blob data
	const blob = await response.blob();

	// Determine content type - use asset's contentType, response header, or default
	const contentType = asset.contentType || response.headers.get("Content-Type") || "application/octet-stream";

	// Create and return a File object
	return new File([blob], `${asset.id}`, { type: contentType });
}

/**
 * Uploads a file to the user's canister
 * @param assetManager The asset manager instance
 * @param path The path to upload the file to
 * @param file The file to upload
 * @param fileName The name of the file
 * @returns Promise resolving when upload is complete
 */
export async function uploadToCanister(assetManager: AssetManager, path: string = "/uploads", file: File, fileName: string): Promise<void> {
	// Create a batch
	const batch = assetManager.batch();

	// Store the file with a path that includes arweave/ prefix
	await batch.store(file, { path, fileName });

	// Commit the batch
	await batch.commit();
}
