import React, { useEffect } from "react";
import AssetTable from "@/features/arweave-assets/components/AssetTable";
import AssetDetail from "@/features/arweave-assets/components/AssetDetail";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Button } from "@/lib/components/button";
import { Alert } from "@/components/Alert";
import { Link } from "@tanstack/react-router";
import { Download, RefreshCw } from "lucide-react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchUserArweaveAssets } from "@/features/arweave-assets/thunks/fetchUserArweaveAssets";
import { useAssetManager } from "@/hooks/useAssetManager";
import { useIdentity } from "@/lib/ic-use-identity";
import fetch from "@/features/icp-assets/thunks/fetch";
import { pullAllAssets } from "@/features/arweave-assets/thunks/pullAllAssets";

function ArweaveAssetsPage() {
	const dispatch = useAppDispatch();
	const { error, selected, pulling, pullError, loading } = useAppSelector(state => state.arweaveAssets);
	const { canister } = useAppSelector(state => state.auth);
	const { identity } = useIdentity();

	const icpAssets = useAppSelector((state) => state.icpAssets.assets);
	const arweaveAssets = useAppSelector((state) => state.arweaveAssets.assets);

	const assetManager = useAssetManager({
		canisterId: canister ?? undefined,
		identity,
		maxSingleFileSize: 1_900_000,
		maxChunkSize: 500_000,
	});

	useEffect(() => {
		if (!assetManager) return;
		dispatch(fetch({ assetManager }));
	}, [assetManager]);

	const handlePullAllAssets = () => {
		if(!assetManager) return;
		dispatch(pullAllAssets({ assetManager }));
	}

	const synced = ()=>{
		return arweaveAssets.every((asset) => icpAssets.find((icpAsset) => icpAsset.key === `/arweave/${asset.id}`))
	}

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

			{canister ? (
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

					{!synced() && 
						<Button
							onClick={handlePullAllAssets}
							disabled={!!pulling || loading}
							variant="info"
							scale="sm"
							className="mt-2"
						>
							{pulling ? (
								<>
									<div className="h-3 w-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-1" />
									Pulling - {pulling}
								</>
							) : (
								<>
									<Download className="h-3 w-3 mr-1" />
									Pull All Assets
								</>
							)}
						</Button>
					}

				</Alert>
			) : (
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

			{pullError && (
				<Alert variant="danger" title="Pull Error" className="mb-4">
					{pullError}
				</Alert>
			)}

			{error && (
				<Alert variant="danger" title="Error" className="mb-4">
					{error}
				</Alert>
			)}

			<AssetTable assetManager={assetManager} />

			{selected && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<AssetDetail asset={selected} assetManager={assetManager} />
				</div>
			)}
		</>
	);
}

export default ArweaveAssetsPage;
