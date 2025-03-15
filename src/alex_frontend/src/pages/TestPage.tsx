import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { uploadAsset } from "@/apps/Modules/shared/state/assetManager/uploadToAssetCanister";
import {
	getCallerAssetCanister,
	getAssetList,
	fetchAssetFromUserCanister,
} from "@/apps/Modules/shared/state/assetManager/assetManagerThunks";
import AssetManager from "@/apps/Modules/shared/components/AssetManager";
import { getActorUserAssetCanister } from "@/features/auth/utils/authUtils";

const TestPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const assetManager = useAppSelector((state) => state.assetManager);
	const [file, setFile] = useState<File | null>(null);
	const [uploadProgress, setUploadProgress] = useState({
		currentItem: "",
		progress: 0,
		totalSynced: 0,
		currentProgress: 0,
	});
	const [assetDetails, setAssetDetails] = useState<{[key: string]: any}>({});
	const [loadingAssets, setLoadingAssets] = useState<{[key: string]: boolean}>({});

	useEffect(() => {
		dispatch(getCallerAssetCanister());
	}, [dispatch]);

	useEffect(() => {
		if (assetManager.userAssetCanister) {
			dispatch(getAssetList(assetManager.userAssetCanister));
		}
	}, [assetManager.userAssetCanister, dispatch]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setFile(e.target.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!file || !assetManager.userAssetCanister) return;

		const reader = new FileReader();

		reader.onload = async () => {
			const fileData = reader.result as ArrayBuffer;
			const uint8Array = new Uint8Array(fileData);
			const contentData = Array.from(uint8Array).join(",");

			await uploadAsset({
				assetCanisterId: assetManager.userAssetCanister as string,
				id: file.name,
				contentData,
				syncProgress: uploadProgress,
				setSyncProgress: setUploadProgress,
				assetList: assetManager.assetList || [],
			});

			// Refresh asset list after upload
			dispatch(getAssetList(assetManager.userAssetCanister as string));
		};

		reader.readAsArrayBuffer(file);
	};

	const fetchAssetDetails = async (key: string) => {
		if (!assetManager.userAssetCanister) return;
		
		setLoadingAssets(prev => ({ ...prev, [key]: true }));
		
		try {
			const assetActor = await getActorUserAssetCanister(assetManager.userAssetCanister);
			
			// Get the raw asset data from the canister
			const rawResponse = await assetActor.get({
				key: key,
				accept_encodings: ["identity"],
			});
			
			// Store the raw response
			setAssetDetails(prev => ({
				...prev,
				[key]: rawResponse
			}));
		} catch (error) {
			console.error(`Error fetching details for ${key}:`, error);
		} finally {
			setLoadingAssets(prev => ({ ...prev, [key]: false }));
		}
	};

	const renderAssetList = () => {
		if (!assetManager.assetList || assetManager.assetList.length === 0) {
			return (
				<div className="mt-6 bg-gray-50 p-8 text-center rounded-lg border">
					<p className="text-gray-500">No assets found in your canister.</p>
				</div>
			);
		}

		return (
			<div className="mt-6">
				<h2 className="text-xl font-semibold mb-4">Raw Asset Data</h2>
				<div className="space-y-4">
					{assetManager.assetList.map((asset) => (
						<div key={asset.key} className="bg-white rounded-lg shadow-sm p-4 border">
							<div className="flex justify-between items-center mb-2">
								<h3 className="text-lg font-medium">{asset.key}</h3>
								{!assetDetails[asset.key] && (
									<button
										onClick={() => fetchAssetDetails(asset.key)}
										disabled={loadingAssets[asset.key]}
										className={`px-3 py-1 rounded text-sm ${
											loadingAssets[asset.key]
												? 'bg-gray-200 text-gray-500'
												: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
										}`}
									>
										{loadingAssets[asset.key] ? 'Loading...' : 'Load Raw Data'}
									</button>
								)}
							</div>
							
							<div className="mb-2">
								<span className="text-gray-500 text-sm">Content Type: </span>
								<span className="text-sm font-mono">{asset.content_type}</span>
							</div>
							
							{assetDetails[asset.key] ? (
								<div className="mt-3">
									<div className="bg-gray-100 p-3 rounded overflow-auto max-h-[400px]">
										<pre className="text-xs whitespace-pre-wrap break-all">
											{JSON.stringify(assetDetails[asset.key], (key, value) => {
												// Handle content arrays by summarizing them if they're large
												if (key === 'content' && Array.isArray(value) && value.length > 100) {
													return `[Array with ${value.length} items. First 100: ${JSON.stringify(value.slice(0, 100))}...]`;
												}
												return value;
											}, 2)}
										</pre>
									</div>
									
									{assetDetails[asset.key].content_type?.startsWith('image/') && (
										<div className="mt-3 border p-2 rounded">
											<p className="text-sm text-gray-500 mb-2">Image Preview:</p>
											<img 
												src={`data:${assetDetails[asset.key].content_type};base64,${btoa(String.fromCharCode.apply(null, assetDetails[asset.key].content))}`}
												alt={asset.key}
												className="max-w-full max-h-[200px] mx-auto"
												onError={(e) => {
													e.currentTarget.style.display = 'none';
													e.currentTarget.nextElementSibling?.classList.remove('hidden');
												}}
											/>
											<p className="hidden text-sm text-gray-500 mt-2 text-center">
												(Preview not available)
											</p>
										</div>
									)}
								</div>
							) : (
								<p className="text-sm text-gray-500 italic">
									Click "Load Raw Data" to view the complete asset information
								</p>
							)}
						</div>
					))}
				</div>
			</div>
		);
	};

	return (
		<div className="max-w-6xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">Asset Manager</h1>
			
			{!assetManager.userAssetCanister ? (
				<AssetManager />
			) : (
				<>
					<div className="bg-white p-6 rounded-lg shadow-sm border">
						<h2 className="text-xl font-semibold mb-4">Upload New Asset</h2>
						
						<div className="flex flex-col md:flex-row gap-4">
							<input 
								type="file" 
								onChange={handleFileChange}
								className="flex-1 border rounded p-2"
								disabled={uploadProgress.currentItem !== ""}
							/>
							<button 
								onClick={handleUpload} 
								disabled={!file || uploadProgress.currentItem !== ""}
								className={`px-6 py-2 rounded ${
									!file || uploadProgress.currentItem !== "" 
										? 'bg-gray-300 cursor-not-allowed' 
										: 'bg-blue-500 hover:bg-blue-600 text-white'
								}`}
							>
								Upload
							</button>
						</div>
						
						{uploadProgress.currentItem && (
							<div className="mt-4">
								<p className="text-sm text-gray-600 mb-1">
									Uploading: {uploadProgress.currentItem} ({uploadProgress.currentProgress}%)
								</p>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div 
										className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
										style={{ width: `${uploadProgress.currentProgress}%` }}
									/>
								</div>
							</div>
						)}
					</div>
					
					{renderAssetList()}
					
					<div className="mt-8 bg-gray-50 p-4 rounded-lg border">
						<h2 className="text-lg font-semibold mb-2">Asset Canister Information</h2>
						<p className="text-sm text-gray-600">
							Your Asset Canister ID: <span className="font-mono font-medium">{assetManager.userAssetCanister}</span>
						</p>
						<p className="text-sm text-gray-600 mt-2">
							Assets can only be accessed through canister calls. Direct URLs are not available.
						</p>
					</div>
				</>
			)}
		</div>
	);
};

export default TestPage;
