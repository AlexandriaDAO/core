import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import AssetCanisterActor from "@/actors/AssetCanisterActor";
import { Alert } from "@/components/Alert";
import { Button } from "@/lib/components/button";
import { Link } from "react-router";
import ICPAssetUploader from "@/features/icp-assets/components/ICPAssetUploader";
import ICPAssets from "@/features/icp-assets/components/ICPAssets";

// Main Page Component
const ICPAssetsPage: React.FC = () => {
	const { canister } = useAppSelector((state) => state.auth);

	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">ICP Assets</h1>
			</div>
			{!canister ? (
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
					<ICPAssetUploader />

					<div className="mt-8 bg-gray-50 p-4 rounded-lg border">
						<h2 className="text-lg font-semibold mb-2">Asset Canister Information</h2>
						<p className="text-sm text-gray-600">
							Your Asset Canister ID: <span className="font-mono font-medium">{canister}</span>
						</p>
						<p className="text-sm text-gray-600 mt-2">
							Assets can only be accessed through canister calls. Direct URLs are not available.
						</p>
					</div>

					<AssetCanisterActor canisterId={canister}>
						<ICPAssets />
					</AssetCanisterActor>
				</>
			)}
		</>
	);
};

export default ICPAssetsPage;
