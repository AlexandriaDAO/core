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
	const upload = async () => {
		const actor = await getAssetsCanister();

		try {
			// Fetch the image from the URL
			const response = await fetch('https://kxhfl53dccty27abfsifmcl6hg6yec4oeaqpwrihawzo3x4cscwa.arweave.net/Vc5V92MQp418ASyQVgl-Ob2CC44gIPtFBwWy7d-CkKw');
			const imageBlob = await response.blob();

			// Convert blob to Uint8Array
			const arrayBuffer = await imageBlob.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);

			// For small images, direct upload
			if (uint8Array.length < 2_000_000) { // Less than 2MB
				const result = await actor.store_asset({
					content_type: imageBlob.type,
					content: [...uint8Array]
				});
				console.log("Asset stored with ID:", result);
				return result;
			}

			// For larger images, use chunked upload
			const CHUNK_SIZE = 1_900_000; // Slightly less than 2MB to be safe
			const totalChunks = Math.ceil(uint8Array.length / CHUNK_SIZE);

			// Initialize chunked upload
			await actor.init_chunked_upload({
				content_type: imageBlob.type,
				total_chunks: totalChunks
			});

			// Upload chunks
			for (let i = 0; i < totalChunks; i++) {
				const start = i * CHUNK_SIZE;
				const end = Math.min(start + CHUNK_SIZE, uint8Array.length);
				const chunk = uint8Array.slice(start, end);

				await actor.upload_chunk({
					chunk_index: i,
					content: [...chunk]
				});
				console.log(`Uploaded chunk ${i + 1}/${totalChunks}`);
			}

			// Finalize upload
			const assetId = await actor.finalize_upload();
			console.log("Asset stored with ID:", assetId);
			return assetId;

		} catch (error) {
			console.error("Error uploading image:", error);
			throw error;
		}
	};

	return (
		<>
			<button onClick={() => {
				upload();
			}}>Sync </button>
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
