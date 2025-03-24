import React, { useEffect, useState } from "react";
import { selectAsset } from "@/features/assets/assetsSlice";
import AssetTable from "@/features/assets/components/AssetTable";
import AssetDetail from "@/features/assets/components/AssetDetail";
import { AssetItem } from "@/features/assets/types";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { getCallerAssetCanister } from "@/apps/Modules/shared/state/assetManager/assetManagerThunks";
import { Button } from "@/lib/components/button";
import { Alert } from "@/components/Alert";
import { Link } from "react-router";
import { RefreshCw } from "lucide-react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchUserArweaveAssets } from "@/features/assets/thunks/fetchUserArweaveAssets";

function ArweaveAssetsPage() {
	const dispatch = useAppDispatch();
	const { assets, loading, error, selectedAsset } = useAppSelector(
		(state) => state.assets
	);
	const { userAssetCanister } = useAppSelector((state) => state.assetManager);
	const [showDetail, setShowDetail] = useState(false);

	useEffect(() => {
		dispatch(fetchUserArweaveAssets());
		if (!userAssetCanister) {
			dispatch(getCallerAssetCanister());
		}
	}, [dispatch, userAssetCanister]);

	const handleSelectAsset = (asset: AssetItem) => {
		dispatch(selectAsset(asset));
		setShowDetail(true);
	};

	const handleCloseDetail = () => {
		setShowDetail(false);
		dispatch(selectAsset(null));
	};

	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Arweave Assets</h1>
				<Button 
					onClick={() => dispatch(fetchUserArweaveAssets())}
					variant="primary"
					className="flex items-center gap-2"
				>
					<RefreshCw className="h-4 w-4" />
					Refresh Assets
				</Button>
			</div>

			<Alert 
				title="Why Pull Assets to Your Canister?"
				className="mb-6"
			>
				<p className="mb-2">
					Assets stored on Arweave are permanent but can load slowly. By pulling assets to your own Internet Computer canister:
				</p>
				<ul className="list-disc list-inside mb-2 ml-4">
					<li>Loading times become much faster</li>
					<li>Your assets remain available even if Arweave has connectivity issues</li>
					<li>You maintain ownership and control over your assets</li>
				</ul>
				<p>
					Each asset only needs to be pulled once to your canister for faster access.
				</p>
			</Alert>

			{!userAssetCanister && (
				<Alert
					variant="warning"
					title="Asset Canister Required"
					className="mb-6"
				>
					<p className="mb-4">
						To pull and store your assets for faster loading, you need to create an asset canister first:
					</p>
					<Button
						variant="link"
						asChild
					>
						<Link to="/dashboard/settings">Go to Settings to Create Asset Canister</Link>
					</Button>
				</Alert>
			)}

			{error && (
				<Alert variant="danger" title="Error" className="mb-4">
					{error}
				</Alert>
			)}

			<AssetTable
				assets={assets}
				loading={loading}
				onSelectAsset={handleSelectAsset}
			/>

			{showDetail && selectedAsset && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<AssetDetail
						asset={selectedAsset}
						onClose={handleCloseDetail}
					/>
				</div>
			)}
		</>
	);
}

export default ArweaveAssetsPage;
