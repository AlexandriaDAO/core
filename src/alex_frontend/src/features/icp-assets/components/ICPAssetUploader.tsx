import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useIdentity } from "@/hooks/useIdentity";
import { useAssetManager } from "@/hooks/useAssetManager";
import upload from "../thunks/upload";

const ICPAssetUploader: React.FC = () => {
	const dispatch = useAppDispatch();
	const { userAssetCanister } = useAppSelector((state) => state.assetManager);
	const {identity} = useIdentity();
	const [file, setFile] = useState<File | null>(null);
	const { uploading, percentage } = useAppSelector((state) => state.icpAssets);

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

		dispatch(upload({ file, assetManager }));
	};

	return (
		<div className="bg-white p-6 rounded-lg shadow-sm border">
			<h2 className="text-xl font-semibold mb-4">Upload New Asset</h2>

			<div className="flex flex-col md:flex-row gap-4">
				<input
					type="file"
					onChange={handleFileChange}
					className="flex-1 border rounded p-2"
					disabled={uploading}
				/>
				<button
					onClick={handleUpload}
					disabled={!file || uploading || !userAssetCanister}
					className={`px-6 py-2 rounded ${
						!file || uploading || !userAssetCanister
							? "bg-gray-300 cursor-not-allowed"
							: "bg-blue-500 hover:bg-blue-600 text-white"
					}`}
				>
					Upload
				</button>
			</div>

			{uploading && (
				<div className="mt-4">
					<p className="text-sm text-gray-600 mb-1">
						Uploading: {file?.name} ({Math.round(percentage)}%)
					</p>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-500 h-2 rounded-full transition-all duration-300"
							style={{
								width: `${percentage}%`,
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default ICPAssetUploader;