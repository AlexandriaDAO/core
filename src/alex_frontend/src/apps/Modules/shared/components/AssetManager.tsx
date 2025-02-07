import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import React, { useEffect, useState } from 'react';
import { createAssetCanister, getCallerAssetCanister, getAssetList, syncNfts, syncProgressInterface } from '../state/assetManager/assetManagerThunks';
import {  LoaderPinwheel } from "lucide-react";
import { Button } from '@/lib/components/button';
import { Description, FiltersButton } from '@/apps/app/Permasearch/styles';

const AssetManager = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth);
  const nftData = useAppSelector((state) => state.nftData)
  const assetManager = useAppSelector((state) => state.assetManager);
  const [userAssetCanister, setUserAssetCanister] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<syncProgressInterface>({
    currentItem: "",
    progress: 0,       // Default progress
    totalSynced: 0,
    currentProgress: 0,
  });
  const createUserAssetCanister = () => {
    if (!user.user?.principal) return;
    dispatch(createAssetCanister({ userPrincipal: user.user.principal }))
  }
  const sync = () => {
    if (!user.user?.principal || !userAssetCanister) return;
    setSyncProgress({
      currentItem: "",
      progress: 0,
      totalSynced: 0,
      currentProgress: 0,
    })
    dispatch(syncNfts({
      userPrincipal: user.user.principal, syncProgress, setSyncProgress,
      userAssetCanister: userAssetCanister
    }))
  }

  useEffect(() => {
    setUserAssetCanister(assetManager.userAssetCanister);
    if (assetManager.userAssetCanister)
      dispatch(getAssetList(assetManager.userAssetCanister))
  }, [assetManager.userAssetCanister])
  useEffect(() => {
    dispatch(getCallerAssetCanister())
  }, [])


  return (<div className="border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 py-5 px-5 rounded-2xl absolute right-[50px] top-[150px] w-96">
    {userAssetCanister === null ? (
      <div className="p-6 max-w-md w-full text-center">
        <Description>Asset Canister</Description>
        <Button
          onClick={() => createUserAssetCanister()}
          disabled={assetManager.isLoading}
          className="bg-gray-900 border border-gray-900 text-white px-8 py-3 rounded-full hover:bg-[#454545] transition-colors mt-2     color: var(--brightyellow);
"
        >
          Create {assetManager.isLoading ? (
            <LoaderPinwheel className="animate-spin mr-2" />
          ) : null}
        </Button>
      </div>
    ) : (
      <div className="p-0 max-w-md w-full text-center">
        <Description>Asset Canister</Description>
        <p className="text-lg text-gray-600 mb-4">
          <span className="font-mono font-semibold text-[#7F8EA3]">{assetManager.userAssetCanister}</span>
        </p>
        <Button disabled={assetManager.isLoading} className="bg-[#353535] text-white px-8 py-3 rounded-full hover:bg-[#454545] transition-colors" onClick={() => { sync() }} >
          Sync  {assetManager.isLoading ? (
            <LoaderPinwheel className="animate-spin mr-2" />
          ) : null}
        </Button>
      </div>
    )}

    {syncProgress?.currentItem!="" && (
      <div className="w-full max-w-md space-y-3">
        <h1 className='text-xl'>Synced :{syncProgress.totalSynced}</h1>

        {/*  Current Item Being Processed */}
        <div className="text-sm text-gray-600 mb-2">
          {syncProgress.currentProgress === 100
            ? "Upload Complete"
            : `Uploading: ${syncProgress.currentItem}`}
        </div>

        {/*  Current NFT Upload Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${syncProgress.currentProgress ?? 0}%` }}
          />
        </div>

        {/*  Total Synced Progress Bar */}
        {
          <>
            <div className="text-sm text-gray-600">
              Total Synced: {syncProgress.totalSynced ?? 0} of  {nftData.totalNfts}
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${((syncProgress.totalSynced ?? 0) / nftData.totalNfts) * 100
                    }%`,
                }}
              />
            </div>
          </>
        }
      </div>
    )}


  </div>);
}
export default AssetManager;