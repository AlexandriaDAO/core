import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { getCallerAssetCanister } from "@/apps/Modules/shared/state/assetManager/assetManagerThunks";
import Upload from "./Upload";
import Assets from "./Assets";
import AssetCanisterActor from "@/actors/AssetCanisterActor";
import { Alert } from "@/components/Alert";
import { Button } from "@/lib/components/button";
import { Link } from "react-router";

// Main Page Component
const ICPAssetsPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const { userAssetCanister } = useAppSelector((state) => state.assetManager);

	useEffect(() => {
		dispatch(getCallerAssetCanister());
	}, []);

	return (
		<div className="max-w-6xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">ICP Assets</h1>

			{!userAssetCanister ? (
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
			
			) : (
				<>
					<Upload />

					<div className="mt-8 bg-gray-50 p-4 rounded-lg border">
						<h2 className="text-lg font-semibold mb-2">Asset Canister Information</h2>
						<p className="text-sm text-gray-600">
							Your Asset Canister ID: <span className="font-mono font-medium">{userAssetCanister}</span>
						</p>
						<p className="text-sm text-gray-600 mt-2">
							Assets can only be accessed through canister calls. Direct URLs are not available.
						</p>
					</div>

					<AssetCanisterActor canisterId={userAssetCanister}>
						<Assets />
					</AssetCanisterActor>

				</>
			)}
		</div>
	);
};

export default ICPAssetsPage;
