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

	// testing 
	// const uploadImage = async () => {
	// 	try {
	// 	  // Fetch the image from the URL
	// 	  const response = await fetch('https://kxhfl53dccty27abfsifmcl6hg6yec4oeaqpwrihawzo3x4cscwa.arweave.net/Vc5V92MQp418ASyQVgl-Ob2CC44gIPtFBwWy7d-CkKw');
	// 	  if (!response.ok) {
	// 		throw new Error('Failed to fetch image');
	// 	  }

	// 	  // Get the blob from the response
	// 	  const imageBlob = await response.blob();

	// 	  // Get the content type
	// 	  const contentType = imageBlob.type || 'image/jpeg'; // fallback to jpeg if type is not available

	// 	  // Convert blob to array buffer
	// 	  const arrayBuffer = await imageBlob.arrayBuffer();
	// 	  const uint8Array = new Uint8Array(arrayBuffer);

	// 	  // Get the actor
	// 	  const actor = await getAssetsCanister();

	// 	  // Store the asset
	// 	  const assetId = await actor.store_asset(contentType, [...uint8Array]);
	// 	  console.log("Asset uploaded successfully with ID:", assetId);
	// 	  return assetId;
	// 	} catch (error) {
	// 	  console.error("Error uploading image:", error);
	// 	  throw error;
	// 	}
	//   };

	// Fetch the image from the URL

	const upload = async () => {
		try {
			const imageUrl = 'https://kxhfl53dccty27abfsifmcl6hg6yec4oeaqpwrihawzo3x4cscwa.arweave.net/Vc5V92MQp418ASyQVgl-Ob2CC44gIPtFBwWy7d-CkKw'; // Replace with your image URL

			// Fetch the image from the URL
			const response = await fetch(imageUrl);
			if (!response.ok) {
				throw new Error('Failed to fetch image');
			}

			// Get the blob from the response
			const imageBlob = await response.blob();

			// Convert the blob into an array buffer
			const arrayBuffer = await imageBlob.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);

			// Split the image into chunks (e.g., 1MB each)
			const chunkSize = 1024 * 1024; // 1MB
			const chunks = [];
			for (let i = 0; i < uint8Array.length; i += chunkSize) {
				const chunk = uint8Array.slice(i, i + chunkSize);
				chunks.push(chunk);
			}

			// Get the actor for storing the asset
			const actor = await getAssetsCanister();

			// Store the first chunk and get the asset ID (pass empty array for first chunk)
			let assetId = await actor.store_asset_chunk(chunks[0], []);  // Pass `[]` for the first chunk

			console.log("First chunk uploaded with ID:", assetId);

			// Check if the assetId is a valid BigInt
			if (typeof assetId === 'bigint') {
				console.log("Asset ID is a valid BigInt:", assetId);
			} else {
				console.error("Invalid assetId type:", assetId);
				throw new Error("Invalid assetId returned from the canister");
			}

			// Store subsequent chunks with the same asset ID (pass the correct asset ID as an array)
			for (let i = 1; i < chunks.length; i++) {
				await actor.store_asset_chunk(chunks[i], [BigInt(assetId)]);  // Pass the correct asset ID as an array with BigInt
				console.log("Chunk uploaded with ID:", assetId);
			}

			console.log("All chunks uploaded successfully.");
		} catch (error) {
			console.error("Error uploading image in chunks:", error);
			throw error;
		}
	};







	// const upload = async () => {
	// 	const actor = await getAssetsCanister();

	// 	try {
	// 		// Fetch the image from the URL
	// 		const response = await fetch('https://kxhfl53dccty27abfsifmcl6hg6yec4oeaqpwrihawzo3x4cscwa.arweave.net/Vc5V92MQp418ASyQVgl-Ob2CC44gIPtFBwWy7d-CkKw');
	// 		const imageBlob = await response.blob();

	// 		// Convert blob to Uint8Array
	// 		const arrayBuffer = await imageBlob.arrayBuffer();
	// 		const uint8Array = new Uint8Array(arrayBuffer);

	// 		// For small images, direct upload
	// 		if (uint8Array.length < 2_000_000) { // Less than 2MB
	// 			const result = await actor.store_asset({
	// 				content_type: imageBlob.type,
	// 				content: [...uint8Array]
	// 			});
	// 			console.log("Asset stored with ID:", result);
	// 			return result;
	// 		}

	// 		// For larger images, use chunked upload
	// 		const CHUNK_SIZE = 1_900_000; // Slightly less than 2MB to be safe
	// 		const totalChunks = Math.ceil(uint8Array.length / CHUNK_SIZE);

	// 		// Initialize chunked upload
	// 		await actor.init_chunked_upload({
	// 			content_type: imageBlob.type,
	// 			total_chunks: totalChunks
	// 		});

	// 		// Upload chunks
	// 		for (let i = 0; i < totalChunks; i++) {
	// 			const start = i * CHUNK_SIZE;
	// 			const end = Math.min(start + CHUNK_SIZE, uint8Array.length);
	// 			const chunk = uint8Array.slice(start, end);

	// 			await actor.upload_chunk({
	// 				chunk_index: i,
	// 				content: [...chunk]
	// 			});
	// 			console.log(`Uploaded chunk ${i + 1}/${totalChunks}`);
	// 		}

	// 		// Finalize upload
	// 		const assetId = await actor.finalize_upload();
	// 		console.log("Asset stored with ID:", assetId);
	// 		return assetId;

	// 	} catch (error) {
	// 		console.error("Error uploading image:", error);
	// 		throw error;
	// 	}
	// };
	const getImage = async (assetId: any) => {
		try {
			// Get the actor for interacting with the canister
			const actor = await getAssetsCanister();

			// Retrieve the asset object, which includes the chunks
			const asset = await actor.get_asset(assetId);

			// Early return if no asset found or the chunks array is empty
			if (!asset || !asset[0]?.chunks || asset[0].chunks.length === 0) {
				console.log("No asset found");
				return null;
			}

			// Concatenate all the chunks to reconstruct the full image data
			const fullImageData = new Uint8Array(asset[0]?.chunks.reduce((acc, chunk) => {
				// Ensure `acc` is always a Uint8Array
				const newArray = new Uint8Array(acc.length + chunk.length);
				newArray.set(acc);
				newArray.set(chunk, acc.length);
				return newArray;
			}, new Uint8Array(0)));

			// Check if image data exists
			if (!fullImageData || fullImageData.length === 0) {
				console.log("Asset has no data");
				return null;
			}

			// Create a blob from the full image data
			const blob = new Blob([fullImageData], { type: asset[0]?.content_type });

			// Create an object URL for the blob
			const imageUrl = URL.createObjectURL(blob);
			console.log("Image URL is", imageUrl);

			// Create an image element and set the source to the blob URL
			const imgElement = document.createElement('img');
			imgElement.src = imageUrl;

			// Optionally set the alt text
			imgElement.alt = "Asset Image";

			// Optionally, you can style the image (for example, set a max width or height)
			imgElement.style.maxWidth = '100%'; // This ensures the image scales to fit the container
			imgElement.style.height = 'auto';

			// Append the image to a container (e.g., body or a div with id 'image-container')
			document?.getElementById('image-container')?.appendChild(imgElement);

		} catch (error) {
			console.error("Error retrieving image:", error);
			throw error;
		}
	};



	return (
		<><div id="image-container"></div>

			<button onClick={() => {
				upload();
			}}>Sync </button>
			<button onClick={() => {
				getImage(10);
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
