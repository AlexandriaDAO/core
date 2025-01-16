import React, { useCallback } from "react";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import Library from "@/apps/Modules/LibModules/nftSearch";
import { useWiper } from "@/apps/Modules/shared/state/wiper";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { performSearch, updateSearchParams } from '@/apps/Modules/shared/state/librarySearch/libraryThunks';
import { resetSearch } from '@/apps/Modules/shared/state/librarySearch/librarySlice';
import { TopupBalanceWarning } from '@/apps/Modules/shared/components/TopupBalanceWarning';
import { getAssetsCanister } from "@/features/auth/utils/authUtils";
import type { Principal } from '@dfinity/principal';
import { arweaveIdToNat } from "@/utils/id_convert";
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
// Constants
const MAX_CHUNK_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_ASSET_SIZE = 20 * 1024 * 1024; // 20MB



interface AssetMetadata {
	content_type: string;
	total_size: number;
	chunk_count: number;
	owner: Principal;
	created_at: bigint;
	updated_at: bigint;
}
function Alexandrian() {
	useWiper();
	const dispatch = useDispatch<AppDispatch>();

	const isLoading = useSelector((state: RootState) => state.library.isLoading);
	const searchParams = useSelector((state: RootState) => state.library.searchParams);

	const handleSearch = useCallback(async () => {
		try {
			await dispatch(resetSearch());
			await dispatch(performSearch());
		} catch (error) {
			console.error('Search failed:', error);
		}
	}, [dispatch]);

	const handleShowMore = useCallback(async () => {
		try {
			const newStart = searchParams.end;
			const newEnd = newStart + searchParams.pageSize;
			await dispatch(updateSearchParams({ start: newStart, end: newEnd }));
		} catch (error) {
			console.error('Show more failed:', error);
		}
	}, [dispatch, searchParams]);

	const upload = async () => {
		try {
			const imageUrl = 'https://kxhfl53dccty27abfsifmcl6hg6yec4oeaqpwrihawzo3x4cscwa.arweave.net/Vc5V92MQp418ASyQVgl-Ob2CC44gIPtFBwWy7d-CkKw';

			const response = await fetch(imageUrl);
			if (!response.ok) {
				throw new Error('Failed to fetch image');
			}

			const imageBlob = await response.blob();
			const arrayBuffer = await imageBlob.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);

			if (uint8Array.length > 20 * 1024 * 1024) { // 20MB
				throw new Error('Asset size exceeds maximum allowed size');
			}

			// Get an actor to interact with the canister
			const actor = await getAssetsCanister();

			// Transaction details (nft_token, owner, and tags)
			const nftToken = "gzaYJl8IIz3UX4t3PXTe8ZWXFaUvutxyofiXYSD9LNk"; // Example NFT token
			const owner = "NVkSolD-1AJcJ0BMfEASJjIuak3Y6CvDJZ4XOIUbU9g"; // Example owner address
			const tags = [
				{ name: "Content-Type", value: imageBlob.type || "image/jpeg" }
			];
			const id: bigint = arweaveIdToNat("gzaYJl8IIz3UX4t3PXTe8ZWXFaUvutxyofiXYSD9LNk");
			// Initialize asset and handle Result type
			const initResult = await actor.initialize_asset(
				id,
				imageBlob.type || 'image/jpeg', // content_type
				BigInt(uint8Array.length), // total_size
				nftToken, // nft_token
				owner, // owner address
				tags // tags
			);

			if ('Err' in initResult) {
				throw new Error(`Failed to initialize asset: ${Object.keys(initResult.Err)[0]}`);
			}

			const assetId = initResult.Ok;

			// Split and upload chunks
			const chunkSize = 2 * 1024 * 1024; // 2MB
			for (let i = 0; i < uint8Array.length; i += chunkSize) {
				const chunk = uint8Array.slice(i, i + chunkSize);
				const chunkIndex = Math.floor(i / chunkSize);

				const storeResult = await actor.store_chunk(
					id, // Asset ID
					BigInt(chunkIndex), // Chunk index
					Array.from(chunk) // Chunk data as an array
				);

				if ('Err' in storeResult) {
					throw new Error(`Failed to upload chunk ${chunkIndex}: ${Object.keys(storeResult.Err)[0]}`);
				}

				console.log(`Uploaded chunk ${chunkIndex + 1}`);
			}

			console.log("Upload completed successfully with ID:", assetId.toString());
			return assetId;
		} catch (error) {
			console.error("Error uploading image:", error);
			throw error;
		}
	};


	const getImage = async (assetId: bigint) => {
		try {
			const actor = await getAssetsCanister();

			// Get metadata and handle Result type
			const metadataResult = await actor.get_asset_metadata(assetId);

			if ('Err' in metadataResult) {
				throw new Error(`Failed to get asset metadata: ${Object.keys(metadataResult.Err)[0]}`);
			}

			const metadata = metadataResult.Ok;
			const chunks: Uint8Array[] = [];

			// Fetch all chunks
			for (let i = 0; i < metadata.chunk_count; i++) {
				const chunkResult = await actor.get_chunk(assetId, BigInt(i));

				if ('Err' in chunkResult) {
					throw new Error(`Failed to get chunk ${i}: ${Object.keys(chunkResult.Err)[0]}`);
				}

				chunks.push(new Uint8Array(chunkResult.Ok));
			}

			// Combine chunks
			const fullImageData = new Uint8Array(Number(metadata.total_size));
			let offset = 0;
			for (const chunk of chunks) {
				fullImageData.set(chunk, offset);
				offset += chunk.length;
			}

			// Display image
			const blob = new Blob([fullImageData], { type: metadata.content_type });
			const imageUrl = URL.createObjectURL(blob);

			const container = document.getElementById('image-container');
			if (container) {
				container.innerHTML = '';

				// Create image element
				const imgElement = document.createElement('img');
				imgElement.src = imageUrl;
				imgElement.alt = "Asset Image";
				imgElement.style.maxWidth = '100%';
				imgElement.style.height = 'auto';

				// Append image to container
				container.appendChild(imgElement);
				imgElement.onload = () => URL.revokeObjectURL(imageUrl);

				// Display additional metadata (e.g., NFT token, owner, tags)
				const metadataInfo = document.createElement('div');
				metadataInfo.innerHTML = `
					<p><strong>Content Type:</strong> ${metadata.content_type}</p>
					<p><strong>Owner:</strong> ${metadata.owner}</p>
					<p><strong>NFT Token:</strong> ${metadata.nft_token}</p>
					<p><strong>Created At:</strong> ${new Date(Number(metadata.created_at) * 1000).toLocaleString()}</p>
				`;

				// Append metadata info to container
				container.appendChild(metadataInfo);
			}
		} catch (error) {
			console.error("Error displaying image:", error);
			throw error;
		}
	};

	return (
		<><div id="image-container"></div>

			<button onClick={() => {
				upload();
			}}>Sync </button>
			<button onClick={() => {
				getImage(arweaveIdToNat("gzaYJl8IIz3UX4t3PXTe8ZWXFaUvutxyofiXYSD9LNk"));
			}}>get </button>
			<SearchContainer
				title="Alexandrian"
				description="Search the NFT Library of others, and manage your own."
				onSearch={handleSearch}
				onShowMore={handleShowMore}
				isLoading={isLoading}
				topComponent={<TopupBalanceWarning />}
				filterComponent={<Library />}
				showMoreEnabled={true}
			/>
		</>
	);
}

export default React.memo(Alexandrian);
