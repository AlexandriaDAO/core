import React, { useEffect } from "react";
import Item from "./Item";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useIdentity } from "@/hooks/useIdentity";
import { useAssetManager } from "@/hooks/useAssetManager";
import fetch from "@/features/icp-assets/thunks/fetch";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";

const ICPAssets: React.FC = () => {
	const dispatch = useAppDispatch();
	const { canister } = useAppSelector((state) => state.auth);
	const { identity } = useIdentity();
	const { assets, loading } = useAppSelector((state) => state.icpAssets);

	const assetManager = useAssetManager({
		canisterId: canister ?? undefined,
		identity,
	});

	useEffect(() => {
		if (!assetManager) return;
		dispatch(fetch({ assetManager }));
	}, [assetManager]);

	if (loading) {
		return (
			<div className="flex justify-center p-8 text-gray-500 dark:text-gray-400">
				<div className="flex flex-col items-center">
					<div className="h-8 w-8 border-4 border-gray-200 dark:border-gray-700 border-t-gray-500 dark:border-t-gray-400 rounded-full animate-spin mb-4"></div>
					<p>Loading assets...</p>
				</div>
			</div>
		);
	}

	if (!assets || assets.length <= 0) {
		return (
			<div className="mt-6 bg-muted p-8 text-center rounded-lg border">
				<p className="text-muted-foreground">No assets found in your canister.</p>
			</div>
		);
	}

	return (
		<div className="mt-6">
			<h2 className="text-xl font-semibold mb-4">Assets on your canister</h2>
			<div className="flex flex-wrap justify-start items-center gap-2">
				{assets.map((asset) => (
					<Item
						key={asset.key}
						asset={asset}
						assetManager={assetManager}
					/>
				))}
			</div>
		</div>
	);
};

export default ICPAssets;
