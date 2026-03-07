import React from "react";
import AssetTable from "@/features/arweave-assets/components/AssetTable";
import AssetDetail from "@/features/arweave-assets/components/AssetDetail";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Button } from "@/lib/components/button";
import { Alert } from "@/components/Alert";
import { RefreshCw } from "lucide-react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchUserArweaveAssets } from "@/features/arweave-assets/thunks/fetchUserArweaveAssets";

function ArweaveAssetsPage() {
	const dispatch = useAppDispatch();
	const { error, selected } = useAppSelector(state => state.arweaveAssets);

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

			{error && (
				<Alert variant="danger" title="Error" className="mb-4">
					{error}
				</Alert>
			)}

			<AssetTable />

			{selected && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<AssetDetail asset={selected} />
				</div>
			)}
		</>
	);
}

export default ArweaveAssetsPage;
