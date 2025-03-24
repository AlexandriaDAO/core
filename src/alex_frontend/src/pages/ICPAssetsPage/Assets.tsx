import React, { useEffect, useState } from "react";
import Item from "./Item";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useInternetIdentity } from "ic-use-internet-identity";
import { useAssetManager } from "@/hooks/useAssetManager";

const Assets: React.FC = () => {
	const { userAssetCanister } = useAppSelector((state) => state.assetManager);
	const { identity } = useInternetIdentity();
	const [assetList, setAssetList] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	// Use the custom hook to get the asset manager
	const assetManager = useAssetManager({
		canisterId: userAssetCanister ?? undefined,
		identity
	});

	useEffect(() => {
		if (!assetManager) return;

		const fetchAssets = async () => {
			setLoading(true);
			try {
				// Fetch assets directly using the assetManager from the hook
				const assets = await assetManager.list();

				// Filter assets starting with '/uploads/' if needed (or remove if not needed)
				const filteredAssets = assets
					// .filter(asset => asset.key.startsWith('/uploads/'))
					.sort((a, b) => Number(b.encodings[0].modified - a.encodings[0].modified));

				setAssetList(filteredAssets);
			} catch (error) {
				console.error("Failed to fetch assets:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchAssets();
	}, [assetManager]);

	if (loading) {
		return (
			<div className="mt-6 bg-muted p-8 text-center rounded-lg border">
				<p className="text-muted-foreground">Loading assets...</p>
			</div>
		);
	}

	if (!assetList || assetList.length === 0) {
		return (
			<div className="mt-6 bg-muted p-8 text-center rounded-lg border">
				<p className="text-muted-foreground">No assets found in your canister.</p>
			</div>
		);
	}

	return (
		<div className="mt-6">
			<h2 className="text-xl font-semibold mb-4">Assets on your canister</h2>
			<div className="flex flex-wrap -mx-2">
				{assetList.map((asset) => (
					<Item
						key={asset.key}
						asset={asset}
					/>
				))}
			</div>
		</div>
	);
};

export default Assets;
