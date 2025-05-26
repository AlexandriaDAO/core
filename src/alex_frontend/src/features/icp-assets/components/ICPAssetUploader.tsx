import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useIdentity } from "@/hooks/useIdentity";
import { useAssetManager } from "@/hooks/useAssetManager";
import upload from "../thunks/upload";
import { Input } from "@/lib/components/input";
import { Button } from "@/lib/components/button";

const ICPAssetUploader: React.FC = () => {
	const dispatch = useAppDispatch();
	const { canister } = useAppSelector((state) => state.auth);
	const {identity} = useIdentity();
	const [file, setFile] = useState<File | null>(null);
	const { uploading, percentage } = useAppSelector((state) => state.icpAssets);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setFile(e.target.files[0]);
		}
	};

	const assetManager = useAssetManager({
		canisterId: canister ?? undefined,
		identity
	});

	const handleUpload = async () => {
		if (!file || !assetManager) return;

		try {
			await dispatch(upload({ file, assetManager })).unwrap();
		} catch (error) {
			console.log('upload failed', error)
		} finally{
			setFile(null)
		}
	};

	return (
		<div className="bg-card p-6 rounded-lg shadow-sm border">
			<h2 className="text-xl font-semibold mb-4">Upload New Asset</h2>
			<div className="flex flex-col md:flex-row md:justify-center md:items-center gap-4">
				<Input
					type="file"
					onChange={handleFileChange}
					disabled={uploading}
					placeholder="Ideas worth sharing..."
					className="flex-grow border rounded cursor-pointer"
				/>
				<Button
					onClick={handleUpload}
					disabled={!file || uploading || !canister}
					variant="info"
				>
					Upload
				</Button>
			</div>

			{uploading && (
				<div className="mt-4">
					<p className="text-sm text-gray-600 mb-1">
						Uploading: {file?.name} ({Math.round(percentage)}%)
					</p>
					<div className="h-4 bg-secondary dark:bg-[#3A3630] rounded-full border dark:border-transparent overflow-hidden">
						{percentage > 0 && <div
							className="h-full bg-primary dark:bg-white rounded-full"
							style={{ width: `${percentage}%` }}
						/>}
					</div>
				</div>
			)}
		</div>
	);
};

export default ICPAssetUploader;