import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { getAssetList } from "@/apps/Modules/shared/state/assetManager/assetManagerThunks";
import { syncProgressInterface } from "@/apps/Modules/shared/state/assetManager/assetManagerThunks";
import { toast } from 'sonner';
import { useInternetIdentity } from "ic-use-internet-identity/dist";
import { useAssetManager } from "@/hooks/useAssetManager";

const Upload: React.FC = () => {
	const dispatch = useAppDispatch();
	const { userAssetCanister } = useAppSelector((state) => state.assetManager);
	const {identity} = useInternetIdentity();
	const [file, setFile] = useState<File | null>(null);
	const [syncProgress, setSyncProgress] = useState<syncProgressInterface>({
		currentItem: "",
		currentProgress: 0,
		progress: 0,
		totalSynced: 0
	});
	const [isUploading, setIsUploading] = useState(false);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setFile(e.target.files[0]);
		}
	};

	const assetManager = useAssetManager({
		canisterId: userAssetCanister ?? undefined,
		identity
	});

	const handleUpload = async () => {
		if (!file || !assetManager) return;

		try {
			setIsUploading(true);

			// Setup initial progress
			const fileName = `/uploads/${file.name}`;
			setSyncProgress({
				currentItem: fileName,
				currentProgress: 0,
				progress: 0,
				totalSynced: 0
			});

			// Use AssetManager's batch upload which handles chunking
			const batch = assetManager.batch();
			const key = await batch.store(file, { path: '/uploads' });

			// Commit the batch with progress tracking
			await batch.commit({
				onProgress: ({current, total}: {current: number, total: number}) => {
					const progressPercent = (current / total) * 100;
					setSyncProgress(prev => ({
						...prev,
						currentProgress: progressPercent,
						progress: progressPercent
					}));
				}
			});

			if(userAssetCanister){
				// Update asset list after successful upload
				dispatch(getAssetList(userAssetCanister));
			}

			// Reset the form
			setFile(null);
			setSyncProgress({
				currentItem: "",
				currentProgress: 0,
				progress: 0,
				totalSynced: 0
			});

			toast.success(`Upload of "${fileName}" completed successfully.`);

		} catch (e) {
			console.error("Upload failed:", e);

			if (e instanceof Error && e.message?.includes('Caller does not have Prepare permission')) {
				toast.error("Authorization error: Caller does not have permission to upload");
			} else if (e instanceof Error) {
				toast.error(`Upload failed: ${e.message}`);
			} else {
				toast.error("Upload failed: Unknown error");
			}
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="bg-white p-6 rounded-lg shadow-sm border">
			<h2 className="text-xl font-semibold mb-4">Upload New Asset</h2>

			<div className="flex flex-col md:flex-row gap-4">
				<input
					type="file"
					onChange={handleFileChange}
					className="flex-1 border rounded p-2"
					disabled={isUploading}
				/>
				<button
					onClick={handleUpload}
					disabled={!file || isUploading || !userAssetCanister}
					className={`px-6 py-2 rounded ${
						!file || isUploading || !userAssetCanister
							? "bg-gray-300 cursor-not-allowed"
							: "bg-blue-500 hover:bg-blue-600 text-white"
					}`}
				>
					Upload
				</button>
			</div>

			{syncProgress.currentItem && (
				<div className="mt-4">
					<p className="text-sm text-gray-600 mb-1">
						Uploading: {syncProgress.currentItem.split('/').pop()} ({Math.round(syncProgress.currentProgress)}%)
					</p>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-500 h-2 rounded-full transition-all duration-300"
							style={{
								width: `${syncProgress.currentProgress}%`,
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default Upload;
