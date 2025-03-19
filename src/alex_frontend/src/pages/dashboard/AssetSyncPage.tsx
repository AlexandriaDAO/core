import React from "react";
import AssetManager from "@/apps/Modules/shared/components/AssetManager";

function AssetSyncPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ICP Asset Sync</h1>
      </div>
      <div className="font-roboto-condensed bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6 text-gray-600 dark:text-gray-300 font-roboto-condensed">
          Manage your Internet Computer Protocol asset canister and NFT synchronization
        </div>
        
        <div className="flex justify-center mt-4">
          <AssetManager />
        </div>
      </div>
    </>
  );
}

export default AssetSyncPage; 